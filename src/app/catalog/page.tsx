
'use client';

import { motion } from 'framer-motion';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Loader2, Search, ListFilter, EyeOff, Eye } from 'lucide-react';
import { categories, Product } from '@/lib/products';
import { useCart } from '@/app/layout';
import { useAuthContext } from '@/auth/context';
import { useToast } from '@/hooks/use-toast';
import { Cart } from '@/cart/cart';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PriceDisplay from '@/components/ui/price-display';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import a from "./1.jpg";
import B from "./2.png";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function CatalogPage() {
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseBrowserClient();
    const { isAuthenticated, user } = useAuthContext();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const catalogHeroImage = PlaceHolderImages.find((img) => img.id === 'catalog-hero');
    const categoryKitchenImage = PlaceHolderImages.find(p => p.id === 'category-kitchen-accessories');
    const categoryCabinetImage = PlaceHolderImages.find(p => p.id === 'category-cabinet-accessories');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOption, setSortOption] = useState('newest');
    const [showPrices, setShowPrices] = useState(true);


    useEffect(() => {
        if (user !== undefined) {
            setIsCheckingAuth(false);
            if (!isAuthenticated) {
                router.replace('/login');
            }
        }
    }, [user, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchProducts = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching products:', error);
                    toast({ title: 'فشل في جلب المنتجات', description: error.message, variant: 'destructive' });
                } else {
                    setAllProducts(data as Product[]);
                }
                setLoading(false);
            };

            fetchProducts();
        }
    }, [isAuthenticated, supabase, toast]);


    const handleAddToCart = (product: Product) => {
        addToCart(product, 1);
        toast({
          title: `تمت الإضافة إلى السلة`,
          description: `${product.name} تمت إضافته إلى سلتك.`,
          action: (
            <Cart>
                <Button variant="outline">عرض السلة</Button>
            </Cart>
          ),
        });
    };

    const isFiltering = useMemo(() => searchTerm.trim() !== '' || selectedCategory !== 'all', [searchTerm, selectedCategory]);

    const filteredAndSortedProducts = useMemo(() => {
        let products = [...allProducts];

        if (isFiltering) {
            // Filter by category
            if (selectedCategory !== 'all') {
                products = products.filter(p => p.category === selectedCategory);
            }

            // Filter by search term
            if (searchTerm) {
                products = products.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
        }


        // Sort
        switch (sortOption) {
            case 'price_asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                // Already sorted by created_at desc from query for allProducts
                // If we are filtering, we should re-sort
                 if(isFiltering) {
                    products.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                 }
                break;
        }

        return products;
    }, [allProducts, selectedCategory, searchTerm, sortOption, isFiltering]);

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }
  
  const renderProductCard = (product: Product, pIndex: number) => (
     <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: pIndex * 0.05, ease: 'easeOut' }}
        className="group"
      >
        <Link href={`/product/${product.id}`} className="block">
          <div className="bg-secondary/50 p-4 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-muted">
              {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>
              )}
            </div>
            <h3 className="font-headline text-lg font-medium truncate text-foreground">{product.name}</h3>
            <div className="flex justify-between items-center mt-2">
                      {showPrices ? <PriceDisplay amount={product.price} className="text-lg" /> : <div />}
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-9 h-9 bg-white shadow-sm z-10"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(product);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-background"
    >
      <Header />
      <main>
        <header className="relative h-screen min-h-[700px] w-full text-white flex items-center justify-center text-center">
            {catalogHeroImage && (
                      <Image
                          src={a}
                          alt="Contact support"
                          fill
                          className="object-fill"   // ← Stretch
                      />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold text-sm mb-4">
                        كتالوج الإكسسوارات
                    </div>
                    <h1 className="font-headline text-5xl md:text-7xl font-bold">
                        اللمسات النهائية المثالية
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-200">
                        استكشف مجموعتنا المختارة من إكسسوارات المطابخ والخزائن المصممة لإضافة الأناقة والوظائف إلى مساحتك.
                    </p>
                </motion.div>
            </div>
        </header>

         <div className="py-4 bg-secondary border-b">
             <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="ابحث عن منتج..."
                            className="ps-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <ToggleGroup 
                            type="single" 
                            defaultValue="all"
                            value={selectedCategory}
                            onValueChange={(value) => value && setSelectedCategory(value)}
                            className="bg-background rounded-lg p-1"
                        >
                            <ToggleGroupItem value="all" className="flex-grow">الكل</ToggleGroupItem>
                            {categories.map(cat => (
                                <ToggleGroupItem key={cat.name} value={cat.name} className="flex-grow">{cat.name}</ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                         <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-full md:w-[180px] h-11 bg-background">
                                <SelectValue placeholder="ترتيب حسب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">الأحدث</SelectItem>
                                <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                                <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                            </SelectContent>
                              </Select>
                              <div className="flex items-center gap-2 bg-background rounded-lg p-2 h-11">
                                  <Label htmlFor="show-prices" className="flex items-center gap-2 cursor-pointer">
                                      {showPrices ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                      <span className="text-sm font-medium">الأسعار</span>
                                      <Switch id="show-prices" checked={showPrices} onCheckedChange={setShowPrices} className="ms-2" />
                                  </Label>
                              </div>

                    </div>
                </div>
            </div>
         </div>


        <div className="py-16 sm:py-24">
            <div className="container mx-auto px-4 md:px-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : isFiltering ? (
                    filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {filteredAndSortedProducts.map(renderProductCard)}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <ListFilter className="h-16 w-16 mx-auto text-muted-foreground/30" strokeWidth={1}/>
                            <h3 className="mt-4 text-xl font-semibold">لم يتم العثور على منتجات</h3>
                            <p className="mt-2 text-muted-foreground">حاول تغيير معايير البحث أو الفلترة.</p>
                        </div>
                    )
              ) : (
                                  <div className="space-y-24">
                                      {categories.map(category => {
                                          const categoryProducts = allProducts.filter(p => p.category === category.name);
                                          const categoryImage = category.name === 'اكسسوارات مطابخ' ? categoryKitchenImage : categoryCabinetImage;

                                          return (
                                              <section key={category.name} className="relative">
                                                  <div className="grid md:grid-cols-2 gap-12 items-center">
                                                      <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
                                                          {categoryImage && <Image src={categoryImage.imageUrl} alt={category.name} fill className="object-cover" />}
                                                      </div>
                                                      <div className="md:pe-12 text-center md:text-right">
                                                          <h2 className="font-headline text-4xl md:text-5xl font-bold">{category.name}</h2>
                                                          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto md:mx-0">{category.description}</p>
                                                      </div>
                                                  </div>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12">
                                                      {categoryProducts.slice(0, 4).map(renderProductCard)}
                                                  </div>
                                              </section>

                                          )
                                      })}
                                  </div>
              )}
            </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
