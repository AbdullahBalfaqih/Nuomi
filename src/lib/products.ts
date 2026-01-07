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
    imageUrl: string;
    imageHint: string;
};

export const categories: Category[] = [
  {
    name: 'اكسسوارات مطابخ',
    description: 'اللمسات النهائية التي تحول مطبخك. من المقابض الأنيقة إلى حلول التخزين الذكية، تم اختيار كل قطعة لتعزيز الجمال والوظائف.',
    imageUrl: 'https://picsum.photos/seed/kitchen-accessories/1600/900',
    imageHint: 'kitchen accessories',
  },
    {
    name: 'اكسسوارات خزائن',
    description: 'ارتقِ بخزائنك مع مجموعتنا من الإكسسوارات الفاخرة. نظم مساحتك بأناقة مع المقسمات والمقابض المصممة.',
    imageUrl: 'https://picsum.photos/seed/cabinet-accessories/1600/900',
    imageHint: 'cabinet accessories',
  },
];

    