
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useAuthContext } from '@/auth/context';
import { useRouter } from 'next/navigation';
import { getMyOrders, Order } from '@/lib/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Logo from '@/components/logo';
import PriceDisplay from '@/components/ui/price-display';

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    if (user !== undefined) {
      setIsCheckingAuth(false);
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        const fetchOrders = async () => {
          if (!user?.id) return;
          setLoading(true);
          const result = await getMyOrders(user.id);
          if (result.error) {
            toast({ title: 'فشل في جلب الطلبات', description: result.error, variant: 'destructive' });
          } else {
            setAllOrders(result.orders || []);
          }
          setLoading(false);
        };
        fetchOrders();
      }
    }
  }, [isAuthenticated, user, router, toast]);

  const handleGenerateReport = () => {
    const userDisplayName = user?.user_metadata?.name || user?.email || 'مستخدم';
    
    const tableRows = allOrders.map(order => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-family: monospace; font-size: 12px;">${order.id.substring(0, 8)}...</td>
            <td style="padding: 12px;">${formatDate(order.created_at)}</td>
            <td style="padding: 12px;">
                <span style="padding: 4px 8px; font-size: 12px; font-weight: 600; border-radius: 9999px;
                    background-color: ${order.status === 'مكتمل' ? '#d1fae5' : order.status === 'قيد المعالجة' ? '#dbeafe' : '#fee2e2'};
                    color: ${order.status === 'مكتمل' ? '#065f46' : order.status === 'قيد المعالجة' ? '#1e40af' : '#991b1b'};
                ">
                    ${order.status}
                </span>
            </td>
            <td style="padding: 12px; text-align: left; font-weight: 600;">${order.total.toFixed(2)} ر.س</td>
        </tr>
    `).join('');

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <title>تقرير الطلبات</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
              body {
                  font-family: 'Tajawal', sans-serif;
                  background-color: #f3f4f6;
                  margin: 0;
                  padding: 2rem;
              }
              .report-container {
                  max-width: 800px;
                  margin: auto;
                  background-color: white;
                  padding: 3rem;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
              }
              header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  padding-bottom: 2rem;
                  border-bottom: 1px solid #e5e7eb;
              }
              header h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.25rem;
                font-weight: bold;
                color: #16a085;
              }
              .company-info h2 {
                font-family: 'Playfair Display', serif;
                font-weight: bold;
                color: #374151;
                margin: 0;
              }
              .company-info p {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0;
              }
              section {
                  margin: 2rem 0;
              }
              h3 {
                  font-family: 'Playfair Display', serif;
                  font-size: 1.125rem;
                  font-weight: bold;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 0.5rem;
                  margin-bottom: 1rem;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  text-align: right;
              }
              th, td {
                  padding: 0.75rem;
              }
              thead {
                  background-color: #16a085;
                  color: white;
              }
              footer {
                  text-align: center;
                  font-size: 0.75rem;
                  color: #9ca3af;
                  margin-top: 3rem;
                  padding-top: 1rem;
                  border-top: 1px solid #e5e7eb;
              }
          </style>
      </head>
      <body>
          <div class="report-container">
              <header>
                  <div class="company-info">
                      <h2>NUOMI</h2>
                      <p>شركة تصميم وديكور داخلي فاخر</p>
                      <p>123 الشارع الرئيسي, أوستن, تكساس 78701</p>
                  </div>
                  <h1>تقرير الطلبات</h1>
              </header>
              <section>
                  <h3>بيانات العميل</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
                      <div><strong>الاسم:</strong> ${userDisplayName}</div>
                      <div><strong>البريد الإلكتروني:</strong> ${user?.email}</div>
                      <div><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-EG')}</div>
                  </div>
              </section>
              <section>
                  <h3>سجل الطلبات</h3>
                  <table>
                      <thead>
                          <tr>
                              <th style="padding: 12px;">رقم الطلب</th>
                              <th style="padding: 12px;">التاريخ</th>
                              <th style="padding: 12px;">الحالة</th>
                              <th style="padding: 12px; text-align: left;">الإجمالي</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${tableRows}
                      </tbody>
                  </table>
              </section>
              <footer>
                  &copy; ${new Date().getFullYear()} NUOMI. جميع الحقوق محفوظة.
              </footer>
          </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Order_Report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const totalPages = Math.ceil(allOrders.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentOrders = allOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  if (isCheckingAuth || !isAuthenticated) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">جاري تحميل ملف المستخدم...</p>
            </div>
        </div>
    );
  }

  const userDisplayName = user?.user_metadata?.name || user?.email || 'مستخدم';
  const userAvatarFallback = userDisplayName.charAt(0).toUpperCase();

  return (
    <div className="bg-secondary min-h-screen">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-24 sm:py-32">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-4">
                 <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl">{userAvatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{userDisplayName}</h1>
                    <p className="text-muted-foreground">مرحباً بعودتك إلى لوحة التحكم الخاصة بك.</p>
                </div>
            </div>
             <Button onClick={handleGenerateReport} disabled={allOrders.length === 0}>
                <FileDown className="me-2 h-4 w-4" />
                إنشاء تقرير
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل الطلبات</CardTitle>
            <CardDescription>قائمة بجميع مشترياتك السابقة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary/90">
                    <TableHead className="w-[150px] text-primary-foreground">رقم الطلب</TableHead>
                    <TableHead className="text-primary-foreground">التاريخ</TableHead>
                    <TableHead className="text-primary-foreground">الحالة</TableHead>
                    <TableHead className="text-primary-foreground">العناصر</TableHead>
                    <TableHead className="text-left text-primary-foreground">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : currentOrders.length > 0 ? (
                    currentOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                           <Badge 
                              variant={order.status === 'مكتمل' ? 'default' : order.status === 'قيد المعالجة' ? 'secondary' : 'destructive'}
                              className={order.status === 'مكتمل' ? 'bg-green-100 text-green-800' : order.status === 'قيد المعالجة' ? 'bg-blue-100 text-blue-800' : ''}
                          >
                              {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            {order.items.map((item: any) => (
                              <li key={item.id}>{item.quantity}x {item.name}</li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-left">
                          <PriceDisplay amount={order.total} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        لم تقم بتقديم أي طلبات بعد.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             {totalPages > 1 && (
                <div className="flex items-center justify-center pt-6 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                        السابق
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        صفحة {currentPage} من {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
