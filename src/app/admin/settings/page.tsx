
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { createAdminUser, getSettings, saveStoreDetails, exportData, importData } from './actions';
import { Loader2, Upload, X, Download, UploadCloud, AlertTriangle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface Setting {
    key: string;
    value: string | null;
}

export default function SettingsPage() {
    const { toast } = useToast();
    const [isExporting, startExportTransition] = useTransition();
    const [isImporting, startImportTransition] = useTransition();
    const [isUserPending, startUserTransition] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();

    const [settings, setSettings] = useState<Map<string, string | null>>(new Map());
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [currencySymbolFile, setCurrencySymbolFile] = useState<File | null>(null);
    const [currencySymbolPreview, setCurrencySymbolPreview] = useState<string | null>(null);
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const importFileRef = useRef<File | null>(null);
    
    // Notification states
    const [newOrdersNotification, setNewOrdersNotification] = useState(true);
    const [lowStockNotification, setLowStockNotification] = useState(false);
    const [newsletterNotification, setNewsletterNotification] = useState(true);

    const handleNotificationChange = (type: 'newOrders' | 'lowStock' | 'newsletter', checked: boolean) => {
        let title = '';
        switch(type) {
            case 'newOrders':
                setNewOrdersNotification(checked);
                title = checked ? 'تم تفعيل إشعارات الطلبات الجديدة' : 'تم تعطيل إشعارات الطلبات الجديدة';
                break;
            case 'lowStock':
                setLowStockNotification(checked);
                title = checked ? 'تم تفعيل تنبيهات انخفاض المخزون' : 'تم تعطيل تنبيهات انخفاض المخزون';
                break;
            case 'newsletter':
                setNewsletterNotification(checked);
                title = checked ? 'تم تفعيل إشعارات الاشتراك في النشرة الإخبارية' : 'تم تعطيل إشعارات الاشتراك في النشرة الإخبارية';
                break;
        }
        toast({ title });
    };


    const onLogoDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }, []);
    const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({ onDrop: onLogoDrop, accept: { 'image/*': [] }, multiple: false });

    const onCurrencySymbolDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setCurrencySymbolFile(file);
            setCurrencySymbolPreview(URL.createObjectURL(file));
        }
    }, []);
    const { getRootProps: getCurrencySymbolRootProps, getInputProps: getCurrencySymbolInputProps } = useDropzone({ onDrop: onCurrencySymbolDrop, accept: { 'image/*': ['.svg', '.png'] }, multiple: false });

    const fetchSettings = useCallback(async () => {
        const result = await getSettings();
        if (result.error) {
            toast({ title: 'فشل جلب الإعدادات', description: result.error, variant: 'destructive' });
        } else if (result.data) {
            const settingsMap = new Map(result.data.map(s => [s.key, s.value]));
            setSettings(settingsMap);
            setLogoPreview(settingsMap.get('logo_url') || null);
            setCurrencySymbolPreview(settingsMap.get('currency_symbol_image_url') || null);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleExport = () => {
      startExportTransition(async () => {
        const result = await exportData();
        if (result.error || !result.data) {
          toast({ title: "فشل تصدير البيانات", description: result.error, variant: "destructive" });
        } else {
          const blob = new Blob([result.data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nuomi-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast({ title: "تم تصدير البيانات", description: "تم تنزيل ملف النسخة الاحتياطية بنجاح." });
        }
      });
    };

    const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importFileRef.current = file;
            setShowImportConfirm(true);
        }
    };

    const confirmImport = () => {
      if (!importFileRef.current) return;
      
      const file = importFileRef.current;
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        startImportTransition(async () => {
          const result = await importData(content);
          if (result.error) {
            toast({ title: "فشل استيراد البيانات", description: result.error, variant: "destructive" });
          } else {
            toast({ title: "نجح الاستيراد!", description: "تمت استعادة بيانات متجرك بنجاح." });
            fetchSettings(); // Refresh settings after import
          }
        });
      };
      
      reader.readAsText(file);
      setShowImportConfirm(false);
      importFileRef.current = null;
    };


    const handleCreateAdmin = (formData: FormData) => {
        startUserTransition(async () => {
            const result = await createAdminUser(formData);
             if (result?.error) {
                toast({
                    title: "فشل إنشاء المستخدم",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "تم إنشاء المستخدم بنجاح",
                    description: `تم إنشاء حساب المشرف الجديد.`,
                });
            }
        });
    }

     const handleSaveDetails = (formData: FormData) => {
        startSavingTransition(async () => {
            const result = await saveStoreDetails(formData, logoFile, currencySymbolFile);
            if (result.error) {
                toast({ title: 'فشل حفظ الإعدادات', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: 'تم الحفظ!', description: 'تم تحديث إعدادات متجرك بنجاح.' });
                await fetchSettings(); // Refresh settings after save
            }
        });
    };

  return (
    <>
    <Tabs defaultValue="store" className="flex flex-col md:flex-row-reverse gap-8">
        <TabsList className="flex flex-col h-auto items-stretch bg-transparent p-0 border-s ps-4">
            <TabsTrigger value="store" className="justify-start w-full">تفاصيل المتجر</TabsTrigger>
            <TabsTrigger value="shipping" className="justify-start w-full">الشحن</TabsTrigger>
            <TabsTrigger value="payments" className="justify-start w-full">المدفوعات</TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start w-full">الإشعارات</TabsTrigger>
            <TabsTrigger value="database" className="justify-start w-full">قاعدة البيانات</TabsTrigger>
            <TabsTrigger value="integrations" className="justify-start w-full">التكاملات</TabsTrigger>
        </TabsList>
        
        <div className="flex-1">
            <TabsContent value="store">
              <form action={handleSaveDetails}>
                <Card>
                  <CardHeader>
                      <CardTitle>تفاصيل المتجر</CardTitle>
                      <CardDescription>قم بتحديث اسم متجرك والشعار والعملة ومعلومات الاتصال.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-2">
                          <Label htmlFor="store_name">اسم المتجر</Label>
                          <Input id="store_name" name="store_name" defaultValue={settings.get('store_name') || 'NUOMI'} />
                      </div>

                      <div className="space-y-2">
                        <Label>شعار المتجر</Label>
                        <div {...getLogoRootProps()} className="relative w-full h-40 rounded-md bg-muted flex items-center justify-center border-2 border-dashed cursor-pointer">
                            <input {...getLogoInputProps()} />
                            {logoPreview ? (
                                <>
                                    <Image src={logoPreview} alt="معاينة الشعار" fill className="object-contain p-4" />
                                     <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 rounded-full z-10 bg-background/50 hover:bg-background/80"
                                        onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground p-4"><Upload className="mx-auto h-8 w-8 mb-2"/><p className="text-sm">اسحب وأفلت صورة هنا، أو انقر للتحديد</p></div>
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="currency_code">عملة المتجر</Label>
                            <Select name="currency_code" defaultValue={settings.get('currency_code') || 'SAR'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAR">ريال سعودي - SAR</SelectItem>
                                    <SelectItem value="USD">دولار أمريكي - USD</SelectItem>
                                    <SelectItem value="EUR">يورو - EUR</SelectItem>
                                    <SelectItem value="GBP">جنيه إسترليني - GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="currency_symbol">رمز العملة (نص)</Label>
                            <Input id="currency_symbol" name="currency_symbol" placeholder="ر.س" defaultValue={settings.get('currency_symbol') || ''} />
                        </div>
                      </div>

                       <div className="space-y-2">
                        <Label>صورة رمز العملة (SVG, PNG)</Label>
                        <div {...getCurrencySymbolRootProps()} className="relative w-40 h-20 rounded-md bg-muted flex items-center justify-center border-2 border-dashed cursor-pointer">
                            <input {...getCurrencySymbolInputProps()} />
                            {currencySymbolPreview ? (
                                <>
                                    <Image src={currencySymbolPreview} alt="معاينة رمز العملة" fill className="object-contain p-2" />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full z-10 bg-background/50 hover:bg-background/80"
                                        onClick={(e) => { e.stopPropagation(); setCurrencySymbolFile(null); setCurrencySymbolPreview(null); }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground p-2"><Upload className="mx-auto h-6 w-6 mb-1"/><p className="text-xs">اسحب وأفلت</p></div>
                            )}
                        </div>
                      </div>
                       <Button type="submit" disabled={isSaving}>
                          {isSaving ? <><Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
                       </Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            
            <TabsContent value="shipping">
                <Card>
                <CardHeader>
                    <CardTitle>الشحن</CardTitle>
                    <CardDescription>إدارة مناطق الشحن والأسعار الخاصة بك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Card>
                     <CardHeader className="flex flex-row items-center justify-between">
                       <div>
                         <p className="font-medium">الشحن المحلي</p>
                         <p className="text-sm text-muted-foreground">داخل المملكة</p>
                       </div>
                       <Button variant="outline">تعديل</Button>
                     </CardHeader>
                     <CardContent>
                       <p>سعر ثابت: 30.00 ر.س.</p>
                       <p>شحن مجاني للطلبات فوق 500 ر.س.</p>
                     </CardContent>
                   </Card>
                   <Card>
                     <CardHeader className="flex flex-row items-center justify-between">
                       <div>
                         <p className="font-medium">الشحن لدول الخليج</p>
                         <p className="text-sm text-muted-foreground">الإمارات، الكويت، البحرين، عمان، قطر</p>
                       </div>
                       <Button variant="outline">تعديل</Button>
                     </CardHeader>
                     <CardContent>
                       <p>سعر ثابت: 80.00 ر.س.</p>
                     </CardContent>
                   </Card>
                   <Button>إضافة منطقة شحن</Button>
                </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="payments">
                <Card>
                    <CardHeader>
                        <CardTitle>مقدمو خدمات الدفع</CardTitle>
                        <CardDescription>ربط وإدارة مقدمي خدمات الدفع الخاصة بك.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">Stripe</span>
                                <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>
                            </div>
                            <Button variant="outline">إدارة</Button>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">PayPal</span>
                            <Badge variant="secondary">متاحة عند الطلب</Badge>
                            </div>
                            <Button variant="outline" disabled>توصيل</Button>
                        </Card>
                        <Card className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">Apple Pay</span>
                            <Badge variant="secondary">متاحة عند الطلب</Badge>
                            </div>
                            <Button variant="outline" disabled>توصيل</Button>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>الإشعارات</CardTitle>
                  <CardDescription>إدارة كيفية تلقي الإشعارات.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="new-orders" className="flex flex-col space-y-1">
                      <span>طلبات جديدة</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        تلقي بريد إلكتروني لكل طلب جديد.
                      </span>
                    </Label>
                    <Switch 
                        id="new-orders" 
                        checked={newOrdersNotification} 
                        onCheckedChange={(checked) => handleNotificationChange('newOrders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="low-stock" className="flex flex-col space-y-1">
                      <span>تنبيهات انخفاض المخزون</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        الحصول على إشعار عندما يكون المنتج منخفضًا في المخزون.
                      </span>
                    </Label>
                    <Switch 
                        id="low-stock" 
                        checked={lowStockNotification}
                        onCheckedChange={(checked) => handleNotificationChange('lowStock', checked)}
                    />
                  </div>
                   <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="newsletter-signup" className="flex flex-col space-y-1">
                      <span>اشتراك في النشرة الإخبارية</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        تلقي إشعار عند اشتراك مستخدم جديد في نشرتك الإخبارية.
                      </span>
                    </Label>
                    <Switch 
                        id="newsletter-signup" 
                        checked={newsletterNotification}
                        onCheckedChange={(checked) => handleNotificationChange('newsletter', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
                <Card>
                    <CardHeader>
                        <CardTitle>النسخ الاحتياطي والاستعادة</CardTitle>
                        <CardDescription>قم بتصدير بيانات متجرك بالكامل إلى ملف JSON أو استعد من نسخة سابقة.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label>تصدير البيانات</Label>
                            <p className="text-sm text-muted-foreground">
                                قم بتنزيل نسخة احتياطية كاملة من جميع بياناتك (المنتجات، الطلبات، العملاء، الإعدادات) كملف JSON واحد.
                            </p>
                            <Button onClick={handleExport} disabled={isExporting}>
                                {isExporting ? <><Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري التصدير...</> : <><Download className="ms-2 h-4 w-4" /> تصدير البيانات إلى ملف</>}
                            </Button>
                        </div>

                         <div className="space-y-2">
                            <Label>استيراد البيانات</Label>
                            <p className="text-sm text-muted-foreground">
                                استعد بياناتك من ملف JSON. <span className="font-bold text-destructive">تحذير: سيؤدي هذا إلى مسح جميع البيانات الحالية واستبدالها بالبيانات الموجودة في الملف.</span>
                            </p>
                             <div className="flex gap-2 pt-2">
                                <Button asChild variant="outline" disabled={isImporting}>
                                  <Label>
                                    {isImporting ? <><Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري الاستيراد...</> : <><UploadCloud className="ms-2 h-4 w-4" /> استيراد البيانات من ملف</>}
                                    <input type="file" accept=".json" className="hidden" onChange={handleImportFileSelect} />
                                  </Label>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 border-t pt-6">
                            <Label className="text-base font-semibold">إدارة المستخدمين</Label>
                            <p className="text-sm text-muted-foreground">
                                إنشاء حساب مشرف جديد للوصول إلى لوحة التحكم.
                            </p>
                            <form action={handleCreateAdmin} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">اسم العرض</Label>
                                    <Input id="displayName" name="displayName" placeholder="مثال: صالح الأحمد" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">كلمة المرور</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <Button type="submit" disabled={isUserPending}>
                                     {isUserPending ? (
                                        <>
                                            <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                            جاري الإنشاء...
                                        </>
                                    ) : "إنشاء حساب مشرف"}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>التكاملات</CardTitle>
                  <CardDescription>
                    ربط تطبيقات الطرف الثالث لتوسيع وظائف متجرك.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>تصفح متجر التطبيقات</Button>
                </CardContent>
              </Card>
            </TabsContent>
        </div>
    </Tabs>
    <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive"/>
                    هل أنت متأكد تمامًا؟
                </AlertDialogTitle>
                <AlertDialogDescription>
                    سيؤدي هذا الإجراء إلى <strong className="text-destructive">حذف جميع البيانات الحالية في متجرك بشكل دائم</strong> (المنتجات، الطلبات، العملاء، الإعدادات) واستبدالها بالبيانات من الملف الذي اخترته. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => importFileRef.current = null}>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={confirmImport} className="bg-destructive hover:bg-destructive/90">نعم، أفهم المخاطر، قم بالاستيراد</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    