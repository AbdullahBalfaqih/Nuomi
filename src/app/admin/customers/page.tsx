'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle, File, MoreHorizontal, Eye, EyeOff, ChevronRight, ChevronLeft, Trash2, Loader2, ShieldCheck, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUser, updateUser, deleteUser, getUsers, type Customer } from './actions';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateReportHtml } from '@/lib/report-generator';

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const result = await getUsers();

    if (result.error) {
        toast({ title: 'فشل في جلب العملاء', description: result.error, variant: 'destructive' });
        setCustomers([]);
    } else if (result.data) {
        setCustomers(result.data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleExport = () => {
    const title = 'تقرير العملاء';
    const columns = [
        { header: 'الاسم', dataKey: 'name' },
        { header: 'البريد الإلكتروني', dataKey: 'email' },
        { header: 'اسم المستخدم', dataKey: 'username' },
        { header: 'الدور', dataKey: 'role' },
        { header: 'الهاتف', dataKey: 'phone' },
        { header: 'المدينة', dataKey: 'city' },
        { header: 'العنوان', dataKey: 'address' },
    ];
    
    const reportHtml = generateReportHtml(title, columns, customers);
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Customers_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleAddNewClick = () => {
    setEditingCustomer({});
    setIsFormOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    startTransition(async () => {
        const result = await deleteUser(customerToDelete.id);

        if (result.error) {
            toast({
                title: 'خطأ في الحذف!',
                description: `فشل حذف المستخدم: ${result.error}`,
                variant: "destructive",
            });
        } else {
            toast({
                title: 'تم الحذف!',
                description: `تمت إزالة سجل ${customerToDelete.name}.`,
            });
            fetchCustomers(); // Refetch to update the list
        }
        setIsDeleteDialogOpen(false);
        setCustomerToDelete(null);
    });
  };
  
  const handleSaveCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    if (editingCustomer?.id) { // Editing existing customer
        startTransition(async () => {
            const result = await updateUser(editingCustomer.id!, formData);
            if (result.error) {
                 toast({ title: 'فشل التحديث', description: result.error, variant: 'destructive' });
            } else {
                 toast({ title: 'تم الحفظ!', description: `تم تحديث العميل.`, variant: 'default' });
                 fetchCustomers();
                 setIsFormOpen(false);
                 setEditingCustomer(null);
            }
        });
    } else { // Adding new customer
        if (!password) {
            toast({ title: 'خطأ', description: 'يرجى إدخال كلمة مرور للعميل الجديد', variant: 'destructive' });
            return;
        }
        startTransition(async () => {
            const result = await createUser(formData);
            if(result.error) {
                toast({ title: 'فشل الإنشاء', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: 'تم الحفظ!', description: `تم إضافة العميل.`, variant: 'default' });
                fetchCustomers();
                setIsFormOpen(false);
                setEditingCustomer(null);
            }
        });
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">العملاء</h1>
          <p className="text-muted-foreground">
            إدارة عملائك وعرض تفاصيلهم.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">تصدير</span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={handleAddNewClick}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">إضافة عميل</span>
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary/90">
              <TableHead className="text-primary-foreground">العميل</TableHead>
              <TableHead className="hidden sm:table-cell text-primary-foreground">الدور</TableHead>
              <TableHead className="hidden md:table-cell text-primary-foreground">الهاتف</TableHead>
              <TableHead className="hidden md:table-cell text-primary-foreground">المدينة</TableHead>
              <TableHead className="hidden lg:table-cell text-primary-foreground">العنوان</TableHead>
              <TableHead>
                <span className="sr-only">الإجراءات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
            ) : currentCustomers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        لم يتم العثور على عملاء.
                    </TableCell>
                </TableRow>
            ) : (
                currentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={customer.avatar} alt="Avatar" />
                        <AvatarFallback>
                            {customer.name
                            ?.split(' ')
                            ?.map((n) => n[0])
                            ?.join('') || ''}
                        </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {customer.email}
                        </p>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                         <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                            {customer.role === 'admin' ? 
                                <ShieldCheck className="me-1 h-3.5 w-3.5" /> : 
                                <User className="me-1 h-3.5 w-3.5" />
                            }
                            {customer.role === 'admin' ? 'مشرف' : 'عميل'}
                         </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.city}</TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.address}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">تبديل القائمة</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditClick(customer)}>تعديل</DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onSelect={() => handleDeleteClick(customer)}
                        >
                            <Trash2 className="ms-2 h-4 w-4" />
                            حذف
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer?.id ? 'تعديل عميل' : 'إضافة عميل جديد'}</DialogTitle>
            <DialogDescription>
              {editingCustomer?.id ? 'قم بتحديث تفاصيل العميل أدناه.' : 'املأ النموذج لإضافة عميل جديد.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCustomer}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">الاسم</Label>
                <Input id="name" name="name" defaultValue={editingCustomer?.name} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">اسم المستخدم</Label>
                <Input id="username" name="username" defaultValue={editingCustomer?.username} className="col-span-3" required/>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">الدور</Label>
                  <Select name="role" defaultValue={editingCustomer?.role || 'customer'}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر دورًا" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">عميل</SelectItem>
                      <SelectItem value="admin">مشرف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">كلمة المرور</Label>
                <Input id="password" name="password" type="password" placeholder={editingCustomer?.id ? 'اتركه فارغًا لعدم التغيير' : ''} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">الهاتف</Label>
                <Input id="phone" name="phone" defaultValue={editingCustomer?.phone} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">المدينة</Label>
                <Input id="city" name="city" defaultValue={editingCustomer?.city} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">العنوان</Label>
                <Input id="address" name="address" defaultValue={editingCustomer?.address} className="col-span-3" required/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : 'حفظ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>هل أنت متأكد؟</DialogTitle>
            <DialogDescription>
              لن تتمكن من التراجع عن هذا الإجراء. سيتم حذف العميل بشكل دائم.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</Button>
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
  );
}
