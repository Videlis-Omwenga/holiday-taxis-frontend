"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, Check, AlertTriangle, Info } from "lucide-react";

interface ConfirmationModalProps {
  show: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  show,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (show && modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onCancel();
    }
  }, [show, onCancel]);

  // Handle modal open/close effects
  useEffect(() => {
    if (!show) return;
    
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [show, handleClickOutside]);

  // Early return after all hooks
  if (!show) return null;

  // Static configurations
  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  };

  const iconColor = {
    danger: 'text-red-500',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 z-[9999] overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fadeIn mx-auto my-8"
        style={{
          position: 'relative',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out forwards',
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
          maxHeight: 'calc(100vh - 2rem)'
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconColor[variant]} bg-opacity-10 mb-4`}>
              {variant === 'danger' && <X className="h-6 w-6" />}
              {variant === 'success' && <Check className="h-6 w-6" />}
              {variant === 'warning' && <AlertTriangle className="h-6 w-6" />}
              {variant === 'primary' && <Info className="h-6 w-6" />}
            </div>
            <div className="text-center">
              {typeof message === 'string' ? (
                <p className="text-gray-600">{message}</p>
              ) : (
                message
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full px-4 py-2.5 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses[variant]}`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
