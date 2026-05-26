import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Sidebar from '../components/Sidebar.jsx';
import { downloadTextFile } from '../utils/bulkUpload.js';

const reportFiles = [
  {
    name: 'Workflow execution summary',
    type: 'CSV',
    owner: 'Operations',
    updated: 'Today, 10:30 AM',
    rows: 1248,
  },
  {
    name: 'SLA exception report',
    type: 'CSV',
    owner: 'Service Management',
    updated: 'Today, 09:15 AM',
    rows: 42,
  },
  {
    name: 'Failed jobs audit',
    type: 'JSON',
    owner: 'Platform',
    updated: 'Yesterday, 06:40 PM',
    rows: 18,
  },
];

const workflowAnalytics = [
  { day: 'Mon', completed: 42, failed: 3, queued: 12 },
  { day: 'Tue', completed: 58, failed: 4, queued: 18 },
  { day: 'Wed', completed: 51, failed: 2, queued: 14 },
  { day: 'Thu', completed: 67, failed: 5, queued: 20 },
  { day: 'Fri', completed: 74, failed: 3, queued: 16 },
  { day: 'Sat', completed: 46, failed: 1, queued: 8 },
  { day: 'Sun', completed: 39, failed: 2, queued: 6 },
];

const throughputTrend = [
  { week: 'W1', runtime: 11.4, volume: 286 },
  { week: 'W2', runtime: 9.8, volume: 314 },
  { week: 'W3', runtime: 8.9, volume: 348 },
  { week: 'W4', runtime: 8.2, volume: 371 },
];

const buildCsv = (report) =>
  [
    'report,owner,type,rows,updated',
    `"${report.name}","${report.owner}",${report.type},${report.rows},"${report.updated}"`,
  ].join('\n');

function Reports() {
  const exportReport = (report) => {
    const extension = report.type.toLowerCase();
    const filename = `${report.name.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    const content = report.type === 'JSON'
      ? JSON.stringify(report, null, 2)
      : buildCsv(report);
    const mimeType = report.type === 'JSON' ? 'application/json' : 'text/csv;charset=utf-8';

    downloadTextFile(filename, content, mimeType);
  };

  const exportAnalytics = () => {
    const header = 'day,completed,failed,queued';
    const rows = workflowAnalytics.map((item) => `${item.day},${item.completed},${item.failed},${item.queued}`);
    downloadTextFile('workflow-analytics.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />

      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">Reports</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Workflow Analytics</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Review workflow performance, export operational reports, and track execution quality.
            </p>
          </div>
          <button
            type="button"
            onClick={exportAnalytics}
            className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Export Analytics
          </button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Completed Runs', '377', '+9.6%'],
            ['Failure Rate', '2.8%', '-0.7%'],
            ['Median Runtime', '8.2m', '-1.6m'],
            ['Queued Jobs', '94', '+14'],
          ].map(([label, value, change]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
              <p className="mt-2 text-sm text-slate-500">{change} this week</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Execution Volume</h2>
                <p className="mt-1 text-sm text-slate-500">Completed, failed, and queued workflows by day.</p>
              </div>
            </div>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workflowAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="queued" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Runtime Trend</h2>
            <p className="mt-1 text-sm text-slate-500">Average runtime across the last four weeks.</p>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputTrend}>
                  <defs>
                    <linearGradient id="runtimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="runtime" stroke="#2563eb" fill="url(#runtimeGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Downloadable Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Mock exports are available while report APIs are offline.</p>
          </div>
          <div className="divide-y divide-slate-200">
            {reportFiles.map((report) => (
              <div key={report.name} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{report.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.owner} · {report.rows.toLocaleString()} rows · Updated {report.updated}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportReport(report)}
                  className="w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Download {report.type}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Reports;
