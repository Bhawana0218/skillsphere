import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface SectionCardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'minimal';
  hoverable?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  action,
  variant = 'default',
  hoverable = true,
  className = '',
  ...props
}) => {
  // Variant styles
  const variants = {
    default: "bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40",
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25",
    minimal: "bg-white/50 backdrop-blur-sm border border-slate-200/30"
  };
  
  const titleColors = {
    default: "text-slate-900",
    gradient: "text-white",
    minimal: "text-slate-900"
  };
  
  const subtitleColors = {
    default: "text-slate-500",
    gradient: "text-cyan-100",
    minimal: "text-slate-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`
        rounded-3xl p-6 transition-all duration-300
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Header */}
      {(title || icon || action) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2 rounded-xl ${variant === 'gradient' ? 'bg-white/20' : 'bg-cyan-100'}`}>
                {React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement<any>, {
                      className: `w-6 h-6 ${variant === 'gradient' ? 'text-white' : 'text-cyan-600'}`
                    })
                  : icon
                }
              </div>
            )}
            <div>
              {title && (
                <h3 className={`text-xl font-bold ${titleColors[variant]}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-base ${subtitleColors[variant]}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* Content */}
      <div className={title || icon ? '' : ''}>
        {children}
      </div>
    </motion.div>
  );
};

export default SectionCard;