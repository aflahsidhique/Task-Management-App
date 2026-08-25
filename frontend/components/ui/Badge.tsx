export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger-text',
  info: 'bg-info-bg text-info-text',
  neutral: 'bg-gray-100 text-gray-600',
};

const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};

export default Badge;

export function statusToVariant(status: string): BadgeVariant {
  switch (status) {
    case 'ON_TRACK':
    case 'DONE':
    case 'COMPLETED':
    case 'LOW':
      return 'success';
    case 'AT_RISK':
    case 'IN_REVIEW':
    case 'MEDIUM':
      return 'warning';
    case 'DELAYED':
    case 'HIGH':
      return 'danger';
    case 'IN_PROGRESS':
    case 'TODO':
      return 'info';
    default:
      return 'neutral';
  }
}

export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
