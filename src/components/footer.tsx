'use client';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MoveUpRight } from 'lucide-react';
import Logo from '@/components/logo';
import { useState, useEffect, useCallback } from 'react';

const navLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/about', label: 'من نحن' },
  { href: '/services', label: 'الخدمات' },
  { href: '/projects', label: 'المشاريع' },
  { href: '/blog', label: 'المدونة' },
  { href: '/contact', label: 'اتصل بنا' },
];

const socialLinks = [
  { href: '#', icon: Facebook, label: 'فيسبوك' },
  { href: '#', icon: Twitter, label: 'تويتر/X' },
  { href: '#', icon: Youtube, label: 'يوتيوب' },
  { href: '#', icon: Instagram, label: 'انستغرام' },
];

const legalLinks = [
  { href: '#', label: 'الشروط والأحكام' },
  { href: '#', label: 'سياسة الخصوصية' },
];

const contactInfo = [
    { icon: Phone, label: "الهاتف", details: [ "966550376786+"] },
    { icon: Mail, label: "البريد الإلكتروني", details: ["nuomi.ksa@gmail.com"] },
    { icon: MapPin, label: "العنوان", details: ["الدمام, المملكة العربية السعودية"] },
    { icon: Clock, label: "ساعات العمل", details: ["من السبت إلى الخميس: 9:00 صباحًا - 8:30 مساءً", "الجمعة: مغلق"] },
]

export default function Footer() {
    const [isMounted, setIsMounted] = useState(false);

  return (
    <footer className="bg-black text-white pt-16 sm:pt-24 relative overflow-hidden">
      <div className="container mx-auto z-10 relative px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {/* Column 1: Contact Info & Description */}
            <div className="flex flex-col gap-8">
                <p className="text-stone-300 max-w-sm text-lg opacity-80 leading-relaxed">
                    شركة الهندسة المعمارية رقم 1 في تكساس، نحول الأحلام إلى مساحات جميلة وعملية. من المنازل المريحة إلى التصاميم المبتكرة، نحقق رؤيتك - تفصيلاً بتفصيل. فلنصنع شيئًا مذهلاً معًا!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {contactInfo.map(item => (
                        <div key={item.label} className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 text-stone-300" />
                                <h3 className="text-sm uppercase tracking-wider font-medium text-stone-400">{item.label}</h3>
                            </div>
                            <div className='flex flex-col gap-1'>
                            {item.details.map(detail => (
                                <p key={detail} className="text-stone-200">{detail}</p>
                            ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 2: Newsletter */}
            <div className="flex flex-col gap-4">
                 <h3 className="font-semibold text-lg text-stone-100">اشترك في النشرة الإخبارية</h3>
                 <form className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        type="email" 
                        placeholder="jane@framer.com" 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50 rounded-lg"
                    />
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold cursor-pointer">
                        اشتراك
                    </Button>
                 </form>
            </div>

            {/* Column 3: Nav & Social Links */}
            <div className="lg:ps-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold tracking-wider uppercase text-stone-400 mb-4">التنقل</h3>
                        <nav className="flex flex-col">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="group flex items-center justify-between py-3 border-b border-white/10 text-stone-200 transition-colors hover:text-white cursor-pointer">
                                    <span>{link.label}</span>
                                    <MoveUpRight className="w-5 h-5 opacity-50 transition-all group-hover:opacity-100 group-hover:-translate-x-1 group-hover:-translate-y-1" />
                                </Link>
                            ))}
                        </nav>
                    </div>
                     <div>
                        <h3 className="font-semibold tracking-wider uppercase text-stone-400 mb-4">تواصل معنا</h3>
                        <nav className="flex flex-col">
                            {socialLinks.map((link) => (
                                <Link key={link.label} href={link.href} aria-label={link.label} className="group flex items-center justify-between py-3 border-b border-white/10 text-stone-200 transition-colors hover:text-white cursor-pointer">
                                    <span>{link.label}</span>
                                    <link.icon className="h-5 w-5 opacity-50 transition-opacity group-hover:opacity-100" />
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
              </div>
              <br />    <br />    <br />    <br />  <br />    <br />    <br />    <br />    <br />   <br />    <br />    <br />    <br />    <br />    <br /> 
        
              <div className="relative">

                  {/* كلمة NUOMI المتوهجة */}
                  <div
                      className="
      absolute inset-x-0
      bottom-[6rem] lg:bottom-[7rem]
      flex justify-center
      text-[20vw] lg:text-[18rem]
      font-bold font-headline
      select-none leading-none
      pointer-events-none

      bg-gradient-to-l
      from-transparent
      via-white/40
      to-transparent
      bg-[length:200%_100%]
      bg-right
      animate-glow-rtl

      text-transparent
      bg-clip-text
    "
                  >
                      NUOMI
                  </div>

                  {/* الفوتر */}
                  <div
                      className="
      relative z-10
      flex flex-col md:flex-row
      justify-between items-center
      gap-6
      pt-10 pb-10
      border-t border-white/10
      text-white/50
    "
                  >
                      <p>&copy; {new Date().getFullYear()} NUOMI. جميع الحقوق محفوظة.</p>

                      <div className="flex space-x-4 mt-4 md:mt-0">
                          {legalLinks.map((link) => (
                              <Link
                                  key={link.label}
                                  href={link.href}
                                  className="transition-colors hover:text-white"
                              >
                                  {link.label}
                              </Link>
                          ))}
                      </div>
                  </div>

              </div>

             


      </div>
    </footer>
  );
}
