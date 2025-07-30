import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrophyProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  earned?: boolean;
  className?: string;
}

export function Trophy({ 
  icon: Icon, 
  title, 
  description, 
  color = "text-yellow-500",
  size = "md",
  earned = true,
  className 
}: TrophyProps) {
  const sizeClasses = {
    sm: {
      container: "p-2",
      icon: "h-4 w-4",
      title: "text-xs",
      description: "text-xs"
    },
    md: {
      container: "p-3",
      icon: "h-6 w-6", 
      title: "text-xs",
      description: "text-xs"
    },
    lg: {
      container: "p-4",
      icon: "h-8 w-8",
      title: "text-sm", 
      description: "text-sm"
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      <div className={cn(
        classes.container,
        "rounded-lg border transition-colors",
        earned 
          ? "bg-white/20 backdrop-blur-sm border-white/30 group-hover:bg-white/30" 
          : "bg-white/10 backdrop-blur-sm border-white/20 border-dashed"
      )}>
        <Icon className={cn(
          classes.icon,
          earned ? color : "text-white/40"
        )} />
      </div>
      <span className={cn(
        classes.title,
        "mt-1 max-w-[60px] text-center leading-tight",
        earned ? "text-white/70" : "text-white/50"
      )}>
        {title}
      </span>
      {description && (
        <span className={cn(
          classes.description,
          "text-white/50 text-center leading-tight"
        )}>
          {description}
        </span>
      )}
    </div>
  );
}