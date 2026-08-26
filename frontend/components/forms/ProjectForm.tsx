'use client';

import { FormEvent, useEffect, useState } from 'react';
import Button from '../ui/Button';
import { FaSave } from 'react-icons/fa';
import { ProjectInput, ProjectStatus } from '../../services/projectService';
import UserService, { User } from '../../services/userService';

interface ProjectFormProps {
  initialData: {
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: string;
    endDate: string;
    ownerId: number;
    memberIds: number[];
  };
  onSubmit: (project: ProjectInput) => void;
  buttonText: string;
}

const statuses: ProjectStatus[] = ['ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'ON_HOLD'];

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, buttonText }) => {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [status, setStatus] = useState<ProjectStatus>(initialData.status);
  const [startDate, setStartDate] = useState(initialData.startDate?.slice(0, 10) ?? '');
  const [endDate, setEndDate] = useState(initialData.endDate?.slice(0, 10) ?? '');
  const [ownerId, setOwnerId] = useState(initialData.ownerId);
  const [memberIds, setMemberIds] = useState<number[]>(initialData.memberIds);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    UserService.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const toggleMember = (id: number) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ name, description, status, startDate, endDate, ownerId, memberIds });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-5">
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="owner">Owner</label>
        <select
          id="owner"
          value={ownerId}
          onChange={(e) => setOwnerId(Number(e.target.value))}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={0}>Select owner</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Members</label>
        <div className="flex flex-wrap gap-2">
          {users.map((u) => (
            <button
              type="button"
              key={u.id}
              onClick={() => toggleMember(u.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                memberIds.includes(u.id)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {u.fullName}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" text={buttonText} icon={<FaSave />} />
    </form>
  );
};

export default ProjectForm;
