import React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600',
        outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50',
        subtle: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        ghost: 'hover:bg-neutral-100 text-neutral-700',
        destructive: 'bg-red-500 text-white hover:bg-red-600'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant, 
  size, 
  className, 
  ...props 
}) => {
  return (
    <button 
      className={buttonVariants({ variant, size, className })} 
      {...props}
    >
      {children}
    </button>
  )
}

export default Button