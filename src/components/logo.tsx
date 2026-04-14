'use client';
import { cn } from "@/lib/utils";
import Image from "next/image";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  const logoUrl = "https://res.cloudinary.com/ddznxtb6f/image/upload/v1773617679/_PhotoFixerBot_23-31-36_UTC-removebg-preview_xwt1h8.png";
  
  return (
      <div className={cn("relative h-[62px] w-[228px]", className)}>
        <Image src={logoUrl} alt=" Wood Craft Logo" fill className="object-contain" />
      </div>
  );
}
