import { format } from 'date-fns';
import { UpcomingDeadline } from '../../services/dashboardService';
import Badge, { statusToVariant } from '../ui/Badge';

const UpcomingDeadlines: React.FC<{ deadlines: UpcomingDeadline[] }> = ({ deadlines }) => {
  if (deadlines.length === 0) {
    return <p className="text-sm text-gray-400">No upcoming deadlines.</p>;
  }
  return (
    <ul className="space-y-4">
      {deadlines.map((d) => (
        <li key={`${d.type}-${d.id}`} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
            {d.projectName && <p className="text-xs text-gray-400">{d.projectName}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={statusToVariant(d.priority)}>{d.priority}</Badge>
            <span className="text-xs text-gray-500">{format(new Date(d.dueDate), 'MMM d')}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UpcomingDeadlines;
