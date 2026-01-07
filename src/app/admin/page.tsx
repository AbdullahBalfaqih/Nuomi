
'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, ShoppingCart, Activity, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, LabelList } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { getAnalyticsData } from './analytics/actions';
import PriceDisplay from '@/components/ui/price-display';

const lineChartConfig = {
  sales: {
    label: "المبيعات",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAnalyticsData();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
      return (
        <div className="text-center text-destructive">
            <p>فشل في تحميل بيانات لوحة التحكم:</p>
            <p>{error}</p>
        </div>
      );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <PriceDisplay amount={data.totalRevenue} className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground">
              من جميع الطلبات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عملاء جدد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              آخر 30 يومًا
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
             <p className="text-xs text-muted-foreground">
              +{data.newOrders} في آخر 30 يومًا
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتج الأكثر مبيعًا</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{data.bestSellingProduct.name}</div>
            <p className="text-xs text-muted-foreground">
             {data.bestSellingProduct.sales} وحدة مباعة
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>الطلبات الأخيرة</CardTitle>
            <CardDescription>
              قائمة بأحدث 5 طلبات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary/90">
                  <TableHead className="text-primary-foreground">العميل</TableHead>
                  <TableHead className="text-primary-foreground">الحالة</TableHead>
                  <TableHead className="text-right text-primary-foreground">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            {order.customer_email}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'مكتمل' ? 'default' : order.status === 'قيد المعالجة' ? 'secondary' : 'destructive'} className={order.status === 'مكتمل' ? 'bg-green-100 text-green-800' : order.status === 'قيد المعالجة' ? 'bg-blue-100 text-blue-800' : ''}>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <PriceDisplay amount={order.total} />
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعًا</CardTitle>
            <CardDescription>أفضل 5 منتجات أداءً.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ sales: { label: 'المبيعات' } }} className="h-[200px] w-full">
               <BarChart data={data.topProducts} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} className="text-xs" width={80} reversed/>
                    <XAxis type="number" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" radius={4} fill="hsl(var(--primary))">
                         <LabelList dataKey="sales" position="right" offset={8} className="fill-foreground text-xs" />
                    </Bar>
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>المبيعات عبر الزمن</CardTitle>
            <CardDescription>اتجاهات الإيرادات خلال الأسبوع الماضي.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
              <LineChart
                data={data.salesOverTime}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} />
                <YAxis tickFormatter={(val) => `${data.currencySymbol || 'ر.س'}${(val / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => <PriceDisplay amount={value as number} />} />} />
                <ChartLegend />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
