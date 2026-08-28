'use client';

import { FormEvent, useEffect, useState } from 'react';
import Button from '../ui/Button';
import { FaSave } from 'react-icons/fa';
import RoleService, { Role } from '../../services/roleService';

interface UserFormProps {
  initialData: {
    fullName: string;
    email: string;
    jobTitle: string;
    roleId: number;
  };
  onSubmit: (data: { fullName: string; email: string; password?: string; jobTitle?: string; roleId: number }) => void;
  buttonText: string;
  requirePassword?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, buttonText, requirePassword }) => {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [email, setEmail] = useState(initialData.email);
  const [jobTitle, setJobTitle] = useState(initialData.jobTitle);
  const [roleId, setRoleId] = useState(initialData.roleId);
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    RoleService.getRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ fullName, email, jobTitle, roleId, ...(password ? { password } : {}) });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-5">
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="jobTitle">Job Title</label>
        <input
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="role">Role</label>
        <select
          id="role"
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={0}>Select role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
          {requirePassword ? 'Password' : 'Password (leave blank to keep unchanged)'}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={requirePassword}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <Button type="submit" text={buttonText} icon={<FaSave />} />
    </form>
  );
};

export default UserForm;
