// src/components/Modal.tsx
import React, { Fragment, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // Added size prop back for better control over modal width
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
}

export default function Modal({ isOpen, onClose, title, children, size='md'  }: ModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Effect to handle closing modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Effect to manage body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }

  // Determine max-width based on size prop using Tailwind classes
  const maxWidthClass = size === 'sm' ? 'max-w-sm' :
                        size === 'md' ? 'max-w-md' :
                        size === 'lg' ? 'max-w-lg' :
                        size === 'xl' ? 'max-w-xl' :
                        size === '2xl' ? 'max-w-2xl' :
                        'max-w-lg'; // Default to lg

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto" // Overlay styles
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className={`relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full flex flex-col ${maxWidthClass}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0"> 
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3> 
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" /> 
          </button>
        </div>
        <div className="p-4 flex-grow"> 
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}