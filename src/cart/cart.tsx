'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag, Percent } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PriceDisplay from '@/components/ui/price-display';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/auth/context';


export function Cart({ children }: { children: React.ReactNode }) {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, discount, tax, total } = useCart();
  const { user } = useAuthContext();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const userDiscountPercentage = user?.user_metadata?.discount || 0;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[450px] bg-background p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>سلتك ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-grow p-6">
              <div className="flex flex-col gap-8">
                {items.map(item => (
                  <div key={item.id} className="grid grid-cols-[80px_1fr_auto] gap-4 items-center">
                    <div className="relative w-[80px] h-[100px] rounded-md overflow-hidden bg-secondary">
                        {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                       <Link href={`/product/${item.id}`} className="font-semibold text-base hover:underline text-foreground truncate">{item.name}</Link>
                       <PriceDisplay amount={item.price} className="text-primary" />
                       <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium text-sm w-5 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 self-center">
                         <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-auto border-t bg-secondary/50 p-6 space-y-4">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <PriceDisplay amount={subtotal} className="text-sm font-semibold" />
                    </div>
                    {userDiscountPercentage > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                           <span className="flex items-center gap-1">
                                الخصم ({userDiscountPercentage}%)
                                <Percent className="h-3 w-3" />
                           </span>
                           <span className="font-semibold flex items-center">-<PriceDisplay amount={discount} className="text-sm font-semibold text-green-600" /></span>
                        </div>
                    )}
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">الضريبة (15%)</span>
                        <PriceDisplay amount={tax} className="text-sm font-semibold" />
                    </div>
                </div>
                <Separator />
                <div className="w-full flex justify-between items-center text-lg">
                    <span className="font-bold">الإجمالي</span>
                    <PriceDisplay amount={total} className="font-bold text-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <SheetClose asChild>
                      <Button asChild className="w-full" size="lg"><Link href="/checkout">الانتقال إلى الدفع</Link></Button>
                    </SheetClose>
                    <Button className="w-full" size="lg" variant="outline" onClick={clearCart}>إفراغ السلة</Button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center gap-4 text-center p-6">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
            <h3 className="text-xl font-semibold">سلتك فارغة</h3>
            <p className="text-muted-foreground">يبدو أنك لم تضف أي شيء بعد.</p>
            <SheetClose asChild>
                <Link href="/catalog">
                    <Button variant="outline">متابعة التسوق</Button>
                </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
