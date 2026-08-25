import { formatDistanceToNow } from 'date-fns';
import { RecentActivityRow } from '../../services/dashboardService';
import Avatar from '../ui/Avatar';

const RecentActivities: React.FC<{ activities: RecentActivityRow[] }> = ({ activities }) => {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-400">No recent activity.</p>;
  }
  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start gap-3">
          <Avatar name={activity.actorName} avatarUrl={activity.actorAvatar} size="sm" />
          <div className="min-w-0">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">{activity.actorName}</span>{' '}
              {activity.description}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivities;
