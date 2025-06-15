import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  onClick,
  variant = 'default',
  size = 'default',
  className
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      variant={variant}
      size={size}
      className={className}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}