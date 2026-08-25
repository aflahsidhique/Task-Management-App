'use client';

import { format } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TasksOverviewRow } from '../../services/dashboardService';

interface TasksOverviewChartProps {
  data: TasksOverviewRow[];
}

const TasksOverviewChart: React.FC<TasksOverviewChartProps> = ({ data }) => {
  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-info" /> Completed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" /> In Progress
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Overdue
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <Tooltip labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')} />
          <Area type="monotone" dataKey="completed" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
          <Area type="monotone" dataKey="inProgress" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={2} />
          <Area type="monotone" dataKey="overdue" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasksOverviewChart;
