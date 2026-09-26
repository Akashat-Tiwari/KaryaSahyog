import { ServiceIcon } from '../../../utils/serviceIcons';

const CATEGORY_ICONS = {
  cleaning: 'Sparkles',
  plumbing: 'Wrench',
  electrical: 'Zap',
  carpentry: 'Hammer',
  appliance: 'Tv',
  painting: 'Paintbrush',
  moving: 'Truck',
};

export default function CategoryCard({ category, onSelect }) {
  if (!category) return null;

  const iconName = CATEGORY_ICONS[category.id] || 'Sparkles';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect && onSelect(category.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect && onSelect(category.id);
        }
      }}
      className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
        <ServiceIcon name={iconName} className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-slate-800 leading-tight">
        {category.name}
      </p>
    </div>
  );
}
