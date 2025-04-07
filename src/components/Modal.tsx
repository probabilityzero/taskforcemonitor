import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  preventBackdropClick?: boolean;
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  preventBackdropClick = false
}: ModalProps) {
  // Manage body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (!preventBackdropClick) {
      onClose();
    }
  };

  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence onExitComplete={() => {
      document.body.style.overflow = '';
    }}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-github-card rounded-lg w-full max-w-2xl relative border border-github-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleContentClick}
          >
            {title && (
              <div className="flex justify-between items-center p-4 border-b border-github-border">
                <h2 className="text-xl font-bold text-github-text">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-github-text hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className={!title ? 'p-3 md:p-6' : 'p-4'}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}