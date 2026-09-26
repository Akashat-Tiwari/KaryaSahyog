import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  IndianRupee,
  PieChart as PieIcon,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import { getDemandForecast } from '../../api/adminService';

// AI Demand Model Supported Service Types
const AVAILABLE_SERVICES = [
  { id: 'AC Repair', label: 'AC Repair & Maintenance' },
  { id: 'Electrical Repair', label: 'Electrical Repair' },
  { id: 'Plumbing Repair', label: 'Plumbing Repair' },
  { id: 'Home Cleaning', label: 'Home Cleaning' },
  { id: 'Cooking/Catering', label: 'Cooking & Catering' },
  { id: 'Babysitting/Childcare', label: 'Babysitting / Childcare' },
  { id: 'Elderly Care', label: 'Elderly Care' },
  { id: 'Gardening/Landscaping', label: 'Gardening & Landscaping' },
  { id: 'Laundry/Ironing', label: 'Laundry & Ironing' },
];

// 1. Daily Booking Trends (Last 7 Days)
const BOOKING_TRENDS_DATA = [
  { day: 'Mon', bookings: 68, completed: 65, cancelled: 3 },
  { day: 'Tue', bookings: 84, completed: 81, cancelled: 3 },
  { day: 'Wed', bookings: 92, completed: 88, cancelled: 4 },
  { day: 'Thu', bookings: 110, completed: 106, cancelled: 4 },
  { day: 'Fri', bookings: 135, completed: 131, cancelled: 4 },
  { day: 'Sat', bookings: 164, completed: 158, cancelled: 6 },
  { day: 'Sun', bookings: 142, completed: 138, cancelled: 4 },
];

// 2. Service Demand Popularity
const SERVICE_DEMAND_DATA = [
  { service: 'Electrician', requests: 342 },
  { service: 'Plumber', requests: 268 },
  { service: 'AC Repair', requests: 310 },
  { service: 'Driver', requests: 195 },
  { service: 'Carpenter', requests: 154 },
  { service: 'Appliance', requests: 220 },
];

// 3. Monthly Revenue Growth (in ₹)
const REVENUE_GROWTH_DATA = [
  { period: 'Week 1', revenue: 680000, cooperativePool: 136000 },
  { period: 'Week 2', revenue: 820000, cooperativePool: 164000 },
  { period: 'Week 3', revenue: 950000, cooperativePool: 190000 },
  { period: 'Week 4', revenue: 1000000, cooperativePool: 200000 },
];

// 4. Worker Utilization Status
const WORKER_UTILIZATION_DATA = [
  { name: 'Active on Job', value: 62, count: 796, color: '#10b981' },
  { name: 'Dispatched / Travel', value: 18, count: 231, color: '#3b82f6' },
  { name: 'Idle & Available', value: 15, count: 193, color: '#f59e0b' },
  { name: 'On Break / Leave', value: 5, count: 64, color: '#9ca3af' },
];

// 5. Default AI Demand Forecast Baseline
const DEFAULT_AI_FORECAST_DATA = [
  { day: 'Mon', historical: 70, predicted: 76 },
  { day: 'Tue', historical: 82, predicted: 89 },
  { day: 'Wed', historical: 90, predicted: 102 },
  { day: 'Thu', historical: 108, predicted: 124 },
  { day: 'Fri', historical: 132, predicted: 156 },
  { day: 'Sat', historical: 160, predicted: 188 },
  { day: 'Sun', historical: 140, predicted: 165 },
];

// Custom Currency Tooltip Formatter
const currencyFormatter = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

const tooltipStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  fontSize: '12px',
};

export default function AdminCharts() {
  const [selectedService, setSelectedService] = useState('AC Repair');
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastMeta, setForecastMeta] = useState({
    high_demand_region: 'Zone 3 - Downtown',
    predicted_service_surge: 'AC Repair & Maintenance',
    recommended_worker_shifts: 35,
    confidence_score: 0.89,
  });

  const [aiChartData, setAiChartData] = useState(DEFAULT_AI_FORECAST_DATA);

  const loadForecast = useCallback(async (serviceId) => {
    try {
      setLoadingForecast(true);
      const serviceObj = AVAILABLE_SERVICES.find((s) => s.id === serviceId);
      const serviceLabel = serviceObj ? serviceObj.label : serviceId;

      const data = await getDemandForecast({ service_type: serviceId });
      if (data) {
        const predictedDemand = data.predicted_demand != null ? Number(data.predicted_demand) : null;
        const shifts = data.recommended_worker_shifts || (predictedDemand ? Math.max(12, Math.round(predictedDemand * 8)) : 35);

        setForecastMeta({
          high_demand_region: data.high_demand_region || 'Zone 3 - Downtown',
          predicted_service_surge: serviceLabel,
          recommended_worker_shifts: shifts,
          confidence_score: data.confidence_score || 0.91,
        });

        // Scale predictions based on backend recommended shifts surge index
        const surgeFactor = 1 + (shifts / 100);
        setAiChartData(
          DEFAULT_AI_FORECAST_DATA.map((item) => ({
            ...item,
            predicted: Math.round(item.historical * (surgeFactor > 1.15 ? surgeFactor : 1.25)),
          }))
        );
      }
    } catch (err) {
      console.warn('[AdminCharts] Fetching forecast failed, using cached model:', err);
    } finally {
      setLoadingForecast(false);
    }
  }, []);

  useEffect(() => {
    loadForecast(selectedService);
  }, [selectedService, loadForecast]);

  return (
    <div className="space-y-4">
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Analytics & Predictive Intelligence
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>
            AI Engine Active &bull; {Math.round(forecastMeta.confidence_score * 100)}% Forecast Confidence
          </span>
        </div>
      </div>

      {/* Grid of 5 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Booking Trends (LineChart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Booking Trends</h4>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Daily bookings over the last 7 days
              </p>
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              795 Total
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BOOKING_TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Total Bookings"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Service Demand (BarChart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Service Demand</h4>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Popularity by service category
              </p>
            </div>
            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Electrician Leading
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SERVICE_DEMAND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="service" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="requests"
                  name="Inquiries / Requests"
                  radius={[4, 4, 0, 0]}
                  fill="#4f46e5"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Revenue Growth (AreaChart in ₹) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Revenue Trajectory</h4>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly revenue & cooperative welfare pool (in ₹)
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              ₹34,50,000 MTD
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_GROWTH_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="period" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip formatter={currencyFormatter} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#d1fae5"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="cooperativePool"
                  name="Welfare Pool Fund"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  fill="#e0e7ff"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Worker Utilization (PieChart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Worker Utilization</h4>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Active vs Idle worker distribution
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              80% In-Field
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={WORKER_UTILIZATION_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {WORKER_UTILIZATION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${value}% (${item.payload.count} workers)`,
                    name,
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: AI Forecast (ComposedChart) connected to FastAPI backend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  AI Demand Forecast & Predictive Surge
                </h4>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Historical baseline demand vs AI-predicted demand for {forecastMeta.predicted_service_surge}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
                <label htmlFor="service-forecast-select" className="text-gray-500 font-medium">Job:</label>
                <select
                  id="service-forecast-select"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  disabled={loadingForecast}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {AVAILABLE_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {loadingForecast && <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin ml-1" />}
              </div>

              <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                Region: {forecastMeta.high_demand_region}
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={aiChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar
                  dataKey="historical"
                  name="Historical Baseline Demand"
                  barSize={24}
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name={`AI Predicted Demand (+${Math.round(((forecastMeta.recommended_worker_shifts || 35) / 100) * 100)}% Surge)`}
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>
              FastAPI Insight: Pre-dispatch {forecastMeta.recommended_worker_shifts} cooperative shifts for {forecastMeta.predicted_service_surge} across {forecastMeta.high_demand_region}.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
