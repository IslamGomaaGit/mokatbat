import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Inbox,
  Send,
  Clock,
  Eye,
  Building2,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileCheck,
  MessageSquare,
  Archive,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalCorrespondences: number;
  incomingCount: number;
  outgoingCount: number;
  pendingReview: number;
  underReview: number;
  totalEntities: number;
  totalUsers: number;
  thisMonthCount: number;
  thisWeekCount: number;
  todayCount: number;
  completedCount: number;
  draftCount: number;
  repliedCount: number;
  statusBreakdown: Record<string, number>;
  completionRate: number;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard</div>;
  }

  const completionRate = stats.totalCorrespondences > 0
    ? ((stats.completedCount / stats.totalCorrespondences) * 100).toFixed(1)
    : '0';

  const statCards = [
    {
      title: t('dashboard.totalCorrespondences'),
      value: stats.totalCorrespondences,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      change: stats.thisMonthCount,
      changeLabel: t('dashboard.thisMonth'),
      link: '/incoming',
    },
    {
      title: t('dashboard.incoming'),
      value: stats.incomingCount,
      icon: Inbox,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      change: stats.incomingCount > 0 ? ((stats.incomingCount / stats.totalCorrespondences) * 100).toFixed(1) + '%' : '0%',
      changeLabel: i18n.language === 'ar' ? 'من الإجمالي' : 'of total',
      link: '/incoming',
    },
    {
      title: t('dashboard.outgoing'),
      value: stats.outgoingCount,
      icon: Send,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      change: stats.outgoingCount > 0 ? ((stats.outgoingCount / stats.totalCorrespondences) * 100).toFixed(1) + '%' : '0%',
      changeLabel: i18n.language === 'ar' ? 'من الإجمالي' : 'of total',
      link: '/outgoing',
    },
    {
      title: t('dashboard.pendingReview'),
      value: stats.pendingReview,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      change: stats.pendingReview,
      changeLabel: i18n.language === 'ar' ? 'في الانتظار' : 'pending',
      link: '/reviews',
    },
    {
      title: t('dashboard.underReview'),
      value: stats.underReview,
      icon: Eye,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      change: stats.underReview,
      changeLabel: i18n.language === 'ar' ? 'قيد المراجعة' : 'in review',
      link: '/reviews',
    },
    {
      title: i18n.language === 'ar' ? 'مكتملة' : 'Completed',
      value: stats.completedCount,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      change: completionRate + '%',
      changeLabel: i18n.language === 'ar' ? 'معدل الإنجاز' : 'completion rate',
      link: '/incoming?status=closed',
    },
    {
      title: i18n.language === 'ar' ? 'مسودات' : 'Drafts',
      value: stats.draftCount,
      icon: FileCheck,
      gradient: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      iconColor: 'text-gray-600 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-800',
      change: stats.draftCount,
      changeLabel: i18n.language === 'ar' ? 'غير منشورة' : 'unpublished',
      link: '/incoming?status=draft',
    },
    {
      title: i18n.language === 'ar' ? 'تم الرد عليها' : 'Replied',
      value: stats.repliedCount,
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      change: stats.repliedCount,
      changeLabel: i18n.language === 'ar' ? 'مع ردود' : 'with replies',
      link: '/incoming?status=replied',
    },
    {
      title: t('dashboard.totalEntities'),
      value: stats.totalEntities,
      icon: Building2,
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      change: stats.totalEntities,
      changeLabel: i18n.language === 'ar' ? 'جهة نشطة' : 'active entities',
      link: '/entities',
    },
    {
      title: t('dashboard.totalUsers'),
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      iconColor: 'text-pink-600 dark:text-pink-400',
      borderColor: 'border-pink-200 dark:border-pink-800',
      change: stats.totalUsers,
      changeLabel: i18n.language === 'ar' ? 'مستخدم نشط' : 'active users',
      link: '/users',
    },
    {
      title: i18n.language === 'ar' ? 'هذا الأسبوع' : 'This Week',
      value: stats.thisWeekCount,
      icon: Calendar,
      gradient: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      iconColor: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-200 dark:border-teal-800',
      change: stats.thisWeekCount,
      changeLabel: i18n.language === 'ar' ? 'مكاتبة جديدة' : 'new correspondences',
      link: '/incoming',
    },
    {
      title: i18n.language === 'ar' ? 'اليوم' : 'Today',
      value: stats.todayCount,
      icon: Activity,
      gradient: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950',
      iconColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-800',
      change: stats.todayCount,
      changeLabel: i18n.language === 'ar' ? 'مكاتبة جديدة' : 'new today',
      link: '/incoming',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {i18n.language === 'ar' 
              ? 'نظرة عامة على نظام المكاتبات والخطابات الرسمية' 
              : 'Overview of the Correspondence Management System'}
          </p>
        </div>
        <Button onClick={() => navigate('/reports')} variant="outline">
          {i18n.language === 'ar' ? 'عرض التقارير' : 'View Reports'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={`${card.bgColor} ${card.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              onClick={() => card.link && navigate(card.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 text-white`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                  {card.change && (
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${card.iconColor}`}>
                        {typeof card.change === 'number' ? card.change : card.change}
                      </div>
                      <div className="text-xs text-muted-foreground">{card.changeLabel}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Breakdown Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {i18n.language === 'ar' ? 'توزيع الحالات' : 'Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => {
                const percentage = stats.totalCorrespondences > 0
                  ? ((count / stats.totalCorrespondences) * 100).toFixed(1)
                  : '0';
                const statusColors: Record<string, string> = {
                  draft: 'bg-gray-500',
                  sent: 'bg-blue-500',
                  received: 'bg-green-500',
                  under_review: 'bg-yellow-500',
                  replied: 'bg-cyan-500',
                  closed: 'bg-emerald-500',
                };
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${statusColors[status] || 'bg-gray-500'} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              {i18n.language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{i18n.language === 'ar' ? 'اليوم' : 'Today'}</div>
                    <div className="text-sm text-muted-foreground">{stats.todayCount} {i18n.language === 'ar' ? 'مكاتبة جديدة' : 'new correspondences'}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todayCount}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium">{i18n.language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</div>
                    <div className="text-sm text-muted-foreground">{stats.thisWeekCount} {i18n.language === 'ar' ? 'مكاتبة جديدة' : 'new correspondences'}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisWeekCount}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Archive className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium">{i18n.language === 'ar' ? 'هذا الشهر' : 'This Month'}</div>
                    <div className="text-sm text-muted-foreground">{stats.thisMonthCount} {i18n.language === 'ar' ? 'مكاتبة جديدة' : 'new correspondences'}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.thisMonthCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {i18n.language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border-2"
              onClick={() => navigate('/create')}
            >
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">{t('nav.create')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border-2"
              onClick={() => navigate('/reviews')}
            >
              <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium">{t('nav.reviews')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border-2"
              onClick={() => navigate('/reports')}
            >
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">{t('nav.reports')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border-2"
              onClick={() => navigate('/entities')}
            >
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">{t('nav.entities')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
