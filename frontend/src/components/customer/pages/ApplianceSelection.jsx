import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { APPLIANCE_OPTIONS, SERVICES_CATALOG } from '../../../data/servicesData';
import { getBookingContext } from '../../../api/customerService';
import { startServiceFlow } from '../../../utils/bookingFlow';

export default function ApplianceSelection() {
  const navigate = useNavigate();
  const context = getBookingContext();
  const [otherName, setOtherName] = useState('');
  const [showOther, setShowOther] = useState(false);

  const continueWith = (applianceName) => {
    const matched = SERVICES_CATALOG.find((s) => s.appliance === applianceName) || SERVICES_CATALOG.find((s) => s.category === 'appliance');
    startServiceFlow(navigate, {
      service: matched || { name: 'Appliance Repair', category: 'appliance', startingPrice: 349, emergencySupported: true, id: 'appliance' },
      serviceType: context.serviceType || undefined,
      appliance: applianceName,
    });
  };

  return (
    <CustomerLayout title="Which appliance?" subtitle="This stays with your booking until the job is complete.">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {APPLIANCE_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === 'other') {
                setShowOther(true);
                return;
              }
              continueWith(item.name);
            }}
            className="bg-white border border-slate-200 rounded-xl p-4 text-left font-semibold text-slate-900 hover:border-blue-300"
          >
            {item.name}
          </button>
        ))}
      </div>
      {showOther && (
        <form
          className="mt-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (otherName.trim()) continueWith(otherName.trim());
          }}
        >
          <label htmlFor="other-appliance" className="block text-sm font-medium text-slate-700">Appliance name</label>
          <input
            id="other-appliance"
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Dishwasher"
          />
          <button type="submit" className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700">
            Continue
          </button>
        </form>
      )}
    </CustomerLayout>
  );
}
