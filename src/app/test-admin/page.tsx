'use client';

import { useEffect, useState } from 'react';

export default function TestAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUser(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser = Object.fromEntries(formData.entries());
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUsers(); // Refresh the list
    } catch (e: any) {
      setError(e.message);
    }
  };

  const updateUser = async (id: string) => {
    const newName = prompt('Enter new name');
    if (!newName) return;
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUsers(); // Refresh the list
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUsers(); // Refresh the list
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error} (You must be an admin to view this page)</div>;
  }

  return (
    <div>
      <h1>Users Admin</h1>

      <h2>Add User</h2>
      <form onSubmit={createUser}>
        <input name='email' placeholder='Email' required />
        <input name='name' placeholder='Name' required />
        <input name='role' placeholder='Role (e.g., USER, ADMIN)' required />
        <button type='submit'>Add User</button>
      </form>

      <h2>All Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
            <button onClick={() => fetchUser(u.id)}>View Details</button>
            <button onClick={() => updateUser(u.id)}>Update Name</button>
            <button onClick={() => deleteUser(u.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {user && (
        <div>
          <h2>User Details</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button onClick={() => setUser(null)}>Clear</button>
        </div>
      )}
    </div>
  );
}
