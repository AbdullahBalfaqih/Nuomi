
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const createSupabaseAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('YOUR_SERVICE_ROLE_KEY')) {
        throw new Error('متغيرات بيئة Supabase غير مكونة بشكل صحيح.');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

export async function createAdminUser(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;
  const username = email.split('@')[0];

  if (!email || !password || !displayName) {
    return { error: 'يرجى ملء جميع الحقول.' };
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    
    // 1. Create the user in Auth with 'admin' role in metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm user
      user_metadata: { name: displayName, username: username, role: 'admin' },
    });

    if (authError) throw authError;
    
    if (!authData.user) {
        return { error: 'فشل في إنشاء مستخدم المصادقة.'};
    }

    // 2. Insert the user into the public.users table (best-effort)
    const { error: dbError } = await supabaseAdmin.from('users').upsert({
        id: authData.user.id,
        username: username,
        email: email,
        name: displayName,
        role: 'admin',
    }, { onConflict: 'id' });

    if (dbError) {
        console.error('Supabase DB insert/upsert error (non-critical):', dbError);
    }
    
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}


export async function createSignedUploadUrl(path: string): Promise<{ data?: { path: string; token: string; }; error?: string; }> {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    
    const { data, error } = await supabaseAdmin.storage
      .from('order_proofs')
      .createSignedUploadUrl(path);

    if (error) throw error;

    return { data };
  } catch (e: any) {
      return { error: e.message };
  }
}

export async function getSettings(): Promise<{ data?: { key: string, value: string | null }[]; error?: string }> {
    try {
      const supabaseAdmin = createSupabaseAdminClient();
      const { data, error } = await supabaseAdmin.from('settings').select('key, value');
      if (error) throw error;
      return { data };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function saveStoreDetails(formData: FormData, logoFile: File | null, currencySymbolFile: File | null): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabaseAdmin = createSupabaseAdminClient();

        const settingsToUpdate = [
            { key: 'store_name', value: formData.get('store_name') as string },
            { key: 'currency_code', value: formData.get('currency_code') as string },
            { key: 'currency_symbol', value: formData.get('currency_symbol') as string },
        ];
        
        // Handle logo upload
        if (logoFile) {
            const logoPath = `public/${Date.now()}_${logoFile.name}`;
            const { error: uploadError } = await supabaseAdmin.storage.from('product_images').upload(logoPath, logoFile, {
                upsert: true
            });
            if (uploadError) throw new Error(`فشل رفع الشعار: ${uploadError.message}`);
            const { data: urlData } = supabaseAdmin.storage.from('product_images').getPublicUrl(logoPath);
            settingsToUpdate.push({ key: 'logo_url', value: urlData.publicUrl });
        }

        // Handle currency symbol upload
        if (currencySymbolFile) {
            const symbolPath = `public/${Date.now()}_${currencySymbolFile.name}`;
            const { error: uploadError } = await supabaseAdmin.storage.from('product_images').upload(symbolPath, currencySymbolFile, {
                upsert: true
            });
            if (uploadError) throw new Error(`فشل رفع رمز العملة: ${uploadError.message}`);
            const { data: urlData } = supabaseAdmin.storage.from('product_images').getPublicUrl(symbolPath);
            settingsToUpdate.push({ key: 'currency_symbol_image_url', value: urlData.publicUrl });
        }

        // Upsert all settings
        const { error: upsertError } = await supabaseAdmin.from('settings').upsert(settingsToUpdate, { onConflict: 'key' });

        if (upsertError) {
            throw new Error(`فشل حفظ الإعدادات: ${upsertError.message}`);
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function exportData(): Promise<{ data?: string; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    const [
      { data: users, error: usersError },
      { data: products, error: productsError },
      { data: orders, error: ordersError },
      { data: settings, error: settingsError },
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('products').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('settings').select('*'),
    ]);

    if (usersError) throw usersError;
    if (productsError) throw productsError;
    if (ordersError) throw ordersError;
    if (settingsError) throw settingsError;

    const backupData = {
      users,
      products,
      orders,
      settings,
      exportedAt: new Date().toISOString(),
    };

    return { data: JSON.stringify(backupData, null, 2) };
  } catch (e: any) {
    console.error("Export error:", e);
    return { error: e.message };
  }
}

export async function importData(jsonData: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const backupData = JSON.parse(jsonData);
        const { users, products, orders, settings } = backupData;

        if (!users || !products || !orders || !settings) {
            return { error: 'ملف النسخ الاحتياطي غير صالح أو تالف.' };
        }

        const supabase = createSupabaseAdminClient();

        // Use a transaction to ensure atomicity
        // Note: Supabase JS client doesn't directly support transactions like this.
        // This is a sequential execution. For true transactions, a DB function is needed.
        // But for this use case, sequential is acceptable.

        // 1. Clear existing data
        // The order matters due to foreign key constraints if they were enforced on DB level.
        // Here, orders depend on users, so delete orders first.
        await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('settings').delete().neq('id', -1);
        // We cannot delete auth users this way. We only manage the public.users table.
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // 2. Insert new data
        if (users.length > 0) {
            const { error } = await supabase.from('users').insert(users);
            if (error) throw new Error(`فشل استيراد المستخدمين: ${error.message}`);
        }
         if (products.length > 0) {
            const { error } = await supabase.from('products').insert(products);
            if (error) throw new Error(`فشل استيراد المنتجات: ${error.message}`);
        }
         if (orders.length > 0) {
            const { error } = await supabase.from('orders').insert(orders);
            if (error) throw new Error(`فشل استيراد الطلبات: ${error.message}`);
        }
         if (settings.length > 0) {
            const { error } = await supabase.from('settings').insert(settings);
            if (error) throw new Error(`فشل استيراد الإعدادات: ${error.message}`);
        }
        
        revalidatePath('/', 'layout'); // Revalidate everything
        return { success: true };

    } catch (e: any) {
        console.error("Import error:", e);
        return { error: e.message };
    }
}
