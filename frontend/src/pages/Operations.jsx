import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const queueItems = [
  {
    id: 'OP-1048',
    workflow: 'Inventory Sync',
    owner: 'Operations',
    status: 'running',
    priority: 'high',
    queuedAt: '10:12 AM',
    duration: '12m',
  },
  {
    id: 'OP-1047',
    workflow: 'Approval Pipeline',
    owner: 'Finance',
    status: 'queued',
    priority: 'medium',
    queuedAt: '10:08 AM',
    duration: 'Pending',
  },
  {
    id: 'OP-1046',
    workflow: 'Nightly Report',
    owner: 'Compliance',
    status: 'completed',
    priority: 'low',
    queuedAt: '09:44 AM',
    duration: '7m',
  },
  {
    id: 'OP-1045',
    workflow: 'Payment Reconciliation',
    owner: 'Finance',
    status: 'failed',
    priority: 'high',
    queuedAt: '09:21 AM',
    duration: '3m',
  },
  {
    id: 'OP-1044',
    workflow: 'Customer Onboarding',
    owner: 'Customer Success',
    status: 'paused',
    priority: 'medium',
    queuedAt: '08:58 AM',
    duration: 'Paused',
  },
];

const historyItems = [
  ['Successful Runs', '148', '+12 today', 'emerald'],
  ['Average Runtime', '8.4m', '-1.1m from last week', 'blue'],
  ['Retry Queue', '6', '2 high priority', 'amber'],
  ['Failed Executions', '3', 'Needs review', 'rose'],
];

const statusClasses = {
  queued: 'bg-blue-50 text-blue-700 ring-blue-200',
  running: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
  paused: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const toneClasses = {
  emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  blue: 'text-blue-700 bg-blue-50 ring-blue-200',
  amber: 'text-amber-700 bg-amber-50 ring-amber-200',
  rose: 'text-rose-700 bg-rose-50 ring-rose-200',
};

function Operations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredQueue = useMemo(
    () =>
      queueItems.filter((item) => {
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const searchable = `${item.id} ${item.workflow} ${item.owner} ${item.priority}`.toLowerCase();
        return matchesStatus && searchable.includes(searchTerm.toLowerCase());
      }),
    [searchTerm, statusFilter],
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />

      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">Operations</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Execution Queue</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Track queued, running, and failed workflow executions from the operations console.
            </p>
          </div>
          <button className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Run Queue Sweep
          </button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {historyItems.map(([label, value, detail, tone]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}>
                  Live
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Operations Queue</h2>
                <p className="mt-1 text-sm text-slate-500">Search by job, workflow, owner, or priority.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search queue"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All statuses</option>
                  <option value="queued">Queued</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Job', 'Workflow', 'Owner', 'Priority', 'Queued', 'Runtime', 'Status'].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredQueue.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-950">{item.id}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{item.workflow}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{item.owner}</td>
                      <td className="px-5 py-4 text-sm capitalize text-slate-700">{item.priority}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{item.queuedAt}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{item.duration}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClasses[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredQueue.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-sm text-slate-500">
                        No operations match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Execution History</h2>
            <div className="mt-5 space-y-4">
              {queueItems.slice(0, 4).map((item) => (
                <div key={`${item.id}-history`} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.workflow}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.id} by {item.owner}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClasses[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Queued at {item.queuedAt}; runtime {item.duration}.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Operations;
