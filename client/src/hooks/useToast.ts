import { useState, useCallback } from 'react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'error';
  action?: React.ReactNode;
}

export interface ToastType extends Required<Pick<ToastProps, 'id'>> {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'error';
  action?: React.ReactNode;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const id = props.id || Math.random().toString(36).substring(2, 9);
    const toastWithId: ToastType = { ...props, id };
    
    console.log('Toast:', toastWithId);
    setToasts(prev => [...prev, toastWithId]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const showToast = useCallback((message: string, variant: 'default' | 'destructive' | 'success' | 'error' = 'default') => {
    toast({
      description: message,
      variant
    });
  }, [toast]);

  return { toast, toasts, showToast };
};