import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/users';
const initialForm = { name: '', email: '', role: '' };
const sections = ['Dashboard', 'Users', 'Reports', 'Settings'];

function App() {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUsers(data);
      setMessage('User list updated.');
    } catch (error) {
      setMessage('Unable to load users. Make sure the backend is running.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const roleCounts = useMemo(() => {
    return users.reduce((counts, user) => {
      const role = user.role || 'Unknown';
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    }, {});
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = [user.name, user.email, user.role].some((value) =>
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const allRoles = useMemo(() => {
    return ['All', ...new Set(users.map((user) => user.role || 'Unknown'))];
  }, [users]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.role) {
      setMessage('Please fill in all fields.');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      setMessage(editingId ? 'User updated successfully.' : 'User added successfully.');
      setForm(initialForm);
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage('Save failed. Check backend and try again.');
    }
  };

  const handleEdit = (user) => {
    setActiveSection('Users');
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
    setMessage('Editing user. Submit to save changes.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      setMessage('User deleted successfully.');
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete user.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setMessage('Edit canceled.');
  };

  const renderDashboard = () => (
    <>
      <section className="card summary-card">
        <div className="summary-header">
          <div>
            <p className="eyebrow">ERP lite overview</p>
            <h2>System metrics</h2>
          </div>
          <button onClick={fetchUsers}>Refresh data</button>
        </div>

        <div className="dashboard-grid">
          <div className="metric-card gradient-blue">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
          <div className="metric-card gradient-purple">
            <span>Unique Roles</span>
            <strong>{Object.keys(roleCounts).length}</strong>
          </div>
          <div className="metric-card gradient-green">
            <span>Active modules</span>
            <strong>4</strong>
          </div>
          <div className="metric-card gradient-orange">
            <span>Pending tasks</span>
            <strong>12</strong>
          </div>
        </div>
      </section>

      <section className="card status-card">
        <h3>Role distribution</h3>
        <div className="status-badges">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className="status-pill">
              <span>{role}</span>
              <strong>{count}</strong>
            </div>
          ))}
          {Object.keys(roleCounts).length === 0 && <p>No users available yet.</p>}
        </div>
      </section>

      <section className="card quick-card">
        <h3>Quick actions</h3>
        <div className="quick-actions">
          <button onClick={() => setActiveSection('Users')}>Manage users</button>
          <button onClick={() => window.open('https://github.com', '_blank')}>View docs</button>
          <button onClick={() => setMessage('ERP lite reports are coming soon!')}>Generate report</button>
        </div>
      </section>
    </>
  );

  const renderUsers = () => (
    <div className="content-columns">
      <section className="card form-card">
        <h2>{editingId ? 'Edit User' : 'Create User'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter name" />
          </label>
          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
          </label>
          <label>
            Role
            <input name="role" value={form.role} onChange={handleChange} placeholder="Enter role" />
          </label>

          <div className="form-actions">
            <button type="submit">{editingId ? 'Update User' : 'Add User'}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card table-card">
        <div className="list-header">
          <div>
            <h2>User Directory</h2>
            <p>Manage employee and account records from one place.</p>
          </div>
          <div className="filters">
            <input
              type="search"
              placeholder="Search by name, email, role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              {allRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No matching users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>ERP lite</strong>
            <p>Admin portal</p>
          </div>
        </div>

        <nav>
          {sections.map((section) => (
            <button
              key={section}
              className={activeSection === section ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Built for lightweight ERP workflows.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Enterprise resource planning</p>
            <h1>{activeSection}</h1>
          </div>
          <div className="topbar-actions">
            <button onClick={() => setActiveSection('Dashboard')}>Home</button>
            <button className="secondary">Support</button>
          </div>
        </header>

        {activeSection === 'Dashboard' && renderDashboard()}
        {activeSection === 'Users' && renderUsers()}
        {activeSection === 'Reports' && (
          <section className="card report-card">
            <h2>Reports</h2>
            <p>Use the ERP lite dashboard to monitor activity, manage users, and plan workflows.</p>
            <div className="report-grid">
              <div className="report-box">
                <h3>Revenue</h3>
                <p>$38,200</p>
              </div>
              <div className="report-box">
                <h3>Operations</h3>
                <p>92% uptime</p>
              </div>
              <div className="report-box">
                <h3>Inventory</h3>
                <p>124 items</p>
              </div>
            </div>
          </section>
        )}
        {activeSection === 'Settings' && (
          <section className="card report-card">
            <h2>System settings</h2>
            <p>Configure ERP lite preferences here. Future settings and integrations will appear in this panel.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
