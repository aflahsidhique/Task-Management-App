import { TeamWorkloadRow } from '../../services/dashboardService';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';

const TeamWorkload: React.FC<{ workload: TeamWorkloadRow[] }> = ({ workload }) => {
  if (workload.length === 0) {
    return <p className="text-sm text-gray-400">No workload data yet.</p>;
  }
  return (
    <ul className="space-y-4">
      {workload.map((w) => (
        <li key={w.userId} className="flex items-center gap-3">
          <Avatar name={w.name} avatarUrl={w.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate mb-1">{w.name}</p>
            <div className="flex items-center gap-2">
              <ProgressBar percent={w.progressPercent} />
              <span className="text-xs text-gray-500 shrink-0">{w.progressPercent}%</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TeamWorkload;
