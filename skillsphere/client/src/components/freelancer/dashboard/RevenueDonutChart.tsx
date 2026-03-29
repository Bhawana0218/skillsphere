import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface RevenueDonutChartProps {
  data: ChartDataItem[];
  title?: string;
  subtitle?: string;
}

const RevenueDonutChart: React.FC<RevenueDonutChartProps> = ({ 
  data, 
  title = 'Revenue Distribution',
  subtitle = 'Breakdown by category'
}) => {
  const chartConfig = {
    innerRadius: 60,
    outerRadius: 90,
    paddingAngle: 2,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-slate-500 text-base">{subtitle}</p>}
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={chartConfig.innerRadius}
              outerRadius={chartConfig.outerRadius}
              paddingAngle={chartConfig.paddingAngle}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="white" 
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff',
                fontSize: '14px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={40}
              formatter={(value) => (
                <span className="text-slate-700 font-medium text-base">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueDonutChart;