import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Search, X } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import ServiceCard from '../components/ServiceCard';
import CategoryCard from '../components/CategoryCard';
import { getCurrentUser } from '../../../api/customerService';
import { SERVICE_CATEGORIES, SERVICES_CATALOG, POPULAR_SERVICE_IDS, searchServices, getServiceById } from '../../../data/servicesData';
import { firstName, greetingForNow, startServiceFlow } from '../../../utils/bookingFlow';
import { ServiceIcon } from '../../../utils/serviceIcons';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchServices(query).slice(0, 8), [query]);
  const popular = POPULAR_SERVICE_IDS.map(getServiceById).filter(Boolean);
  const name = firstName(user.name);
  const greeting = greetingForNow();

  const openService = (service) => startServiceFlow(navigate, { service });
  const openApplianceHub = () =>
    startServiceFlow(navigate, {
      service: { name: 'Appliance Repair', id: 'appliance', category: 'appliance', startingPrice: 349, emergencySupported: true },
      goToAppliance: true,
    });

  return (
    <CustomerLayout>
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {name ? `${greeting}, ${name}` : greeting}
        </h2>
        <p className="text-sm text-slate-500 mt-1">What service do you need today?</p>
      </section>

      <section className="mb-6">
        <label htmlFor="service-search" className="block text-sm font-semibold text-slate-800 mb-2">
          What service are you looking for?
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            id="service-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a service..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-3.5 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {query.trim() && (
          <div className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No services match “{query}”.</p>
            ) : (
              results.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => openService(service)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-500">{service.categoryName}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">{service.priceDisplay}</span>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate('/customer/emergency')}
        className="w-full mb-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 flex items-center gap-3 text-left hover:bg-rose-100/70 transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-rose-800">Emergency</h3>
          <p className="text-sm text-rose-700">Need help now? Choose a service and we will find nearby workers.</p>
        </div>
        <ArrowRight className="w-4 h-4 text-rose-500 shrink-0" />
      </button>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">Popular Services</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {popular.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => openService(service)}
              className="snap-start min-w-[220px] bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <ServiceIcon name={service.icon} />
              </div>
              <p className="font-semibold text-slate-900">{service.name}</p>
              <p className="text-xs text-slate-500 mt-1">{service.priceDisplay}</p>
            </button>
          ))}
          <button
            type="button"
            onClick={openApplianceHub}
            className="snap-start min-w-[220px] bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <ServiceIcon name="Tv" />
            </div>
            <p className="font-semibold text-slate-900">Appliance Repair</p>
            <p className="text-xs text-slate-500 mt-1">From ₹299</p>
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-3">Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {SERVICE_CATEGORIES.filter((c) => c.id !== 'all').map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={(id) => navigate(`/customer/services?category=${id}`)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">Book a service</h3>
          <button type="button" onClick={() => navigate('/customer/services')} className="text-sm font-semibold text-blue-700">
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES_CATALOG.filter((s) => s.popular).slice(0, 6).map((service) => (
            <ServiceCard key={service.id} service={service} onSelect={openService} />
          ))}
        </div>
      </section>
    </CustomerLayout>
  );
}
