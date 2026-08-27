'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TaskService, { Task } from '../../../services/taskService';
import ProjectService, { Project } from '../../../services/projectService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge, { statusToVariant } from '../../../components/ui/Badge';
import LoadingDots from '../../../components/ui/LoadingDots';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([TaskService.getTasks(), ProjectService.getProjects()])
      .then(([t, p]) => {
        setTasks(t);
        setProjects(p);
      })
      .catch((err) => console.error('Failed to load calendar data:', err))
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const itemsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter((t) => t.dueDate?.slice(0, 10) === dayStr);
    const dayProjects = projects.filter((p) => p.endDate?.slice(0, 10) === dayStr);
    return { dayTasks, dayProjects };
  };

  return (
    <div>
      <PageHeader
        title="Calendar"
        right={
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="text-gray-500">
              <FaChevronLeft />
            </button>
            <span className="text-sm font-medium text-gray-900 w-32 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="text-gray-500">
              <FaChevronRight />
            </button>
          </div>
        }
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingDots />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-medium text-gray-400 text-center pb-2">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const { dayTasks, dayProjects } = itemsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[92px] rounded-lg border p-1.5 text-xs ${
                    isSameMonth(day, currentMonth) ? 'border-gray-100' : 'border-gray-50 bg-gray-50/50'
                  } ${isToday(day) ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div
                    className={`text-right mb-1 ${
                      isSameMonth(day, currentMonth) ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div key={`task-${t.id}`}>
                        <Badge variant={statusToVariant(t.priority)}>{t.title}</Badge>
                      </div>
                    ))}
                    {dayProjects.slice(0, 1).map((p) => (
                      <div key={`project-${p.id}`}>
                        <Badge variant="neutral">📌 {p.name}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
