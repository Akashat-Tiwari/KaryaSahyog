import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVICE_CATEGORIES, SERVICES_CATALOG } from '../../../data/servicesData';
import ServiceCard from '../components/ServiceCard';
import CustomerLayout from '../components/CustomerLayout';
import { startServiceFlow } from '../../../utils/bookingFlow';

export default function Services() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get('category') || 'all';
  const [category, setCategory] = useState(initial);

  const chips = SERVICE_CATEGORIES.map((item) => ({
    ...item,
    label: item.name
      .replace('Painting & Improvement', 'Painting')
      .replace('Moving & Maintenance', 'Moving'),
  }));

  const list = SERVICES_CATALOG.filter(
    (service) => category === 'all' || service.category === category
  );

  return (
    <CustomerLayout title="Services" subtitle="Choose a service to book a nearby professional.">
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setCategory(chip.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${
              category === chip.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">No services in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((service) => (
            <ServiceCard key={service.id} service={service} onSelect={(item) => startServiceFlow(navigate, { service: item })} />
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
