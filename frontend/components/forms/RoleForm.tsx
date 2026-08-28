'use client';

import { FormEvent, useState } from 'react';
import Button from '../ui/Button';
import { FaSave } from 'react-icons/fa';
import { RoleInput } from '../../services/roleService';

interface RoleFormProps {
  initialData: { name: string; description: string; permissions: string[] };
  onSubmit: (role: RoleInput) => void;
  buttonText: string;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, buttonText }) => {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [permissionsText, setPermissionsText] = useState(initialData.permissions.join(', '));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      description,
      permissions: permissionsText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    });
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
        <input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="permissions">
          Permissions (comma-separated)
        </label>
        <input
          id="permissions"
          value={permissionsText}
          onChange={(e) => setPermissionsText(e.target.value)}
          placeholder="manage_tasks, manage_projects"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <Button type="submit" text={buttonText} icon={<FaSave />} />
    </form>
  );
};

export default RoleForm;
