import Link from 'next/link';
import { FaFileExcel, FaPlus } from 'react-icons/fa';

interface HeaderProps {
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport }) => {
  return (
    <div className="bg-primary p-4 rounded-card">
      <div className="flex flex-col md:flex-row md:justify-between items-center">
        <h1 className="text-2xl font-semibold text-white mb-4 md:mb-0">Tasks</h1>
        <div className="flex flex-col space-y-1 md:space-y-0 md:flex-row md:space-x-4">
          <button onClick={onExport} className="bg-white text-primary px-6 py-3 rounded-lg flex items-center justify-center w-full md:w-auto">
            <FaFileExcel className="mr-2" /> Export to Excel
          </button>
          <Link href="/tasks/new" className="bg-white text-primary px-6 py-3 rounded-lg flex items-center justify-center w-full md:w-auto">
            <FaPlus className="mr-2" /> Add New Task
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
