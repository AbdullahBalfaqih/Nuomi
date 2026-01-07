
'use client';
import Image from 'next/image';
import { getCurrencySettings } from '@/lib/orders';
import { useEffect, useState } from 'react';

interface PriceDisplayProps {
  amount: number;
  className?: string;
  imageClassName?: string;
}

interface CurrencySettings {
  symbol: string;
  imageUrl: string | null;
}

// Cache the settings to avoid fetching them on every render
let currencySettingsCache: CurrencySettings | null = null;

export default function PriceDisplay({ amount, className = 'text-lg', imageClassName = 'h-5 w-5' }: PriceDisplayProps) {
  const [settings, setSettings] = useState<CurrencySettings | null>(currencySettingsCache);
  
  useEffect(() => {
    if (!currencySettingsCache) {
      getCurrencySettings().then(fetchedSettings => {
        currencySettingsCache = fetchedSettings;
        setSettings(fetchedSettings);
      });
    }
  }, []);

  const formattedAmount = new Intl.NumberFormat('ar-SA').format(amount);

  return (
    <span className={`flex items-center gap-1.5 font-medium ${className}`}>
      <span>{formattedAmount}</span>
      {settings?.imageUrl ? (
        <Image 
          src={settings.imageUrl} 
          alt={settings.symbol}
          width={24}
          height={24}
          className={`object-contain ${imageClassName}`}
        />
      ) : (
        <span>{settings?.symbol || 'ر.س'}</span>
      )}
    </span>
  );
}
