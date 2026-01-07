
'use client';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  CircleUser,
  Menu,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/auth/context';
import Loader from '@/components/ui/loader';


const adminNavItems = [
  { href: '/admin', icon: Home, label: 'لوحة التحكم' },
  { href: '/admin/products', icon: Package, label: 'المنتجات' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
  { href: '/admin/customers', icon: Users, label: 'العملاء' },
  { href: '/admin/analytics', icon: LineChart, label: 'التحليلات' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  
  const isAdmin = user?.user_metadata?.role === 'admin';

  React.useEffect(() => {
    // Wait for auth state to be determined
    if (user !== undefined) {
      setIsCheckingAuth(false);
      if (!isAuthenticated || !isAdmin) {
        router.replace('/catalog'); // Or '/login'
      }
    }
  }, [user, isAuthenticated, isAdmin, router]);

  if (isCheckingAuth || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <Loader loadingText="التحقق من الصلاحيات..." />
      </div>
    );
  }

  const userDisplayName = user?.user_metadata?.name || user?.email;
  
  const handleLogout = async () => {
    await logout();
    setShowLogoutDialog(false);
    router.push('/login');
  }

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
        <div className="hidden border-l bg-black text-white md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin" className="text-white">
                <Logo />
                <span className="sr-only">NUOMI Admin</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-stone-300 transition-all hover:text-white hover:bg-stone-800",
                        pathname === item.href && "bg-stone-700 text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4">
                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-stone-300 transition-all hover:text-white hover:bg-stone-800",
                     pathname === '/admin/settings' && "bg-stone-700 text-white"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-black text-white px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">تبديل قائمة التنقل</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col bg-black text-white">
                <SheetHeader>
                    <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4 text-white"
                  >
                    <Logo />
                    <span className="sr-only">NUOMI Admin</span>
                  </Link>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                          "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800",
                          pathname === item.href && "bg-stone-700 text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto">
                   <Link
                      href="/admin/settings"
                      className={cn(
                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800",
                        pathname === '/admin/settings' && "bg-stone-700 text-white"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      الإعدادات
                    </Link>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              {/* You can add a search bar here if needed */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">تبديل قائمة المستخدم</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userDisplayName || 'حسابي'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/admin/settings')} className="cursor-pointer">
                  <Settings className="me-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowLogoutDialog(true)} className="cursor-pointer text-destructive">
                   <LogOut className="me-2 h-4 w-4" />
                   تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد أنك تريد تسجيل الخروج؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إعادتك إلى صفحة تسجيل الدخول.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>تسجيل الخروج</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
