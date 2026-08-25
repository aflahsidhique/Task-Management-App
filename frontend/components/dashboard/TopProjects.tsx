import { TopProject } from '../../services/dashboardService';
import Badge, { statusLabel, statusToVariant } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { FaFolderOpen } from 'react-icons/fa';

const TopProjects: React.FC<{ projects: TopProject[] }> = ({ projects }) => {
  if (projects.length === 0) {
    return <p className="text-sm text-gray-400">No projects yet.</p>;
  }
  return (
    <ul className="space-y-4">
      {projects.map((p) => (
        <li key={p.id} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
            <FaFolderOpen size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
              <Badge variant={statusToVariant(p.status)}>{statusLabel(p.status)}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <ProgressBar percent={p.progressPercent} />
              <span className="text-xs text-gray-500 shrink-0">{p.progressPercent}%</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TopProjects;
