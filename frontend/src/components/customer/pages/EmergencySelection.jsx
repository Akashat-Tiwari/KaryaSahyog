import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { EMERGENCY_SERVICES, SERVICES_CATALOG } from '../../../data/servicesData';
import { startServiceFlow } from '../../../utils/bookingFlow';
import { ServiceIcon } from '../../../utils/serviceIcons';
import { updateBookingContext } from '../../../api/customerService';

export default function EmergencySelection() {
  const navigate = useNavigate();

  const choose = (item) => {
    updateBookingContext({ serviceType: 'Emergency' });
    if (item.id === 'appliance') {
      startServiceFlow(navigate, {
        service: { name: 'Appliance Repair', id: 'appliance', category: 'appliance', startingPrice: 349, emergencySupported: true },
        serviceType: 'Emergency',
        goToAppliance: true,
      });
      return;
    }
    const matched = SERVICES_CATALOG.find((s) => s.id === item.id) || SERVICES_CATALOG.find((s) => s.category === item.id);
    startServiceFlow(navigate, {
      service: matched || { name: item.name, category: item.id, startingPrice: 399, emergencySupported: true, id: item.id },
      serviceType: 'Emergency',
    });
  };

  return (
    <CustomerLayout title="What service do you need?" subtitle="Emergency help starts with choosing the right service.">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EMERGENCY_SERVICES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choose(item)}
            className="flex items-center justify-between bg-white border border-rose-200 rounded-xl p-4 text-left hover:bg-rose-50/50 hover:border-rose-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <ServiceIcon name={item.icon} />
              </div>
              <span className="font-semibold text-slate-900">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-md">Urgent</span>
          </button>
        ))}
      </div>
    </CustomerLayout>
  );
}
