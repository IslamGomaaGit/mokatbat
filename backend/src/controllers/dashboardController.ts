import { Response, NextFunction } from 'express';
import Correspondence from '../models/Correspondence';
import Entity from '../models/Entity';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCorrespondences:
 *                   type: integer
 *                 incomingCount:
 *                   type: integer
 *                 outgoingCount:
 *                   type: integer
 *                 pendingReview:
 *                   type: integer
 *                 underReview:
 *                   type: integer
 *                 totalEntities:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 thisMonthCount:
 *                   type: integer
 */
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalCorrespondences = await Correspondence.count();
    const incomingCount = await Correspondence.count({ where: { type: 'incoming' } });
    const outgoingCount = await Correspondence.count({ where: { type: 'outgoing' } });
    const pendingReview = await Correspondence.count({ where: { review_status: 'not_reviewed' } });
    const underReview = await Correspondence.count({ where: { current_status: 'under_review' } });
    const totalEntities = await Entity.count({ where: { is_active: true } });
    const totalUsers = await User.count({ where: { is_active: true } });

    // Date calculations
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    thisWeek.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Status breakdown
    const statusBreakdown: Record<string, number> = {
      draft: await Correspondence.count({ where: { current_status: 'draft' } }),
      sent: await Correspondence.count({ where: { current_status: 'sent' } }),
      received: await Correspondence.count({ where: { current_status: 'received' } }),
      under_review: await Correspondence.count({ where: { current_status: 'under_review' } }),
      replied: await Correspondence.count({ where: { current_status: 'replied' } }),
      closed: await Correspondence.count({ where: { current_status: 'closed' } }),
    };

    // Counts by period
    const thisMonthCount = await Correspondence.count({
      where: {
        created_at: {
          [Op.gte]: thisMonth,
        },
      },
    });

    const thisWeekCount = await Correspondence.count({
      where: {
        created_at: {
          [Op.gte]: thisWeek,
        },
      },
    });

    const todayCount = await Correspondence.count({
      where: {
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    // Completed correspondences
    const completedCount = await Correspondence.count({
      where: {
        current_status: 'closed',
      },
    });

    // Draft correspondences
    const draftCount = await Correspondence.count({
      where: {
        current_status: 'draft',
      },
    });

    // Replied correspondences
    const repliedCount = await Correspondence.count({
      where: {
        current_status: 'replied',
      },
    });

    // Calculate completion rate
    const completionRate = totalCorrespondences > 0
      ? ((completedCount / totalCorrespondences) * 100).toFixed(1)
      : '0';

    res.json({
      totalCorrespondences,
      incomingCount,
      outgoingCount,
      pendingReview,
      underReview,
      totalEntities,
      totalUsers,
      thisMonthCount,
      thisWeekCount,
      todayCount,
      completedCount,
      draftCount,
      repliedCount,
      statusBreakdown,
      completionRate: parseFloat(completionRate),
    });
  } catch (error) {
    next(error);
  }
};

