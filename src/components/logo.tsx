'use client';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLogo = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'logo_url')
        .single();
      
      if (data?.value) {
        setLogoUrl(data.value);
      }
    };
    fetchLogo();
  }, []);

  if (logoUrl) {
    return (
      <div className={cn("relative h-[31px] w-[114px]", className)}>
        <Image src={logoUrl} alt="NUOMI Logo" fill className="object-contain" />
      </div>
    );
  }

  return (
    <svg
        width="114"
        height="31"
        viewBox="0 0 114 31"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="NUOMI Logo"
    >
        <text 
            x="0" 
            y="24" 
            fontFamily="inherit" 
            fontSize="30" 
            fontWeight="bold" 
            letterSpacing="2"
        >
            NUOMI
        </text>
    </svg>
  );
}
