function AnalyticsCard({ label, value, change, tone }) {
  const toneClasses = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}>
          {change}
        </span>
      </div>
    </article>
  );
}

export default AnalyticsCard;
