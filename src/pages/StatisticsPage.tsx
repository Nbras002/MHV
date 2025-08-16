import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermits } from '../hooks/usePermits';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { FileText, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const COLORS = ['#4F008C', '#FF375e', '#FFFDD40', '#FF6a39', '#00C48C', '#1BCED8', '#A54EE1', '#8E9AA0'];

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { permits } = usePermits();
  const { users } = useAuth();

  const statistics = useMemo(() => {
    const totalPermits = permits.length;
    const activePermits = permits.filter(p => !p.closedAt).length;
    const closedPermits = permits.filter(p => p.closedAt).length;

    // Permits by region
    const permitsByRegion = permits.reduce((acc, permit) => {
      acc[permit.region] = (acc[permit.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Permits by type
    const permitsByType = permits.reduce((acc, permit) => {
      acc[permit.requestType] = (acc[permit.requestType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Permits trend (last 30 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const permitsTrend = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = permits.filter(p => p.date === dateStr).length;
      return {
        date: format(date, 'MMM dd'),
        count
      };
    });

    // Top carriers
    const carrierCounts = permits.reduce((acc, permit) => {
      acc[permit.carrierName] = (acc[permit.carrierName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCarriers = Object.entries(carrierCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top closers (users who closed most permits)
    const closerCounts = permits
      .filter(p => p.closedByName)
      .reduce((acc, permit) => {
        acc[permit.closedByName!] = (acc[permit.closedByName!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topClosers = Object.entries(closerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top creators (users who created most permits)
    const creatorCounts = permits.reduce((acc, permit) => {
      const creator = users.find(u => u.id === permit.createdBy);
      if (creator) {
        const creatorName = `${creator.firstName} ${creator.lastName}`;
        acc[creatorName] = (acc[creatorName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCreators = Object.entries(creatorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalPermits,
      activePermits,
      closedPermits,
      permitsByRegion,
      permitsByType,
      permitsTrend,
      topCarriers,
      topClosers,
      topCreators
    };
  }, [permits]);

  const regionChartData = Object.entries(statistics.permitsByRegion).map(([region, count]) => ({
    region: t(`regions.${region}`),
    count
  }));

  const typeChartData = Object.entries(statistics.permitsByType).map(([type, count]) => ({
    type: t(`requestTypes.${type}`),
    count
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('statistics.title')}</h1>
        <p className="text-gray-600">{t('statistics.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('statistics.totalPermits')}</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalPermits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('statistics.activePermits')}</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.activePermits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('statistics.closedPermits')}</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.closedPermits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('statistics.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Permits by Region */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics.permitsByRegion')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F008C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Permits by Type */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics.permitsByType')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Permits Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics.permitsTrend')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statistics.permitsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4F008C" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Carriers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics.topCarriers')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statistics.topCarriers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150}
                  fontSize={12}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#00C48C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Closers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics.topClosers')}</h3>
          <div className="h-80">
            {statistics.topClosers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.topClosers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    fontSize={12}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF375e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('statistics.noData')}
              </div>
            )}
          </div>
        </div>

        {/* Top Creators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statistics.topCreators')}</h3>
          <div className="h-80">
            {statistics.topCreators.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.topCreators} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    fontSize={12}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#A54EE1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('statistics.noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;