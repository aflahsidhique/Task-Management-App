interface ProgressBarProps {
  percent: number;
  colorClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent, colorClassName = 'bg-primary' }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`${colorClassName} h-2 rounded-full transition-all`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export default ProgressBar;
