import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Operations', to: '/operations' },
  { label: 'Workflows', to: '/workflows' },
  { label: 'Bulk Upload', to: '/bulk-upload' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
];

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-slate-200 bg-white px-4 py-5 md:w-64">
      <div className="px-2">
        <p className="text-xl font-semibold text-slate-950">OpsFlow</p>
        <p className="mt-1 text-sm text-slate-500">Operations console</p>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              ].join(' ')
            }
          >
            <span>{item.label}</span>
            {item.label === 'Dashboard' && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">System status</p>
        <p className="mt-2 text-sm text-slate-600">All monitored services are online.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
