import { StatMetric } from '../../services/dashboardService';

const TeamMembersCard: React.FC<{ metric: StatMetric }> = ({ metric }) => {
  const isPositive = metric.deltaPercent >= 0;
  return (
    <div className="bg-white rounded-card shadow-card px-5 py-3">
      <p className="text-sm text-gray-500">
        Team Members: <span className="font-semibold text-gray-900">{metric.value}</span>
      </p>
      <p className={`text-xs ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(metric.deltaPercent)}% vs last month
      </p>
    </div>
  );
};

export default TeamMembersCard;
