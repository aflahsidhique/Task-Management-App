'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DonutData } from '../../services/dashboardService';
import { colorForIndex } from './chartColors';

interface DonutChartProps {
  data: DonutData;
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  return (
    <div>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.segments}
              dataKey="count"
              nameKey="label"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={3}
              stroke="none"
            >
              {data.segments.map((segment, index) => (
                <Cell key={segment.label} fill={colorForIndex(index)} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-gray-900">{data.total}</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.segments.map((segment, index) => (
          <div key={segment.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colorForIndex(index) }}
              />
              <span className="text-gray-600">{segment.label}</span>
            </div>
            <span className="text-gray-900 font-medium">
              {segment.count} ({segment.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
