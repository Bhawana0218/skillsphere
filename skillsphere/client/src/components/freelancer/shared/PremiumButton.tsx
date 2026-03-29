import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = "font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";
  
  // Size variants
  const sizes = {
    sm: "px-4 py-2 text-base",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-xl"
  };
  
  // Style variants with cyan/blue theme
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 focus:ring-cyan-500/50",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:shadow-xl focus:ring-slate-500/50",
    outline: "border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 focus:ring-cyan-500/30",
    ghost: "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/50 focus:ring-cyan-500/20",
    white: "bg-white text-cyan-700 hover:bg-cyan-50 border-2 border-white shadow-lg shadow-cyan-500/20 focus:ring-cyan-500/30"
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default PremiumButton;