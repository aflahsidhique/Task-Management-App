interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode;
  right?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, extra, right }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        {extra}
      </div>
      {right}
    </div>
  );
};

export default PageHeader;
