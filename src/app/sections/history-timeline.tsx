'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { FadeUp } from '@/components/motion/fade-up';

const historyData = [
    { year: "1993", event: "تأسيس مصنع 'Xincheng' للقوالب الدقيقة، الشركة الأم لـ NUOMI." },
    { year: "2003", event: "ولادة علامة 'NUOMI' التجارية، لتصبح من أوائل مصنعي الإكسسوارات الوظيفية." },
    { year: "2007", event: "إطلاق سلسلة سلال السحب Terras المصنوعة من الفولاذ المقاوم للصدأ، لتصبح معيارًا للابتكار في الصناعة." },
    { year: "2008", event: "إطلاق حلول تخزين الخزائن (wardrobe)." },
    { year: "2012", event: "إنشاء مصنع جديد بمساحة 25,000 متر مربع وت導入 معدات إنتاج ألمانية آلية." },
    { year: "2013", event: "سلسلة سلال السحب Champagne Rose بتقنية الطلاء النانوي الجاف تقود الابتكار مرة أخرى." },
    { year: "2016", event: "الحصول على جائزة 'أفضل عشر علامات تجارية في صناعة الإكسسوارات' لثلاث سنوات متتالية، وعقد شراكات استراتيجية مع علامات تجارية عالمية." },
    { year: "2017", event: "إطلاق الحوض الذكي وبدء عصر الحياة الذكية، مع إطلاق حلول حركة الأثاث." },
    { year: "2020", event: "بدء تشغيل قاعدة إنتاج ذكية بمساحة 80,000 متر مربع." },
    { year: "2021", event: "إنشاء 'السلسلة البيئية المتكاملة لإكسسوارات المنزل' من NUOMI، وإطلاق نظام الإضاءة الذكي وتطبيقات الألمنيوم المخصصة." },
    { year: "2022", event: "بدء بناء قاعدة ذكية لتجهيزات الأثاث الراقية بمساحة 60,000 متر مربع كخطوة حاسمة في استراتيجية التصنيع الذكي." },
];

const TimelineItem = ({ year, event, isLast }: { year: string, event: string, isLast: boolean }) => {
    return (
        <div className="flex items-start gap-6 md:gap-8">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    {year}
                </div>
                {!isLast && <div className="w-px h-full bg-border mt-2 flex-grow" />}
            </div>
            <motion.div
                className="pb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <p className="text-lg text-foreground font-semibold">{event}</p>
            </motion.div>
        </div>
    );
};

export default function HistoryTimeline() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "end end"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={ref} className="py-24 sm:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <FadeUp>
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">رحلتنا عبر الزمن</span>
                        <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mt-2">
                            ثلاثة عقود من الابتكار والجودة
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            من البدايات المتواضعة إلى الريادة العالمية، نستعرض تاريخ NUOMI الحافل بالإنجازات التي شكلت معايير الصناعة.
                        </p>
                    </div>
                </FadeUp>

                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute right-5 top-0 h-full w-px bg-border -z-1" />
                    <motion.div
                        className="absolute right-5 top-0 h-full w-px bg-primary origin-top"
                        style={{ scaleY }}
                    />
                    <div className="space-y-4">
                        {historyData.map((item, index) => (
                            <TimelineItem
                                key={item.year}
                                year={item.year}
                                event={item.event}
                                isLast={index === historyData.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
