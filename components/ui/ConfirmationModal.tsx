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
        {/* Header */}
        <div className="bg-light px-6 py-4 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${iconColor[variant]} bg-opacity-10 border ${
                variant === 'danger' ? 'border-red-200' :
                variant === 'success' ? 'border-green-200' :
                variant === 'warning' ? 'border-yellow-200' :
                'border-blue-200'
              }`}>
                {variant === 'danger' && <X className="h-5 w-5" />}
                {variant === 'success' && <Check className="h-5 w-5" />}
                {variant === 'warning' && <AlertTriangle className="h-5 w-5" />}
                {variant === 'primary' && <Info className="h-5 w-5" />}
              </div>
              <h3 className="h5 mb-0 font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="px-6 py-5">
          <div className="text-gray-600">
            {typeof message === 'string' ? (
              <p className="text-sm">{message}</p>
            ) : (
              message
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full px-4 py-2.5 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${variantClasses[variant]}`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
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
