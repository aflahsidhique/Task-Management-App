'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ReportService, {
  ByProjectReportRow,
  ByStatusReportRow,
  ByUserReportRow,
} from '../../../services/reportService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../../components/ui/Table';
import LoadingDots from '../../../components/ui/LoadingDots';

type GroupBy = 'project' | 'user' | 'status';

export default function ReportsPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>('project');
  const [byProject, setByProject] = useState<ByProjectReportRow[]>([]);
  const [byUser, setByUser] = useState<ByUserReportRow[]>([]);
  const [byStatus, setByStatus] = useState<ByStatusReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([ReportService.byProject(), ReportService.byUser(), ReportService.byStatus()])
      .then(([p, u, s]) => {
        setByProject(p);
        setByUser(u);
        setByStatus(s);
      })
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const chartData =
    groupBy === 'project'
      ? byProject.map((r) => ({ name: r.projectName, total: r.totalTasks, completed: r.completedTasks }))
      : groupBy === 'user'
        ? byUser.map((r) => ({ name: r.userName, total: r.totalTasks, completed: r.completedTasks }))
        : byStatus.map((r) => ({ name: r.status, total: r.count, completed: r.count }));

  return (
    <div>
      <PageHeader
        title="Reports"
        right={
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="project">By Project</option>
            <option value="user">By User</option>
            <option value="status">By Status</option>
          </select>
        }
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingDots />
        </div>
      ) : (
        <>
          <Card title="Task Completion" className="mb-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Breakdown">
            {groupBy === 'project' && (
              <Table>
                <Thead>
                  <Th>Project</Th>
                  <Th>Total Tasks</Th>
                  <Th>Completed</Th>
                  <Th>Completion Rate</Th>
                </Thead>
                <Tbody>
                  {byProject.map((r) => (
                    <Tr key={r.projectId}>
                      <Td className="font-medium text-gray-900">{r.projectName}</Td>
                      <Td>{r.totalTasks}</Td>
                      <Td>{r.completedTasks}</Td>
                      <Td>{r.completionRate}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
            {groupBy === 'user' && (
              <Table>
                <Thead>
                  <Th>User</Th>
                  <Th>Total Tasks</Th>
                  <Th>Completed</Th>
                  <Th>Completion Rate</Th>
                </Thead>
                <Tbody>
                  {byUser.map((r) => (
                    <Tr key={r.userId}>
                      <Td className="font-medium text-gray-900">{r.userName}</Td>
                      <Td>{r.totalTasks}</Td>
                      <Td>{r.completedTasks}</Td>
                      <Td>{r.completionRate}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
            {groupBy === 'status' && (
              <Table>
                <Thead>
                  <Th>Status</Th>
                  <Th>Count</Th>
                </Thead>
                <Tbody>
                  {byStatus.map((r) => (
                    <Tr key={r.status}>
                      <Td className="font-medium text-gray-900">{r.status}</Td>
                      <Td>{r.count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
