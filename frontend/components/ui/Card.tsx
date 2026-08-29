interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, action, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-card shadow-card p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
