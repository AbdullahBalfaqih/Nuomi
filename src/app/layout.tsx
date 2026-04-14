'use client';
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { MotionProvider } from '@/components/motion/motion-provider';
import { FirebaseClientProvider } from '@/firebase';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product } from '@/lib/products';
import { AuthProvider, useAuthContext } from '@/auth/context';

// A version of Product without unused fields for the cart
export type CartItem = Omit<Product, 'created_at' | 'stock' | 'size' | 'dimensions'> & {
  quantity: number;
};


interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuthContext();

  const TAX_RATE = 0.15; // 15%

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isMounted]);
  
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const userDiscountPercentage = user?.user_metadata?.discount || 0;
  const discount = (subtotal * userDiscountPercentage) / 100;
  const subtotalAfterDiscount = subtotal - discount;
  const tax = subtotalAfterDiscount * TAX_RATE;
  const total = subtotalAfterDiscount + tax;

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      
      const { created_at, stock, size, dimensions, ...cartProductData } = product;
      
      const newItem: CartItem = {
        ...cartProductData,
        quantity,
      };

      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, discount, tax, total }}>
      {children}
    </CartContext.Provider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title> Wood Craft - اكـــســسوارات دوالـــيـب الــمــطـابــخ والمـــلابــس </title>
        <meta name="description" content=" Wood Craft هو متجر الكتروني متميز لاكـــســسوارات دوالـــيـب الــمــطـابــخ والمـــلابــس." />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <CartProvider>
              <MotionProvider>
                {children}
              </MotionProvider>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
