import {
  getDashboardStatsFromDb,
  getRecentActivityFromDb,
} from '../models/dashboard.model.js';

export const getDashboardStats = async (req, res) => {
  const startedAt = Date.now();
  console.log('[dashboard.controller] GET /api/dashboard/stats started');

  try {
    const stats = await getDashboardStatsFromDb();

    console.log(`[dashboard.controller] GET /api/dashboard/stats returned ${stats.length} rows in ${Date.now() - startedAt}ms`);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[dashboard.controller] GET /api/dashboard/stats failed', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
    });
  }
};

export const getDashboardActivity = async (req, res) => {
  const startedAt = Date.now();
  console.log('[dashboard.controller] GET /api/dashboard/activity started');

  try {
    const activity = await getRecentActivityFromDb();

    console.log(`[dashboard.controller] GET /api/dashboard/activity returned ${activity.length} rows in ${Date.now() - startedAt}ms`);
    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('[dashboard.controller] GET /api/dashboard/activity failed', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
    });
  }
};
