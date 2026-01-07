
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

type OrderStatus = 'مكتمل' | 'مرفوض' | 'قيد المعالجة' | 'ملغي';

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

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<{ success?: boolean; error?: string }> {
    const supabase = createSupabaseAdminClient();

    try {
        // If the order is being marked as 'fulfilled', decrease the stock
        if (newStatus === 'مكتمل') {
            // 1. Fetch the order items and its current status
            const { data: order, error: fetchError } = await supabase
                .from('orders')
                .select('items, status')
                .eq('id', orderId)
                .single();
            
            if (fetchError || !order) {
                throw new Error(`فشل في العثور على الطلب: ${fetchError?.message}`);
            }

            // Only decrement stock if the order is NOT already 'مكتمل'
            if (order.status !== 'مكتمل') {
                 // 2. For each item, call a database function to decrement stock
                const stockUpdatePromises = order.items.map((item: any) => {
                    return supabase.rpc('decrement_product_stock', {
                        p_id: item.id,
                        p_quantity: item.quantity
                    });
                });

                const results = await Promise.all(stockUpdatePromises);
                const stockUpdateError = results.find(res => res.error);

                if (stockUpdateError) {
                    // Throw a more specific error
                    throw new Error(`فشل تحديث المخزون: ${stockUpdateError.error.message}`);
                }
            }
        }
        
        // 3. Update the order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (updateError) {
            throw new Error(`فشل تحديث حالة الطلب: ${updateError.message}`);
        }

        revalidatePath('/admin/orders');
        return { success: true };
    } catch(e: any) {
        console.error('Error in updateOrderStatus:', e.message);
        // The error message from the try block (e.g. "فشل تحديث المخزون: ...") will be returned to the client
        return { error: e.message };
    }
}


export async function deleteOrder(orderId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = createSupabaseAdminClient();
    try {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) throw error;
        
        revalidatePath('/admin/orders');
        return { success: true };

    } catch (e: any) {
        return { error: e.message };
    }
}
