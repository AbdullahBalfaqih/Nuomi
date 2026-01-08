import a from "./2.png";
import type { StaticImageData } from 'next/image';

export type Product = {
    id: string;
    created_at: string;
    name: string;
    price: number;
    category: 'مطابخ' | 'خزائن' | 'اكسسوارات مطابخ' | 'اكسسوارات خزائن' | 'ديكورات';
    model: string;
    size: string;
    dimensions: string;
    stock: number;
    imageUrl?: string; 
};

export type Category = {
    name: 'اكسسوارات مطابخ' | 'اكسسوارات خزائن';
    description: string;
    imageUrl: StaticImageData | string; 
    imageHint: string;
};

export const categories: Category[] = [
{
  name: 'اكسسوارات مطابخ',
  description: 'استكشف مجموعتنا المختارة من إكسسوارات المطابخ والخزائن المصممة لإضافة الأناقة والوظائف إلى مساحتك.',
  imageUrl: a, // ← نربطها بالصورة مباشرة
  imageHint: 'kitchen accessories',
},
    {
    name: 'اكسسوارات خزائن',
    description: 'ارتقِ بخزائنك مع مجموعتنا من الإكسسوارات الفاخرة. نظم مساحتك بأناقة مع المقسمات والمقابض المصممة.',
    imageUrl: ' ',
    imageHint: 'cabinet accessories',
  },
];

    