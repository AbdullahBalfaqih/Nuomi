
'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Minus, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/layout';
import { useAuthContext } from '@/auth/context';
import { useToast } from '@/hooks/use-toast';
import AnimatedCartButton from '@/components/ui/animated-cart-button';
import { Cart } from '@/cart/cart';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import PriceDisplay from '@/components/ui/price-display';

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (user !== undefined) {
      setIsCheckingAuth(false);
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !isAuthenticated) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error || !data) {
        console.error("Error fetching product", error);
        setProduct(null);
      } else {
        setProduct(data as Product);
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
        setRelatedProducts(relatedData || []);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, supabase, isAuthenticated]);

  if (isCheckingAuth || loading || !isAuthenticated) {
     return (
        <div className="bg-background">
            <Header />
            <main className="container mx-auto px-4 md:px-6 py-24 sm:py-32 text-center">
                 <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
            </main>
            <Footer />
        </div>
    );
  }

  if (!product) {
    return (
        <div className="bg-background">
            <Header />
            <main className="container mx-auto px-4 md:px-6 py-24 sm:py-32 text-center">
                <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
                <Link href="/catalog" className="mt-4 inline-block text-primary hover:underline">
                    العودة إلى الكتالوج
                </Link>
            </main>
            <Footer />
        </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: `تمت إضافة ${quantity} x ${product.name}`,
      description: "تم تحديث سلة التسوق الخاصة بك.",
      action: (
        <Cart>
            <Button variant="outline">عرض السلة</Button>
        </Cart>
      ),
    });
  };

  return (
    <div className="bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-24 sm:py-32">
        <div className="mb-8">
          <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="me-2 h-4 w-4" />
            العودة إلى الكتالوج
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
           <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-muted">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">لا توجد صورة</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col h-full pt-8"
          >
            <Badge variant="secondary" className="w-fit">{product.category}</Badge>
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mt-4">
              {product.name}
            </h1>

            <PriceDisplay amount={product.price} className="text-2xl text-primary mt-6" imageClassName="h-7 w-7" />

            <div className="prose prose-stone dark:prose-invert mt-6 text-muted-foreground">
                <p>نقدم لكم {product.name} - مزيج مثالي من الأناقة والراحة والمتانة. مصنوعة من أجود المواد، هذه القطعة مصممة لرفع أي مساحة. تصميمها الخالد يضمن أنها ستبقى قطعة مركزية في منزلك لسنوات قادمة.</p>
                <ul>
                    <li>مواد فاخرة ومستدامة المصدر</li>
                    <li>حرفية خبيرة</li>
                </ul>
            </div>

            <div className="mt-8">
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-primary text-primary-foreground">
                    <tr className="divide-x divide-border">
                      <th className="px-4 py-2 text-right font-medium">الموديل</th>
                      <th className="px-4 py-2 text-right font-medium">الحجم</th>
                      <th className="px-4 py-2 text-right font-medium">الأبعاد</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="divide-x divide-border">
                      <td className="px-4 py-3 text-foreground">{product.model}</td>
                      <td className="px-4 py-3 text-foreground">{product.size}</td>
                      <td className="px-4 py-3 text-foreground">{product.dimensions}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-auto pt-8 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border p-1">
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                        <Minus className="h-4 w-4"/>
                    </Button>
                    <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                     <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setQuantity(q => q + 1)}>
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
              <AnimatedCartButton onClick={handleAddToCart} />
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24 sm:mt-32">
            <h2 className="font-headline text-3xl font-bold text-center mb-12">منتجات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`} className="group block">
                  <div className="bg-secondary/50 p-4 rounded-2xl overflow-hidden flex flex-col h-full">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-muted">
                        {relatedProduct.imageUrl ? (
                            <Image src={relatedProduct.imageUrl} alt={relatedProduct.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>
                        )}
                    </div>
                    <h3 className="font-headline text-lg font-medium truncate text-foreground">{relatedProduct.name}</h3>
                    <PriceDisplay amount={relatedProduct.price} className="mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
