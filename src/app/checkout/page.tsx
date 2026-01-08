
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lock, Loader2, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/app/layout';
import { useAuthContext } from '@/auth/context';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/orders';
import { createSignedUploadUrl } from '@/app/admin/settings/actions';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import PriceDisplay from '@/components/ui/price-display';

const checkoutSchema = z.object({
    firstName: z.string().min(1, 'الاسم الأول مطلوب'),
    lastName: z.string().min(1, 'اسم العائلة مطلوب'),
    email: z.string().email('عنوان بريد إلكتروني غير صالح'),
    address: z.string().min(1, 'العنوان مطلوب'),
    city: z.string().min(1, 'المدينة مطلوبة'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuthContext();
    const router = useRouter();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setProofFile(file);
            setProofPreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            city: '',
        },
    });

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            const metadata = user.user_metadata;
            const nameParts = metadata.name?.split(' ') || ['', ''];
            form.reset({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                address: metadata.address || '',
                city: metadata.city || '',
            });
        }
    }, [isMounted, user, form]);

    const onSubmit = (values: CheckoutFormValues) => {
        if (!user) {
            toast({ title: 'فشل إرسال الطلب', description: 'المستخدم غير مصادق عليه. يرجى تسجيل الدخول مرة أخرى.', variant: 'destructive' });
            return;
        }
        startTransition(async () => {
            let proofUrl = null;

            if (proofFile) {
                const path = `${user?.id}/${Date.now()}_${proofFile.name}`;

                // 1. Get signed URL from server
                const signedUrlResult = await createSignedUploadUrl(path);
                if (signedUrlResult.error || !signedUrlResult.data) {
                    toast({ title: 'فشل الحصول على رابط الرفع', description: signedUrlResult.error, variant: 'destructive' });
                    return;
                }

                const { token } = signedUrlResult.data;
                const supabase = getSupabaseBrowserClient();

                // 2. Upload file to storage using the token
                const { error: uploadError } = await supabase.storage
                    .from('order_proofs')
                    .uploadToSignedUrl(path, token, proofFile);

                if (uploadError) {
                    toast({ title: 'فشل رفع إثبات الدفع', description: uploadError.message, variant: 'destructive' });
                    return;
                }

                // 3. Get public URL
                const { data: urlData } = supabase.storage
                    .from('order_proofs')
                    .getPublicUrl(path);

                proofUrl = urlData.publicUrl;
            }

            const orderData = {
                userId: user.id,
                customerName: `${values.firstName} ${values.lastName}`,
                customerEmail: values.email,
                shippingAddress: `${values.address}, ${values.city}`,
                total: total.toString(),
                items: JSON.stringify(items.map(item => {
                    const { imageUrl, ...rest } = item;
                    return rest;
                })),
                proofOfPurchaseUrl: proofUrl,
            };

            const result = await createOrder(orderData);

            if (result.error || !result.order) {
                toast({
                    title: 'فشل إرسال الطلب',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'تم إرسال الطلب بنجاح!',
                    description: 'شكرًا لك، تم استلام طلبك وسنتواصل معك قريبًا.',
                    className: 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                });

                // Prepare WhatsApp message
                const customerName = result.order.customer_name;
                const orderTotal = result.order.total;
                const orderId = result.order.id.substring(0, 8);
                const itemsList = result.order.items.map(item => `- ${item.quantity}x ${item.name}`).join('\n');

                const message = `
*طلب جديد من متجر NUOMI* ✨

مرحباً، تم استلام طلب جديد.

*رقم الطلب:* ${orderId}

*تفاصيل العميل:*
*الاسم:* ${customerName}
*البريد الإلكتروني:* ${result.order.customer_email}
*عنوان الشحن:* ${result.order.shipping_address}

*المنتجات المطلوبة:*
${itemsList}

*إجمالي الطلب:* ${orderTotal.toFixed(2)} ر.س

${result.order.proof_of_purchase_url ? `*إثبات الدفع:* ${result.order.proof_of_purchase_url}` : ''}

الرجاء مراجعة الطلب في لوحة التحكم.
`.trim();

                const whatsappUrl = `https://wa.me/966550376786?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');

                clearCart();
                router.push('/profile');
            }
        });
    };

    const total = subtotal;

    if (!isMounted) {
        return null;
    }

    return (
        <div className="bg-secondary">
            <Header />
            <main className="container mx-auto px-4 md:px-6 py-24 sm:py-32">
                <div className="mb-8">
                    <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowRight className="me-2 h-4 w-4" />
                        العودة إلى الكتالوج
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    <div className="bg-background p-8 rounded-lg shadow-md h-fit sticky top-24 lg:order-last">
                        <h2 className="text-2xl font-semibold mb-6">ملخص الطلب</h2>
                        <div className="space-y-6">
                            {items.length > 0 ? (
                                items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="relative w-20 h-24 rounded-md bg-secondary overflow-hidden">
                                            {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                                        </div>
                                        <PriceDisplay amount={item.price * item.quantity} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center">سلتك فارغة.</p>
                            )}
                        </div>
                        <Separator className="my-6" />
                        <div className="space-y-3 text-base">
                            <div className="flex justify-between">
                                <span>المجموع الفرعي</span>
                                <PriceDisplay amount={subtotal} />
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي</span>
                                <PriceDisplay amount={total} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
                                            معلومات الشحن
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField name="firstName" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>الاسم الأول</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name="lastName" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>اسم العائلة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name="email" control={form.control} render={({ field }) => (
                                            <FormItem className="sm:col-span-2"><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name="address" control={form.control} render={({ field }) => (
                                            <FormItem className="sm:col-span-2"><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name="city" control={form.control} render={({ field }) => (
                                            <FormItem className="sm:col-span-2"><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>إثبات الدفع</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div {...getRootProps()} className={`relative w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'}`}>
                                            <input {...getInputProps()} />
                                            {proofPreview ? (
                                                <>
                                                    <Image src={proofPreview} alt="معاينة إثبات الدفع" fill className="object-contain" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProofFile(null);
                                                            setProofPreview(null);
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="text-center text-muted-foreground p-4">
                                                    <Upload className="mx-auto h-8 w-8 mb-2" />
                                                    <p className="text-sm">اسحب وأفلت صورة هنا، أو انقر للتحديد</p>
                                                    <p className="text-xs text-muted-foreground/80 mt-1">اختياري</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button type="submit" size="lg" className="w-full" disabled={items.length === 0 || isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            إتمام الطلب مقابل <PriceDisplay amount={total} imageClassName="h-5 w-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
