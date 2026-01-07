
'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, LabelList } from 'recharts';
import { TrendingUp, DollarSign, Users, Package, ShoppingCart, File, Loader2 } from 'lucide-react';
import { WorldMap } from '@/components/ui/world-map';
import { Button } from '@/components/ui/button';
import { generateReportHtml } from '@/lib/report-generator';
import { getAnalyticsData } from './actions';
import PriceDisplay from '@/components/ui/price-display';


const barChartConfig = {
  sales: { label: 'المبيعات' },
} satisfies ChartConfig;

const lineChartConfig = {
  sales: {
    label: "المبيعات",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function AnalyticsPage() {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR', // Use SAR for formatting
      minimumFractionDigits: 2,
    }).format(value).replace('SAR', data?.currencySymbol || 'ر.س');
  };

  const handleExport = () => {
    if (!data) return;

    const summaryColumns = [
        { header: 'المقياس', dataKey: 'metric' },
        { header: 'القيمة', dataKey: 'value' },
    ];
    const summaryData = [
        { metric: 'إجمالي الإيرادات', value: formatCurrency(data.totalRevenue) },
        { metric: 'عملاء جدد (آخر 30 يوم)', value: `+${data.newCustomers}` },
        { metric: 'طلبات جديدة (آخر 30 يوم)', value: `+${data.newOrders}` },
        { metric: 'المنتج الأكثر مبيعًا', value: `${data.bestSellingProduct.name} (${data.bestSellingProduct.sales} وحدة)` },
    ];
    const summaryHtml = generateReportHtml('ملخص الإحصائيات', summaryColumns, summaryData);

    const topProductsColumns = [{header: 'المنتج', dataKey: 'name'}, {header: 'المبيعات (وحدة)', dataKey: 'sales'}];
    const topProductsHtml = generateReportHtml('المنتجات الأكثر مبيعًا', topProductsColumns, data.topProducts);
    
    const salesOverTimeColumns = [{header: 'التاريخ', dataKey: 'date'}, {header: 'المبيعات', dataKey: 'sales'}];
    const salesOverTimeData = data.salesOverTime.map((d: any) => ({ ...d, sales: formatCurrency(d.sales) }));
    const salesOverTimeHtml = generateReportHtml('المبيعات عبر الزمن', salesOverTimeColumns, salesOverTimeData);

    const blob = new Blob([summaryHtml, topProductsHtml, salesOverTimeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analytics_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
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
            <p>فشل في تحميل بيانات التحليلات:</p>
            <p>{error}</p>
        </div>
      );
  }


  return (
    <>
    <div className="flex justify-between items-center mb-4">
        <div>
             <h1 className="text-2xl font-bold">التحليلات</h1>
             <p className="text-muted-foreground">نظرة عميقة على أداء متجرك.</p>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">تصدير</span>
        </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <PriceDisplay amount={data.totalRevenue} className="text-2xl font-bold" />
          <p className="text-xs text-muted-foreground flex items-center">
            {/* Trend data would require historical comparison */}
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
          <p className="text-xs text-muted-foreground flex items-center">
             آخر 30 يومًا
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{data.newOrders}</div>
           <p className="text-xs text-muted-foreground flex items-center">
             آخر 30 يومًا
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المنتج الأكثر مبيعًا</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{data.bestSellingProduct.name}</div>
          <p className="text-xs text-muted-foreground">
            {data.bestSellingProduct.sales} وحدة مباعة
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>المبيعات عبر الزمن</CardTitle>
            <CardDescription>نظرة على إيرادات متجرك خلال الأسبوع الماضي.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
              <LineChart
                data={data.salesOverTime}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} />
                <YAxis tickFormatter={(val) => `${data.currencySymbol || 'ر.س'}${val > 1000 ? (val / 1000) + 'k' : val}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value, name, props) => <PriceDisplay amount={value as number} />} />} />
                <ChartLegend />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
      </Card>

      <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعًا</CardTitle>
            <CardDescription>أفضل منتجاتك أداءً.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                <BarChart data={data.topProducts} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} className="text-xs" width={100} reversed/>
                    <XAxis type="number" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" radius={4} fill="hsl(var(--primary))">
                         <LabelList dataKey="sales" position="right" offset={8} className="fill-foreground text-xs" />
                    </Bar>
                </BarChart>
            </ChartContainer>
          </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>المبيعات حسب المنطقة</CardTitle>
          <CardDescription>
            خريطة عالمية توضح أماكن عملائك.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <WorldMap data={data.mapData} />
        </CardContent>
      </Card>
    </div>
    </>
  );
}
