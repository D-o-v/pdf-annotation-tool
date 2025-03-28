import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
}

const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onOpenChange, 
  children, 
  title, 
  description 
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" 
        />
        <DialogPrimitive.Content 
          className="fixed z-50 w-[95%] max-w-md rounded-lg p-6 
            bg-white shadow-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          {title && (
            <DialogPrimitive.Title 
              className="text-lg font-semibold text-neutral-900"
            >
              {title}
            </DialogPrimitive.Title>
          )}
          
          {description && (
            <DialogPrimitive.Description 
              className="text-sm text-neutral-600 mt-2"
            >
              {description}
            </DialogPrimitive.Description>
          )}
          
          {children}
          
          <DialogPrimitive.Close 
            className="absolute top-4 right-4 text-neutral-500 
              hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default Dialog