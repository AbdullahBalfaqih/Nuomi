
'use client';

import React from 'react';
import {
    File,
    PlusCircle,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Upload,
    X,
    Trash2,
    Search,
    ListFilter
} from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/products';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCallback, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateReportHtml } from '@/lib/report-generator';
import PriceDisplay from '@/components/ui/price-display';

const ITEMS_PER_PAGE = 10;
const productCategories = ["مطابخ", "خزائن", "اكسسوارات مطابخ", "اكسسوارات خزائن", "ديكورات"] as const;

export default function ProductsPage() {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editingProduct, setEditingProduct] = React.useState<Partial<Product> | null>(null);
    const [isNewOrEditDialogOpen, setIsNewOrEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);

    // State for filtering
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');

    // Form state
    const [name, setName] = React.useState('');
    const [price, setPrice] = React.useState<number | ''>(0);
    const [stock, setStock] = React.useState<number | ''>(0);
    const [size, setSize] = React.useState('');
    const [model, setModel] = React.useState('');
    const [dimensions, setDimensions] = React.useState('');
    const [category, setCategory] = React.useState<Product['category']>('مطابخ');
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const { toast } = useToast();
    const supabase = getSupabaseBrowserClient();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            toast({ title: 'فشل في جلب المنتجات', description: error.message, variant: 'destructive' });
            setProducts([]);
        } else {
            setProducts(data as Product[]);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleExport = () => {
        const title = 'تقرير المنتجات';
        const columns = [
            { header: 'الاسم', dataKey: 'name' },
            { header: 'الفئة', dataKey: 'category' },
            { header: 'السعر', dataKey: 'price' },
            { header: 'المخزون', dataKey: 'stock' },
            { header: 'الموديل', dataKey: 'model' },
            { header: 'الحجم', dataKey: 'size' },
            { header: 'الأبعاد', dataKey: 'dimensions' },
        ];

        const dataToExport = filteredProducts.map(p => ({
            ...p,
            price: `ر.س ${p.price.toFixed(2)}`,
        }));

        const reportHtml = generateReportHtml(title, columns, dataToExport);
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Products_Report_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                // Category filter
                if (categoryFilter !== 'all' && product.category !== categoryFilter) {
                    return false;
                }
                // Search term filter
                if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
                return true;
            });
    }, [products, searchTerm, categoryFilter]);


    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter]);


    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const resetForm = () => {
        setName('');
        setPrice(0);
        setStock(0);
        setSize('');
        setModel('');
        setDimensions('');
        setCategory('مطابخ');
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleAddNewClick = () => {
        resetForm();
        setEditingProduct({});
        setIsNewOrEditDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setName(product.name);
        setPrice(product.price);
        setStock(product.stock);
        setSize(product.size);
        setModel(product.model);
        setDimensions(product.dimensions);
        setCategory(product.category);
        setImageFile(null);
        setImagePreview(product.imageUrl || null);
        setIsNewOrEditDialogOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        // First, delete the image from storage if it exists
        if (productToDelete.imageUrl) {
            const imageName = productToDelete.imageUrl.split('/').pop();
            if (imageName) {
                const { error: storageError } = await supabase.storage
                    .from('product_images')
                    .remove([imageName]);
                if (storageError) {
                    toast({
                        title: "خطأ في حذف الصورة!",
                        description: `فشل حذف الصورة: ${storageError.message}`,
                        variant: "destructive",
                    });
                }
            }
        }

        // Then, delete the product record from the database
        const { error } = await supabase.from('products').delete().match({ id: productToDelete.id });

        if (error) {
            toast({
                title: "خطأ!",
                description: `فشل حذف المنتج: ${error.message}`,
                variant: "destructive",
            });
        } else {
            fetchProducts();
            toast({
                title: "تم الحذف!",
                description: `تمت إزالة ${productToDelete.name}.`,
                variant: "default",
            });
        }
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const handleSaveProduct = async () => {
        if (!editingProduct) return;

        let finalImageUrl = editingProduct.imageUrl || null;

        if (imageFile) {
            const fileName = `${Date.now()}_${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product_images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                toast({ title: 'فشل رفع الصورة', description: uploadError.message, variant: 'destructive' });
                return;
            }

            const { data: urlData } = supabase.storage
                .from('product_images')
                .getPublicUrl(uploadData.path);

            finalImageUrl = urlData.publicUrl;
        }

        const isEditing = !!editingProduct.id;

        const productData = {
            name,
            price: price === '' ? 0 : price,
            stock: stock === '' ? 0 : stock,
            size,
            model,
            dimensions,
            category,
            imageUrl: finalImageUrl,
        };

        let error;
        if (isEditing) {
            const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .match({ id: editingProduct.id });
            error = updateError;

        } else {
            const { error: insertError } = await supabase
                .from('products')
                .insert(productData)
                .select()
                .single();
            error = insertError;
        }

        if (error) {
            console.error('DB Error:', error);
            toast({ title: isEditing ? 'فشل تحديث المنتج' : 'فشل إضافة المنتج', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: isEditing ? "تم تحديث المنتج" : "تمت إضافة المنتج", description: `تم حفظ ${name}.` });
            fetchProducts();
        }

        setIsNewOrEditDialogOpen(false);
        resetForm();
    };


    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">المنتجات</h1>
                    <p className="text-muted-foreground">
                        إدارة منتجاتك وعرض أداء مبيعاتها.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">
                            تصدير
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={handleAddNewClick}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">
                            إضافة منتج
                        </span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="البحث بالاسم..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span>
                                تصفية حسب الفئة
                                {categoryFilter !== 'all' && `: ${categoryFilter}`}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>اختر فئة</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={categoryFilter === 'all'}
                            onSelect={() => setCategoryFilter('all')}
                        >
                            الكل
                        </DropdownMenuCheckboxItem>
                        {productCategories.map((cat) => (
                            <DropdownMenuCheckboxItem
                                key={cat}
                                checked={categoryFilter === cat}
                                onSelect={() => setCategoryFilter(cat)}
                            >
                                {cat}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary/90">
                            <TableHead className="w-20 text-primary-foreground">الصورة</TableHead>
                            <TableHead className="text-primary-foreground">الاسم</TableHead>
                            <TableHead className="text-primary-foreground">الحالة</TableHead>
                            <TableHead className="hidden md:table-cell text-primary-foreground">السعر</TableHead>
                            <TableHead className="hidden md:table-cell text-primary-foreground">المخزون</TableHead>
                            <TableHead className="hidden lg:table-cell text-primary-foreground">الفئة</TableHead>
                            <TableHead className="hidden lg:table-cell text-primary-foreground">الموديل</TableHead>
                            <TableHead className="hidden lg:table-cell text-primary-foreground">الحجم</TableHead>
                            <TableHead className="hidden lg:table-cell text-primary-foreground">الأبعاد</TableHead>
                            <TableHead>
                                <span className="sr-only">الإجراءات</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : currentProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    {products.length > 0 ? 'لا توجد منتجات تطابق البحث.' : 'لم يتم العثور على منتجات.'}
                                </TableCell>
                            </TableRow>
                        ) : (currentProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">لا توجد صورة</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {product.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={product.stock > 0 ? 'default' : 'destructive'}
                                        className={product.stock > 0 ? 'bg-green-100 text-green-800 hover:bg-green-100/80' : ''}
                                    >
                                        {product.stock > 0 ? 'متوفر' : 'غير متوفر'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <PriceDisplay amount={product.price} />
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {product.stock}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{product.category}</TableCell>
                                <TableCell className="hidden lg:table-cell">{product.model}</TableCell>
                                <TableCell className="hidden lg:table-cell">{product.size}</TableCell>
                                <TableCell className="hidden lg:table-cell">{product.dimensions}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                aria-haspopup="true"
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">تبديل القائمة</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handleEditClick(product)}>تعديل</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteClick(product)}>
                                                <Trash2 className="ms-2 h-4 w-4" />
                                                حذف
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )))}
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

            <Dialog open={isNewOrEditDialogOpen} onOpenChange={setIsNewOrEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct?.id ? 'تعديل منتج' : 'إضافة منتج'}</DialogTitle>
                        <DialogDescription>
                            {editingProduct?.id ? "أجرِ تغييرات على منتجك هنا. انقر على 'حفظ' عند الانتهاء." : "أضف منتجًا جديدًا إلى الكتالوج الخاص بك. انقر على 'حفظ' عند الانتهاء."}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] -me-6 pe-6">
                        <div className="grid gap-6 py-4 pe-1">
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="image" className="text-right pt-2">صورة المنتج</Label>
                                <div className="col-span-3">
                                    <div {...getRootProps()} className={`relative w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'}`}>
                                        <input {...getInputProps()} />
                                        {imagePreview ? (
                                            <>
                                                <Image src={imagePreview} alt="معاينة المنتج" fill className="object-contain" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImageFile(null);
                                                        setImagePreview(editingProduct?.imageUrl || null);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground p-4">
                                                <Upload className="mx-auto h-8 w-8 mb-2" />
                                                <p className="text-sm">اسحب وأفلت صورة هنا، أو انقر للتحديد</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">الاسم</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">الفئة</Label>
                                <Select value={category} onValueChange={(value) => setCategory(value as Product['category'])}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="اختر فئة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">السعر</Label>
                                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">المخزون</Label>
                                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value))} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="model" className="text-right">الموديل</Label>
                                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="size" className="text-right">الحجم</Label>
                                <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dimensions" className="text-right">الأبعاد</Label>
                                <Input id="dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsNewOrEditDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSaveProduct}>حفظ التغييرات</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>هل أنت متأكد؟</DialogTitle>
                        <DialogDescription>
                            لن تتمكن من التراجع عن هذا الإجراء. سيتم حذف المنتج بشكل دائم.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">إلغاء</Button>
                        </DialogClose>
                        <Button
                            onClick={confirmDelete}
                            variant="destructive"
                        >
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
