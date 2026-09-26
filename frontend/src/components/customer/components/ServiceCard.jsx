import { ArrowRight, Clock } from 'lucide-react';
import { ServiceIcon } from '../../../utils/serviceIcons';

export default function ServiceCard({ service, onSelect }) {
  if (!service) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect && onSelect(service)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect && onSelect(service);
        }
      }}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ServiceIcon name={service.icon} />
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {service.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-sm font-extrabold text-blue-700">{service.priceDisplay}</span>
          {service.duration && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{service.duration}</span>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
