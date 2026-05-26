import { executeQuery } from '../config/db.js';

console.log('[dashboard.model] loaded');

const formatChange = (value, fallback = '0') => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return Number(value) > 0 ? `+${value}` : String(value);
};

export const getDashboardStatsFromDb = async () => {
  console.log('[dashboard.model] fetching stats');

  const [workflowStats] = await executeQuery('dashboard.stats.workflows', `
    SELECT
      COALESCE(SUM(status = 'active'), 0) AS activeWorkflows,
      COALESCE(SUM(status = 'draft'), 0) AS draftWorkflows,
      COALESCE(SUM(status = 'paused'), 0) AS pausedWorkflows
    FROM workflows
  `);

  const [activityStats] = await executeQuery('dashboard.stats.activities', `
    SELECT
      COALESCE(SUM(status = 'pending'), 0) AS pendingTasks,
      COALESCE(SUM(status = 'queued'), 0) AS slaAlerts,
      COALESCE(SUM(status = 'failed'), 0) AS failedJobs
    FROM activities
  `);

  return [
    {
      label: 'Active Workflows',
      value: Number(workflowStats.activeWorkflows || 0),
      change: formatChange(workflowStats.draftWorkflows || 0),
      tone: 'green',
    },
    {
      label: 'Pending Tasks',
      value: Number(activityStats.pendingTasks || 0),
      change: formatChange(workflowStats.pausedWorkflows || 0),
      tone: 'blue',
    },
    {
      label: 'SLA Alerts',
      value: Number(activityStats.slaAlerts || 0),
      change: formatChange(activityStats.slaAlerts || 0),
      tone: 'amber',
    },
    {
      label: 'Failed Jobs',
      value: Number(activityStats.failedJobs || 0),
      change: formatChange(activityStats.failedJobs ? -activityStats.failedJobs : 0),
      tone: 'rose',
    },
  ];
};

export const getRecentActivityFromDb = async () => {
  console.log('[dashboard.model] fetching recent activity');

  return executeQuery('dashboard.activity.recent', `
    SELECT
      id,
      title,
      description,
      activity_type AS activityType,
      status,
      tone AS type,
      occurred_at AS occurredAt,
      CASE
        WHEN TIMESTAMPDIFF(MINUTE, occurred_at, NOW()) < 60
          THEN CONCAT(TIMESTAMPDIFF(MINUTE, occurred_at, NOW()), 'm ago')
        WHEN TIMESTAMPDIFF(HOUR, occurred_at, NOW()) < 24
          THEN CONCAT(TIMESTAMPDIFF(HOUR, occurred_at, NOW()), 'h ago')
        ELSE CONCAT(TIMESTAMPDIFF(DAY, occurred_at, NOW()), 'd ago')
      END AS timestamp
    FROM activities
    ORDER BY occurred_at DESC
    LIMIT 8
  `);
};
