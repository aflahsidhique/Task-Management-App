import { format } from 'date-fns';
import { MyTaskRow } from '../../services/dashboardService';
import { Table, Tbody, Td, Th, Thead, Tr } from '../ui/Table';
import Badge, { statusLabel, statusToVariant } from '../ui/Badge';

const MyTasksTable: React.FC<{ tasks: MyTaskRow[] }> = ({ tasks }) => {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-400">No tasks assigned to you yet.</p>;
  }
  return (
    <Table>
      <Thead>
        <Th>Task</Th>
        <Th>Project</Th>
        <Th>Due Date</Th>
        <Th>Priority</Th>
        <Th>Status</Th>
      </Thead>
      <Tbody>
        {tasks.map((t) => (
          <Tr key={t.id}>
            <Td className="font-medium text-gray-900">{t.title}</Td>
            <Td>{t.projectName ?? '—'}</Td>
            <Td>{t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '—'}</Td>
            <Td>
              <Badge variant={statusToVariant(t.priority)}>{t.priority}</Badge>
            </Td>
            <Td>
              <Badge variant={statusToVariant(t.status)}>{statusLabel(t.status)}</Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default MyTasksTable;
