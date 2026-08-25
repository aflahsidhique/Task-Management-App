interface StatCardProps {
  label: string;
  value: number;
  deltaPercent: number;
  icon: React.ReactNode;
  iconBgClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  deltaPercent,
  icon,
  iconBgClassName = 'bg-primary-100 text-primary-600',
}) => {
  const isPositive = deltaPercent >= 0;
  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBgClassName}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</div>
      <div className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
        <span>{isPositive ? '↑' : '↓'}</span>
        <span>{Math.abs(deltaPercent)}% vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;
