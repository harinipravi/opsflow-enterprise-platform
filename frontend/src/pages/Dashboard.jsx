import { useEffect, useState } from 'react';
import AnalyticsCard from '../components/AnalyticsCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import {
  fetchDashboardActivity,
  fetchDashboardStats,
} from '../services/dashboardApi.js';

const throughput = [48, 72, 58, 86, 68, 94, 78];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const activityDotClasses = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  danger: 'bg-rose-500',
};

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        console.log('[Dashboard] loading dashboard data');

        const [statsData, activityData] = await Promise.all([
          fetchDashboardStats(),
          fetchDashboardActivity(),
        ]);

        if (!isMounted) {
          return;
        }

        console.log('[Dashboard] dashboard data loaded', {
          statsCount: statsData.length,
          activityCount: activityData.length,
        });
        setStats(Array.isArray(statsData) ? statsData : []);
        setActivity(Array.isArray(activityData) ? activityData : []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error('[Dashboard] failed to load dashboard data', requestError);
        setStats([]);
        setActivity([]);
        setError('Unable to load dashboard data. Make sure the backend is running on localhost:5000.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />

      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Operations Overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor workflow volume, task queues, service levels, and job health from one view.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              Export
            </button>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              New Workflow
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <article
                  key={index}
                  className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="mt-5 h-8 w-20 rounded bg-slate-200" />
                </article>
              ))
            : stats.map((item) => (
                <AnalyticsCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  change={item.change}
                  tone={item.tone}
                />
              ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Workflow Throughput</h2>
                <p className="mt-1 text-sm text-slate-500">Completed jobs across the current week.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Healthy
              </span>
            </div>

            <div className="mt-8 flex h-64 items-end gap-3 border-b border-l border-slate-200 px-3 pb-3">
              {throughput.map((height, index) => (
                <div key={height} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-blue-600"
                    style={{ height: `${height}%` }}
                    aria-label={`Day ${index + 1} throughput`}
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {weekdays[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="mt-5 space-y-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex animate-pulse gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))
                : activity.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          activityDotClasses[item.type] || 'bg-slate-400'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
