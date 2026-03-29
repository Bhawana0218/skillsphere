import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'cyan' | 'purple' | 'red' | 'amber';
  trend?: string;
  trendValue?: number;
  isCurrency?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  trendValue,
  isCurrency = false,
  onClick
}) => {
  // Color configuration
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hover: 'hover:shadow-blue-500/10',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      hover: 'hover:shadow-green-500/10',
      trend: 'text-green-600'
    },
    cyan: {
      bg: 'bg-cyan-50',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      hover: 'hover:shadow-cyan-500/10',
      trend: 'text-cyan-600'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hover: 'hover:shadow-purple-500/10',
      trend: 'text-purple-600'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      hover: 'hover:shadow-red-500/10',
      trend: 'text-red-600'
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      hover: 'hover:shadow-amber-500/10',
      trend: 'text-amber-600'
    }
  };
  
  const config = colors[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`
        bg-white rounded-3xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 
        ${config.hover} transition-all duration-300 cursor-pointer
      `}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1">
          <p className="text-slate-500 font-medium text-base mb-2">{title}</p>
          <p className="text-4xl font-bold text-slate-900">
            {isCurrency && typeof value === 'number' 
              ? `₹${value.toLocaleString('en-IN')}` 
              : value
            }
          </p>
          
          {/* Trend */}
          {trend && (
            <div className={`flex items-center gap-1 mt-3 ${config.trend}`}>
              {trendValue !== undefined && (
                trendValue >= 0 
                  ? <ArrowUpRight className="w-4 h-4" />
                  : <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">{trend}</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`p-3 rounded-2xl ${config.iconBg} ${config.iconColor}`}>
          {React.cloneElement(icon as React.ReactElement<any>, {
            className: "w-7 h-7"
          })}
        </div>
      </div>
      
      {/* Progress Bar (optional visual indicator) */}
      <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: typeof value === 'number' ? `${Math.min(value, 100)}%` : '100%' }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-linear-to-r ${
            color === 'blue' ? 'from-blue-400 to-blue-600' :
            color === 'green' ? 'from-green-400 to-green-600' :
            color === 'cyan' ? 'from-cyan-400 to-cyan-600' :
            color === 'purple' ? 'from-purple-400 to-purple-600' :
            color === 'red' ? 'from-red-400 to-red-600' :
            'from-amber-400 to-amber-600'
          }`}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;