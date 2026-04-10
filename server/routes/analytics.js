const express = require('express');
const router = express.Router();
const AgentLog = require('../models/AgentLog');
const dayjs = require('dayjs');

router.get('/', async (req, res) => {
  try {
    const totalAudits = await AgentLog.countDocuments();
    const totalFixes = await AgentLog.countDocuments({ confidence: { $gte: 75 } });
    
    const confidenceStats = await AgentLog.aggregate([
      { $group: { _id: null, avg: { $avg: "$confidence" } } }
    ]);
    const averageConfidence = confidenceStats[0]?.avg || 0;

    const recentActivity = await AgentLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('repo prNumber summary confidence createdAt');

    // Activity Timeline (last 7 days)
    const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate();
    const timelineData = await AgentLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Map to a consistent 7-day format even if days are missing
    const activityTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const label = dayjs().subtract(i, 'day').format('ddd');
      const point = timelineData.find(d => d._id === date);
      activityTimeline.push({ date: label, count: point ? point.count : 0 });
    }

    res.json({
      totalAudits,
      totalFixes,
      averageConfidence: Math.round(averageConfidence),
      recentActivity,
      activityTimeline
    });

  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).json({ error: "Failed to compile analytics" });
  }
});

module.exports = router;
