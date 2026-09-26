import {
  Sparkles,
  Wrench,
  Zap,
  Hammer,
  Tv,
  Paintbrush,
  PaintRoller,
  Truck,
  ShieldCheck,
  Trees,
  AlertTriangle,
} from 'lucide-react';

const ICONS = {
  Sparkles,
  Wrench,
  Zap,
  Hammer,
  Tv,
  Paintbrush,
  PaintRoller,
  Truck,
  ShieldCheck,
  Trees,
  AlertTriangle,
};


export function ServiceIcon({ name, className = 'w-5 h-5' }) {
  const Icon = ICONS[name] || Sparkles;
  return <Icon className={className} />;
}

export function GetServiceIcon({ name, className = 'w-5 h-5' }) {
  return <ServiceIcon name={name} className={className} />;
}

export default ServiceIcon;


