import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Siren, Wrench } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingContext } from '../../../api/customerService';
import { startServiceFlow } from '../../../utils/bookingFlow';
import { getServiceById } from '../../../data/servicesData';

export default function ServiceTypeSelection() {
  const navigate = useNavigate();
  const context = getBookingContext();
  const service = getServiceById(context.serviceId) || {
    name: context.service || 'Home Service',
    category: context.serviceCategory || 'general',
    startingPrice: context.price || 0,
    emergencySupported: true,
    id: context.serviceId,
  };

  const choose = (serviceType) => {
    startServiceFlow(navigate, {
      service,
      serviceType,
      appliance: context.appliance,
    });
  };

  const serviceName = context.service || service.name || 'Service';

  return (
    <CustomerLayout
      title="What type of service do you need?"
      subtitle={`${serviceName}${context.appliance ? ` • ${context.appliance}` : ''}`}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Selected service indicator card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Selected Service</p>
            <h2 className="text-base font-bold text-slate-900">{serviceName}</h2>
          </div>
        </div>
        {context.price ? (
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
            From ₹{context.price}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Emergency Service */}
        <button
          type="button"
          onClick={() => choose('Emergency')}
          className="group bg-white border-2 border-rose-200 hover:border-rose-500 hover:bg-rose-50/40 rounded-2xl p-6 text-left transition-all shadow-xs cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
              Emergency Service
            </h3>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
              Immediate
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700 mt-2">Get help as soon as possible</p>
          <p className="text-xs text-slate-500 mt-1">
            We will dispatch the nearest available verified professional for your {serviceName.toLowerCase()} request.
          </p>
        </button>

        {/* Option 2: Schedule Service */}
        <button
          type="button"
          onClick={() => choose('Scheduled')}
          className="group bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-6 text-left transition-all shadow-xs cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Schedule Service
            </h3>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
              Flexible
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700 mt-2">Choose your preferred date and time</p>
          <p className="text-xs text-slate-500 mt-1">
            Select a convenient date and time slot for a top-rated professional to arrive.
          </p>
        </button>
      </div>
    </CustomerLayout>
  );
}
