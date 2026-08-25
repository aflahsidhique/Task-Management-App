import { format } from 'date-fns';
import { RecentProjectRow } from '../../services/dashboardService';
import { Table, Tbody, Td, Th, Thead, Tr } from '../ui/Table';
import Badge, { statusLabel, statusToVariant } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import AvatarGroup from '../ui/AvatarGroup';

const RecentProjectsTable: React.FC<{ projects: RecentProjectRow[] }> = ({ projects }) => {
  return (
    <Table>
      <Thead>
        <Th>Project</Th>
        <Th>Progress</Th>
        <Th>Members</Th>
        <Th>Start - End</Th>
        <Th>Status</Th>
      </Thead>
      <Tbody>
        {projects.map((p) => (
          <Tr key={p.id}>
            <Td className="font-medium text-gray-900">{p.name}</Td>
            <Td>
              <div className="flex items-center gap-2 w-32">
                <ProgressBar percent={p.progressPercent} />
                <span className="text-xs text-gray-500 shrink-0">{p.progressPercent}%</span>
              </div>
            </Td>
            <Td>
              <AvatarGroup members={p.memberAvatars} />
            </Td>
            <Td>
              {format(new Date(p.startDate), 'MMM d')} - {format(new Date(p.endDate), 'MMM d, yyyy')}
            </Td>
            <Td>
              <Badge variant={statusToVariant(p.status)}>{statusLabel(p.status)}</Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default RecentProjectsTable;
