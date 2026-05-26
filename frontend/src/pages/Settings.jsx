import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const initialProfile = {
  name: 'Operations Admin',
  email: 'ops.admin@example.com',
  team: 'Platform Operations',
};

const initialNotifications = {
  failures: true,
  slaAlerts: true,
  dailyDigest: false,
  deploymentUpdates: true,
};

function Settings() {
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [apiConfig, setApiConfig] = useState({
    baseUrl: API_BASE_URL,
    timeout: '15000',
    environment: 'Local',
  });
  const [dbHealth, setDbHealth] = useState({
    status: 'checking',
    message: 'Checking backend health...',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setDbHealth({
            status: 'online',
            message: `${data.service || 'OpsFlow backend'} is reachable.`,
          });
        } else {
          setDbHealth({
            status: 'degraded',
            message: data.message || 'Backend responded with an error.',
          });
        }
      } catch (error) {
        if (isMounted) {
          setDbHealth({
            status: 'offline',
            message: 'Backend health API is unavailable. Showing saved settings only.',
          });
        }
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleApiChange = (event) => {
    const { name, value } = event.target;
    setApiConfig((current) => ({ ...current, [name]: value }));
  };

  const toggleNotification = (key) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setMessage('Settings saved locally for this session.');
  };

  const healthClasses = {
    checking: 'bg-blue-50 text-blue-700 ring-blue-200',
    online: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    degraded: 'bg-amber-50 text-amber-700 ring-amber-200',
    offline: 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />

      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Workspace Configuration</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Manage profile details, notification preferences, API settings, and backend health checks.
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${healthClasses[dbHealth.status]}`}>
            Database {dbHealth.status}
          </span>
        </header>

        {message && (
          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            {message}
          </div>
        )}

        <form onSubmit={saveSettings} className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Name</span>
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Team</span>
                  <input
                    name="team"
                    value={profile.team}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">API Configuration</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">API Base URL</span>
                  <input
                    name="baseUrl"
                    value={apiConfig.baseUrl}
                    onChange={handleApiChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Timeout</span>
                  <input
                    name="timeout"
                    value={apiConfig.timeout}
                    onChange={handleApiChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Environment</span>
                  <select
                    name="environment"
                    value={apiConfig.environment}
                    onChange={handleApiChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Local</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <div className="mt-5 space-y-4">
                {[
                  ['failures', 'Workflow failures', 'Notify when an execution fails.'],
                  ['slaAlerts', 'SLA alerts', 'Notify when thresholds are crossed.'],
                  ['dailyDigest', 'Daily digest', 'Send a morning summary report.'],
                  ['deploymentUpdates', 'Deployment updates', 'Notify when workflow releases complete.'],
                ].map(([key, label, description]) => (
                  <label key={key} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4">
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">{label}</span>
                      <span className="mt-1 block text-sm text-slate-500">{description}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={() => toggleNotification(key)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Database Health</h2>
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">Backend health endpoint</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${healthClasses[dbHealth.status]}`}>
                    {dbHealth.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{dbHealth.message}</p>
              </div>
              <button
                type="submit"
                className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Save Settings
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

export default Settings;
