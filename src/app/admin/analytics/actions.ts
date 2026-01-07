
'use server';

import { createClient } from '@supabase/supabase-js';

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

export async function getAnalyticsData() {
    const supabase = createSupabaseAdminClient();

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


        // 1. Fetch all data in parallel
        const [
            { data: orders, error: ordersError },
            { data: users, error: usersError },
            { data: settings, error: settingsError }
        ] = await Promise.all([
            supabase.from('orders').select('id, total, created_at, items, shipping_address, customer_name, customer_email, status').order('created_at', { ascending: false }),
            supabase.from('users').select('created_at, city'),
            supabase.from('settings').select('key, value')
        ]);

        if (ordersError) throw ordersError;
        if (usersError) throw usersError;
        if (settingsError) throw settingsError;

        const settingsMap = new Map(settings.map(s => [s.key, s.value]));
        const currencySymbol = settingsMap.get('currency_symbol') || 'ر.س';

        // Filter for fulfilled orders for revenue and sales calculations
        const fulfilledOrders = orders.filter(order => order.status === 'مكتمل');

        // 2. Process data
        const totalRevenue = fulfilledOrders.reduce((acc, order) => acc + order.total, 0);
        
        const totalCustomers = users.length;
        const newCustomersLast30Days = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length;
        
        const totalOrders = orders.length; // Total orders including all statuses
        const newOrdersLast30Days = orders.filter(o => new Date(o.created_at) > thirtyDaysAgo).length;

        // Sales over time (last 7 days) from fulfilled orders
        const salesOverTime = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                date: d.toISOString().split('T')[0],
                sales: 0
            };
        }).reverse();

        fulfilledOrders.filter(o => new Date(o.created_at) > sevenDaysAgo).forEach(order => {
            const orderDate = new Date(order.created_at).toISOString().split('T')[0];
            const dayData = salesOverTime.find(d => d.date === orderDate);
            if (dayData) {
                dayData.sales += order.total;
            }
        });

        // Top selling products from fulfilled orders
        const productSales: { [key: string]: { name: string; sales: number } } = {};
        fulfilledOrders.forEach(order => {
            order.items.forEach((item: any) => {
                if (productSales[item.id]) {
                    productSales[item.id].sales += item.quantity;
                } else {
                    productSales[item.id] = { name: item.name, sales: item.quantity };
                }
            });
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
        
        const bestSellingProduct = topProducts.length > 0 ? topProducts[0] : { name: 'لا يوجد', sales: 0 };

        // Sales by region (using user city)
        const salesByRegion: { [key: string]: { code: string; value: number } } = {};
        users.forEach(user => {
            if (user.city) {
                // This is a simplified mapping. A real implementation would need a more robust city-to-country mapping.
                // For now, we'll assume cities are unique and map them to arbitrary country codes.
                const countryCode = user.city.substring(0, 2).toUpperCase(); // Dummy code
                if (salesByRegion[user.city]) {
                    salesByRegion[user.city].value += 1;
                } else {
                    salesByRegion[user.city] = { code: countryCode, value: 1 };
                }
            }
        });
        const mapData = Object.entries(salesByRegion).map(([country, data]) => ({ country, ...data }));

        const recentOrders = orders.slice(0, 5);


        return {
            totalRevenue,
            newCustomers: newCustomersLast30Days,
            totalOrders,
            newOrders: newOrdersLast30Days,
            bestSellingProduct,
            salesOverTime,
            topProducts,
            mapData,
            recentOrders,
            currencySymbol
        };

    } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        return { error: error.message };
    }
}
