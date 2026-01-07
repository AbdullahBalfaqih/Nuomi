
'use client';
import { useState, useEffect, useCallback, useTransition } from 'react';
import React from 'react';
import {
    File,
    ListFilter,
    ChevronDown,
    Trash2,
    CheckCircle,
    XCircle,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/orders';
import { generateReportHtml } from '@/lib/report-generator';
import PriceDisplay from '@/components/ui/price-display';
import { updateOrderStatus, deleteOrder } from './actions';


type OrderStatus = "مكتمل" | "مرفوض" | "قيد المعالجة" | "ملغي";

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const supabase = getSupabaseBrowserClient();
    const [isPending, startTransition] = useTransition();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: 'فشل جلب الطلبات', description: error.message, variant: 'destructive' });
        } else {
            setOrders(data as Order[]);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'processing') return order.status === 'قيد المعالجة';
        if (activeTab === 'fulfilled') return order.status === 'مكتمل';
        if (activeTab === 'declined') return order.status === 'مرفوض';
        if (activeTab === 'canceled') return order.status === 'ملغي';
        return true;
    });

    const handleExport = () => {
        const title = `تقرير الطلبات - ${activeTab === 'all' ? 'الكل' : filteredOrders[0]?.status || 'الحالي'}`;
        const columns = [
            { header: 'رقم الطلب', dataKey: 'id' },
            { header: 'العميل', dataKey: 'customer_name' },
            { header: 'الحالة', dataKey: 'status' },
            { header: 'التاريخ', dataKey: 'created_at' },
            { header: 'الإجمالي', dataKey: 'total' },
            { header: 'المنتجات', dataKey: 'items' },
        ];

        const dataToExport = filteredOrders.map(o => ({
            id: o.id.substring(0, 8) + '...',
            customer_name: `${o.customer_name}<br><small style="color: #6b7280;">${o.customer_email}</small>`,
            status: o.status,
            created_at: new Date(o.created_at).toLocaleDateString('ar-EG'),
            total: `ر.س ${o.total.toFixed(2)}`,
            items: o.items,
        }));

        const reportHtml = generateReportHtml(title, columns, dataToExport);
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orders_Report_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    }

    const toggleOrder = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);

            if (result.error) {
                toast({ title: 'فشل تحديث الحالة', description: result.error, variant: 'destructive' });
            } else {
                if (newStatus === 'مكتمل') {
                    toast({
                        title: `تمت الموافقة على الطلب`,
                        description: `تم تحديث حالة الطلب #${orderId.substring(0, 6)} إلى "مكتمل".`,
                        className: 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                    });
                } else if (newStatus === 'مرفوض' || newStatus === 'ملغي') {
                    toast({
                        title: `تم رفض/إلغاء الطلب`,
                        description: `تم تحديث حالة الطلب #${orderId.substring(0, 6)} إلى "${newStatus}".`,
                        variant: 'destructive'
                    });
                } else {
                    toast({
                        title: `تم تحديث حالة الطلب`,
                        description: `تم تحديث حالة الطلب #${orderId.substring(0, 6)} إلى "${newStatus}".`,
                    });
                }
                fetchOrders();
            }
        });
    };

    const handleDeleteClick = (orderId: string) => {
        setOrderToDelete(orderId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!orderToDelete) return;
        startTransition(async () => {
            const result = await deleteOrder(orderToDelete);

            if (result.error) {
                toast({
                    title: 'خطأ في الحذف!',
                    description: `فشل حذف الطلب: ${result.error}`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'تم الحذف!',
                    description: `تمت إزالة الطلب بنجاح.`,
                });
                fetchOrders();
            }
            setIsDeleteDialogOpen(false);
            setOrderToDelete(null);
        });
    };

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case 'مكتمل':
                return <Badge variant="default" className="bg-green-100 text-green-800">{status}</Badge>;
            case 'قيد المعالجة':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
            case 'مرفوض':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">{status}</Badge>;
            case 'ملغي':
                return <Badge variant="secondary">{status}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">الطلبات</h1>
                        <p className="text-muted-foreground">قائمة بجميع الطلبات الأخيرة من متجرك.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TabsList>
                            <TabsTrigger value="all">الكل</TabsTrigger>
                            <TabsTrigger value="processing">قيد المعالجة</TabsTrigger>
                            <TabsTrigger value="fulfilled">مكتمل</TabsTrigger>
                            <TabsTrigger value="declined">مرفوض</TabsTrigger>
                            <TabsTrigger value="canceled">ملغي</TabsTrigger>
                        </TabsList>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        تصفية
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>تصفية حسب</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => handleTabChange('fulfilled')}>مكتمل</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleTabChange('processing')}>قيد المعالجة</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleTabChange('declined')}>مرفوض</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleTabChange('canceled')}>ملغي</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                تصدير
                            </span>
                        </Button>
                    </div>
                </div>
                <TabsContent value={activeTab}>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary hover:bg-primary/90">
                                    <TableHead className="w-12 text-primary-foreground"></TableHead>
                                    <TableHead className="w-[100px] text-primary-foreground">الطلب</TableHead>
                                    <TableHead className="text-primary-foreground">العميل</TableHead>
                                    <TableHead className="hidden sm:table-cell text-primary-foreground">الحالة</TableHead>
                                    <TableHead className="hidden md:table-cell text-primary-foreground">التاريخ</TableHead>
                                    <TableHead className="text-right text-primary-foreground">الإجمالي</TableHead>
                                    <TableHead className="text-center text-primary-foreground">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : currentOrders.length > 0 ? (
                                    currentOrders.map((order) => (
                                        <React.Fragment key={order.id}>
                                            <TableRow>
                                                <TableCell>
                                                    <Button size="icon" variant="ghost" onClick={() => toggleOrder(order.id)}>
                                                        {expandedOrder === order.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">#{order.id.substring(0, 6)}...</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{order.customer_name}</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        {order.customer_email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    {getStatusBadge(order.status)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <PriceDisplay amount={order.total} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="icon" variant="ghost" disabled={isPending}>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                                            <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'مكتمل')}>
                                                                <CheckCircle className="ms-2 h-4 w-4 text-green-500" /> موافقة
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleStatusChange(order.id, 'مرفوض')}>
                                                                <XCircle className="ms-2 h-4 w-4 text-red-500" /> رفض
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onSelect={() => handleDeleteClick(order.id)} className="text-destructive">
                                                                <Trash2 className="ms-2 h-4 w-4" /> حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            {expandedOrder === order.id && (
                                                <TableRow>
                                                    <TableCell colSpan={7}>
                                                        <div className="p-4 bg-muted/50 rounded-lg">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                <div className="space-y-2">
                                                                    <h4 className="font-semibold">عنوان الشحن</h4>
                                                                    <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <h4 className="font-semibold">العناصر</h4>
                                                                    <ul className="text-sm text-muted-foreground list-disc ps-4 space-y-1">
                                                                        {order.items.map((item: any) => (
                                                                            <li key={item.id}>{item.quantity}x {item.name} (<PriceDisplay amount={item.price} />)</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <h4 className="font-semibold">إثبات الشراء</h4>
                                                                    {order.proof_of_purchase_url && (
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <Button variant="outline">عرض الإثبات</Button>
                                                                            </DialogTrigger>
                                                                            <DialogContent className="sm:max-w-md">
                                                                                <DialogHeader>
                                                                                    <DialogTitle>إثبات للطلب #{order.id.substring(0, 6)}</DialogTitle>
                                                                                </DialogHeader>
                                                                                <div className="relative aspect-[3/4] w-full mt-4 rounded-md overflow-hidden">
                                                                                    <Image src={order.proof_of_purchase_url} alt={`Proof for ${order.id}`} fill className="object-contain" />
                                                                                </div>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            لم يتم العثور على طلبات.
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
                </TabsContent>
            </Tabs>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>هل أنت متأكد؟</DialogTitle>
                        <DialogDescription>
                            لن تتمكن من التراجع عن هذا الإجراء. سيتم حذف الطلب بشكل دائم.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">إلغاء</Button>
                        </DialogClose>
                        <Button
                            onClick={confirmDelete}
                            variant="destructive"
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : 'حذف'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
