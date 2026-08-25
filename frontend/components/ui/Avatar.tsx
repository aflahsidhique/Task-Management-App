interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const palette = ['bg-primary-500', 'bg-info', 'bg-success', 'bg-warning', 'bg-danger'];

function colorFor(name: string): string {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 'md' }) => {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-white`}
      />
    );
  }
  return (
    <div
      title={name}
      className={`${sizeClasses[size]} ${colorFor(name)} rounded-full flex items-center justify-center text-white font-medium border-2 border-white`}
    >
      {initials(name)}
    </div>
  );
};

export default Avatar;
