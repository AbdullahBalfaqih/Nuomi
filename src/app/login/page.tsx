'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Eye, Check, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoogleLogo from '@/components/icons/google-logo';
import AppleLogo from '@/components/icons/facebook-logo';
import TwitterLogo from '@/components/icons/twitter-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import a from "./login.png";
import b from "./logo.png";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const imageVariants = {
  hidden: { scale: 1.1, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState<'login' | 'forgotPassword'>('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    let userEmail: string | null = null;
    
    if (loginIdentifier.includes('@')) {
      userEmail = loginIdentifier;
    } else {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', loginIdentifier)
        .single();
      
      if (userError || !userData) {
        setStatus('error');
        setErrorMessage('اسم المستخدم أو كلمة المرور غير صحيحة.');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }
      userEmail = userData.email;
    }

    if (!userEmail) {
        setStatus('error');
        setErrorMessage('تعذر العثور على البريد الإلكتروني للمستخدم.');
        setTimeout(() => setStatus('idle'), 2000);
        return;
    }

    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (signInError) {
      setStatus('error');
      setErrorMessage('اسم المستخدم أو كلمة المرور غير صحيحة.');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('success');
      
      const isAdmin = user?.user_metadata?.role === 'admin';

      setTimeout(() => {
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/catalog');
        }
      }, 1500);
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('success');
      setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
      setTimeout(() => {
        setStatus('idle');
        setMode('login');
      }, 3000);
    }
  };


  return (
    <div className="min-h-screen w-full bg-background">
      <AnimatePresence mode="wait">
        {status !== 'idle' ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Logo className="h-14 w-auto" />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                 <motion.div
                    key="loading-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-muted-foreground"
                 >
                   جاري التحميل...
                 </motion.div>
              )}
               {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, type: 'spring' } }}
                  className="mt-6 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{successMessage || 'نجحت العملية!'}</h3>
                  <p className="text-muted-foreground">جاري إعادة توجيهك...</p>
                </motion.div>
              )}
              {status === 'error' && (
                 <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, type: 'spring' } }}
                  className="mt-6 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">فشلت العملية</h3>
                  <p className="text-muted-foreground">{errorMessage || 'حدث خطأ ما.'}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={containerVariants}
            className="min-h-screen w-full lg:grid lg:grid-cols-2"
          >
            <div className="hidden bg-muted lg:block relative">
              <motion.div
                className="w-full h-full"
                variants={imageVariants}
              >
                                  <Image
                                      src={a}
                                      alt="Contact support"
                                      fill
                                      className="object-fill"   // ← Stretch
                                  />
              </motion.div>
                          </div>

            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <motion.div
                variants={containerVariants}
                className="mx-auto grid w-[400px] gap-8"
              >
                <motion.div variants={itemVariants} className="grid gap-4 text-center">
                                      <div className="relative h-24 md:h-16 w-full">
                                          <Image
                                              src={b}
                                              alt="Contact support"
                                              fill
                                              className="object-fill"   // ← Stretch
                                          />

                                      </div>
                                  
                  <motion.h1 variants={itemVariants} className="text-3xl font-bold">
                    {mode === 'login' && 'أهلاً بك في منزلك'}
                    {mode === 'forgotPassword' && 'إعادة تعيين كلمة المرور'}
                  </motion.h1>
                  <motion.p
                    variants={itemVariants}
                    className="text-balance text-muted-foreground"
                  >
                    {mode === 'login' && 'الرجاء إدخال التفاصيل الخاصة بك.'}
                    {mode === 'forgotPassword' && 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.'}
                  </motion.p>
                </motion.div>

                {mode === 'login' && (
                  <motion.form variants={itemVariants} className="grid gap-6" onSubmit={handleLogin}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="loginIdentifier"
                        type="text"
                        placeholder="اسم المستخدم أو البريد الإلكتروني"
                        required
                        className="ps-10 h-12 rounded-xl"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="كلمة المرور"
                        required
                        className="ps-10 h-12 rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setMode('forgotPassword')}
                        className="text-sm text-primary font-semibold hover:underline p-0 h-auto"
                      >
                        هل نسيت كلمة المرور؟
                      </Button>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold"
                      >
                        تسجيل الدخول
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
                
                {mode === 'forgotPassword' && (
                   <motion.form variants={itemVariants} className="grid gap-6" onSubmit={handleForgotPassword}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="البريد الإلكتروني"
                        required
                        className="ps-10 h-12 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                     <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setMode('login')}
                        className="text-sm text-primary font-semibold hover:underline p-0 h-auto"
                      >
                        العودة لتسجيل الدخول
                      </Button>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold"
                      >
                        إرسال
                      </Button>
                    </motion.div>
                  </motion.form>
                )}

                <motion.div variants={itemVariants} className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      أو
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  className="flex justify-center gap-4"
                >
                  {[AppleLogo, GoogleLogo, TwitterLogo].map((LogoComponent, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ y: -4, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button variant="outline" className="rounded-full w-12 h-12 p-0">
                        <LogoComponent className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
    
