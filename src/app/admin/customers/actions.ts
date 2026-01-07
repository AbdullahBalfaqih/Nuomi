
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'customer';

export interface Customer {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  phone: string;
  city: string;
  address: string;
  role: UserRole;
}

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

export async function getUsers(): Promise<{ data?: Customer[]; error?: string }> {
    try {
        const supabaseAdmin = createSupabaseAdminClient();
        const { data: authUsersResponse, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) {
            console.error('Supabase list users error:', authError);
            return { error: authError.message };
        }

        const authUsers = authUsersResponse.users;
        const userIds = authUsers.map(u => u.id);

        // Fetch users from the public.users table
        const { data: dbUsers, error: dbError } = await supabaseAdmin
            .from('users')
            .select('id, username, phone, city, address, role')
            .in('id', userIds);
            
        if (dbError) {
            console.error('Supabase get users from DB error:', dbError);
            // Don't fail completely, we can still show auth users
        }

        const dbUsersMap = new Map((dbUsers || []).map(u => [u.id, u]));

        const combinedUsers = authUsers.map(user => {
            const dbUser = dbUsersMap.get(user.id);
            // The role from user_metadata is the source of truth if the public.users table is out of sync
            const role = user.user_metadata?.role || dbUser?.role || 'customer';

            return {
                id: user.id,
                name: user.user_metadata?.name || 'لا يوجد اسم',
                email: user.email || '',
                username: dbUser?.username || user.user_metadata?.username || user.email?.split('@')[0] || '',
                avatar: user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/40/40`,
                phone: dbUser?.phone || user.user_metadata?.phone || 'N/A',
                city: dbUser?.city || user.user_metadata?.city || 'N/A',
                address: dbUser?.address || user.user_metadata?.address || 'N/A',
                role: role
            };
        });

        return { data: combinedUsers as Customer[] };

    } catch (e: any) {
        return { error: e.message };
    }
}


export async function createUser(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  const role = (formData.get('role') as UserRole) || 'customer';
  
  if (!email || !password || !name) {
    return { error: 'الاسم والبريد الإلكتروني وكلمة المرور حقول مطلوبة.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, username, phone, city, address, role },
  });

  if (authError) {
    console.error('Supabase admin auth error:', authError);
    return { error: authError.message };
  }

  if (authData.user) {
      const { error: dbError } = await supabaseAdmin.from('users').insert({
          id: authData.user.id,
          username: username,
          email: email,
          name: name,
          phone: phone,
          city: city,
          address: address,
          role: role,
      });

      if (dbError) {
          console.error('Supabase DB insert error:', dbError);
          // If inserting into our public table fails, we should roll back the auth user creation
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          return { error: `فشل إنشاء سجل المستخدم في قاعدة البيانات: ${dbError.message}` };
      }
  }


  revalidatePath('/admin/customers');
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  const role = (formData.get('role') as UserRole) || 'customer';


  const supabaseAdmin = createSupabaseAdminClient();
  
  const userMetadata: {[key: string]: any} = {};
  if (name) userMetadata.name = name;
  if (username) userMetadata.username = username;
  if (phone) userMetadata.phone = phone;
  if (city) userMetadata.city = city;
  if (address) userMetadata.address = address;
  if (role) userMetadata.role = role;
  
  const updatePayload: any = { user_metadata: userMetadata };
  if (email) {
    updatePayload.email = email;
  }
  
  const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    updatePayload
  );

  if (metadataError) {
    console.error('Supabase metadata update error:', metadataError);
    return { error: metadataError.message };
  }

  // Upsert into the public.users table to ensure the record exists or is updated.
  const dbUpsertPayload: {[key: string]: any} = { id: userId };
    if (name) dbUpsertPayload.name = name;
    if (username) dbUpsertPayload.username = username;
    if (email) dbUpsertPayload.email = email;
    if (phone) dbUpsertPayload.phone = phone;
    if (city) dbUpsertPayload.city = city;
    if (address) dbUpsertPayload.address = address;
    if (role) dbUpsertPayload.role = role;

  const { error: dbError } = await supabaseAdmin.from('users').upsert(dbUpsertPayload);


  if (dbError) {
      console.error('Supabase DB upsert error:', dbError);
      return { error: `فشل تحديث/إنشاء سجل المستخدم في قاعدة البيانات: ${dbError.message}` };
  }
  
  if (password) {
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      userId, { password }
    );
     if (passwordError) {
        console.error('Supabase password update error:', passwordError);
        return { error: passwordError.message };
    }
  }

  revalidatePath('/admin/customers');
  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success?: boolean; error?: string }> {
  const supabaseAdmin = createSupabaseAdminClient();
  
  // First, delete from the public.users table
  const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', userId);
  if (dbError) {
    console.error('Supabase DB delete error:', dbError);
    // Do not fail if the user is not in the public table, just log it.
    console.warn(`Could not delete user ${userId} from public.users, they might not exist there.`)
  }

  // Then, delete from the auth schema
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    console.error('Supabase auth delete user error:', authError);
    // Potentially re-insert the user row if auth deletion fails? For now, just report.
    return { error: `فشل حذف مستخدم المصادقة: ${authError.message}. قد تحتاج إلى حذف يدوي.` };
  }
  
  revalidatePath('/admin/customers');
  return { success: true };
}

    