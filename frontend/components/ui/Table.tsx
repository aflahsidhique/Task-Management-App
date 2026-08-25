export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">{children}</table>
  </div>
);

export const Thead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead>
    <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-100">
      {children}
    </tr>
  </thead>
);

export const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="py-3 px-3 font-medium">{children}</th>
);

export const Tbody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gray-50">{children}</tbody>
);

export const Tr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-gray-50">{children}</tr>
);

export const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <td className={`py-3 px-3 text-gray-700 ${className}`}>{children}</td>;
