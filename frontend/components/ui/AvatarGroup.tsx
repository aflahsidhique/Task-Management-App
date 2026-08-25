import Avatar from './Avatar';

interface AvatarGroupProps {
  members: { id: number; name: string; avatarUrl?: string | null }[];
  max?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ members, max = 4 }) => {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <Avatar key={m.id} name={m.name} avatarUrl={m.avatarUrl} size="sm" />
      ))}
      {overflow > 0 && (
        <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
