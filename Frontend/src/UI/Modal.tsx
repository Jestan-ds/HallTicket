// src/components/Modal.tsx
import React, { Fragment, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react'; // Using lucide-react for the close icon

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // Removed size prop as modal component doesn't use it
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
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

  // Using simple class names for potential external CSS styling
  // Basic inline styles for positioning and overlay effect
  const modalOverlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000, // High z-index
      padding: '16px',
      overflowY: 'auto', // Allow scrolling within the overlay if content is large
  };

   const modalContentStyle: React.CSSProperties = {
       position: 'relative',
       backgroundColor: '#fff', // White background
       borderRadius: '8px',
       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Example shadow
       maxHeight: '90vh',
       overflowY: 'auto', // Allow scrolling inside the modal content
       width: '100%',
       maxWidth: '700px', // Example max width, adjust as needed
       display: 'flex', // Use flex to structure header and body
       flexDirection: 'column',
   };

    const modalHeaderStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb', // Light gray border
        flexShrink: 0, // Prevent header from shrinking
    };

     const modalTitleStyle: React.CSSProperties = {
         fontSize: '1.125rem',
         fontWeight: '600',
         margin: 0, // Remove default margin
     };

      const modalBodyStyle: React.CSSProperties = {
          padding: '16px',
          flexGrow: 1, // Allow body to grow and fill space
      };

    const closeButtonStyle: React.CSSProperties = {
        padding: '4px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        display: 'inline-flex', // Align icon nicely
        alignItems: 'center',
        justifyContent: 'center',
    };


  return createPortal(
    <div style={modalOverlayStyle} onClick={onClose}>
      <div
        ref={modalContentRef}
        style={modalContentStyle}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <div style={modalHeaderStyle}>
          <h3 style={modalTitleStyle}>{title}</h3>
          <button
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div style={modalBodyStyle}>
          {children}
        </div>
      </div>
    </div>,
    document.body // Append modal to the body
  );
}