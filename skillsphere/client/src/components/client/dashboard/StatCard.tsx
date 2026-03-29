import React from 'react';
import { motion } from 'framer-motion';

const colorMap: Record<ColorType, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-green-600',
  cyan: 'from-cyan-500 to-blue-500',
  purple: 'from-indigo-500 to-purple-600',
};

const bgMap: Record<ColorType, string> = {
  blue: 'bg-black',
  green: 'bg-black',
  cyan: 'bg-black',
  purple: 'bg-black',
};

// Define allowed color types
type ColorType = 'blue' | 'green' | 'cyan' | 'purple';

// Props interface
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: ColorType;
  trend?: string;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue' }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl text-gray-900 shadow-sm border border-slate-100 p-6 flex items-center justify-between"
    >
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-navy-900">{value}</p>
      </div>

      <div
  className={`p-4 rounded-xl text-black bg-linear-to-br ${colorMap[color]} ${bgMap[color]} shadow-sm`}
>
  {icon}
</div>
    </motion.div>
  );
};

export default StatCard;