
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingBag, Bell, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/app/layout";
import { useAuthContext } from "@/auth/context";
import { Cart } from "@/cart/cart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const navLinks = [
    { href: "/about", label: "من نحن" },
    { href: "/projects", label: "المشاريع" },
    { href: "/services", label: "الخدمات" },
    { href: "/blog", label: "المدونة" },
    { href: "/contact", label: "اتصل بنا" },
];

interface Notification {
    id: string;
    title: string;
    message: string;
    created_at: string;
    link?: string;
    is_read: boolean;
}

export default function Header() {
    const [open, setOpen] = React.useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
    const [isPopoverOpen, setPopoverOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const { isAuthenticated, user, logout } = useAuthContext();
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    React.useEffect(() => {
        if (isMounted && user) {
            const fetchNotifications = async () => {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching notifications:', error);
                } else {
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.is_read).length);
                }
            };

            fetchNotifications();

            const channel = supabase.channel(`notifications:${user.id}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
                    setNotifications(current => [payload.new as Notification, ...current]);
                    setUnreadCount(current => current + 1);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isMounted, user, supabase]);


    const { items } = useCart();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = async () => {
        await logout();
        setShowLogoutDialog(false);
        router.push('/login');
    }

    const markNotificationsAsRead = async () => {
        if (unreadCount > 0) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user!.id)
                .eq('is_read', false);

            if (!error) {
                setUnreadCount(0);
            }
        }
    };

    const isAdmin = user?.user_metadata?.role === 'admin';
    const userDisplayName = user?.user_metadata?.name || user?.email;
    const userAvatarFallback = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : '?';

    const isUserLoggedIn = isMounted && isAuthenticated;

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 h-20 text-foreground">
                <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
                    <Link href={isUserLoggedIn ? "/catalog" : "/"} aria-label="العودة للصفحة الرئيسية" className="text-foreground">
                        <Logo />
                    </Link>

                    {isUserLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <Popover onOpenChange={(open) => { if (!open) markNotificationsAsRead() }}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-black/10 hover:text-foreground rounded-full">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="end">
                                    <div className="p-4">
                                        <h4 className="font-medium text-sm">الإشعارات</h4>
                                    </div>
                                    <Separator />
                                    <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <Link
                                                    href={notif.link || '#'}
                                                    key={notif.id}
                                                    className={`block p-2 text-sm rounded-md cursor-pointer ${notif.is_read ? 'text-muted-foreground' : 'font-medium text-foreground bg-accent/50'}`}
                                                >
                                                    <p className="font-semibold">{notif.title}</p>
                                                    <p className="text-xs">{notif.message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ar })}
                                                    </p>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                لا توجد إشعارات جديدة.
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Cart>
                                <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-black/10 hover:text-foreground rounded-full">
                                    <ShoppingBag className="h-5 w-5" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            {itemCount}
                                        </span>
                                    )}
                                </Button>
                            </Cart>
                            <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.user_metadata.avatar_url} alt={userDisplayName} />
                                            <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-1" align="end">
                                    <div className="flex flex-col space-y-1">
                                        <div className="px-2 py-1.5">
                                            <p className="font-medium leading-none text-sm">{userDisplayName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                        <Separator />
                                        <SheetClose asChild>
                                            <Link href="/profile" className="inline-flex items-center gap-2 w-full text-sm p-2 rounded-md hover:bg-accent cursor-pointer">
                                                <UserIcon className="h-4 w-4" />
                                                ملفي الشخصي
                                            </Link>
                                        </SheetClose>

                                        {isAdmin && (
                                            <SheetClose asChild>
                                                <Link href="/admin" className="inline-flex items-center gap-2 w-full text-sm p-2 rounded-md hover:bg-accent cursor-pointer">
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    لوحة تحكم المشرف
                                                </Link>
                                            </SheetClose>
                                        )}
                                        <Separator />
                                        <Button variant="ghost" className="w-full justify-start cursor-pointer text-destructive hover:text-destructive h-auto p-2 text-sm gap-2" onClick={() => { setShowLogoutDialog(true); setPopoverOpen(false); }}>
                                            <LogOut className="h-4 w-4" />
                                            تسجيل الخروج
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1">
                                <nav className="flex items-center">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="font-medium text-black/80 transition-colors hover:text-black px-4 py-2"
                                        >
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}
                                </nav>
                                <Button asChild className="bg-foreground text-background hover:bg-foreground/80 rounded-full font-semibold">
                                    <Link href="/login">تسجيل الدخول</Link>
                                </Button>
                            </div>

                            <div className="md:hidden flex items-center gap-2">
                                <Sheet open={open} onOpenChange={setOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" aria-label="فتح القائمة" className={'text-foreground hover:bg-black/10'}>
                                            <Menu className="h-6 w-6" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[300px] bg-background text-foreground p-0">
                                        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
                                            <Link href="/" aria-label="العودة للصفحة الرئيسية" onClick={() => setOpen(false)}>
                                                <Logo />
                                            </Link>
                                            <SheetTitle className="sr-only">قائمة الجوال</SheetTitle>
                                            <SheetClose asChild>
                                                <Button variant="ghost" size="icon" aria-label="إغلاق القائمة" className="text-foreground hover:bg-black/10">
                                                    <X className="h-6 w-6" />
                                                </Button>
                                            </SheetClose>
                                        </SheetHeader>
                                        <nav className="flex flex-col items-start space-y-6 p-6 text-lg">
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setOpen(false)}
                                                    className="font-medium text-foreground/80 transition-colors hover:text-foreground"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                            <Button asChild onClick={() => setOpen(false)} className="w-full bg-foreground text-background hover:bg-foreground/80">
                                                <Link href="/login">تسجيل الدخول</Link>
                                            </Button>
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </>
                    )}

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
