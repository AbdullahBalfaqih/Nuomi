'use client';
import { createContext, useContext, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva } from 'class-variance-authority';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarContextProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const value = useMemo(
    () => ({ isCollapsed, toggleSidebar }),
    [isCollapsed]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

const sidebarVariants = cva(
  'h-full bg-background border-r flex flex-col transition-all duration-300 ease-in-out',
  {
    variants: {
      isCollapsed: {
        true: 'w-16',
        false: 'w-64',
      },
    },
    defaultVariants: {
      isCollapsed: false,
    },
  }
);

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  return <aside className={cn(sidebarVariants({ isCollapsed }))}>{children}</aside>;
};

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const SidebarItem = ({ href, icon: Icon, label }: SidebarItemProps) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary',
              isCollapsed && 'justify-center'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className={cn('truncate', isCollapsed && 'sr-only')}>
              {label}
            </span>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={5}>
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
