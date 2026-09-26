import { updateBookingContext } from '../api/customerService';

export function startServiceFlow(navigate, { service, serviceType, appliance, goToAppliance } = {}) {
  const nextAppliance =
    appliance ??
    service?.appliance ??
    null;

  updateBookingContext({
    service: service?.name || '',
    serviceId: service?.id || '',
    serviceCategory: service?.category || '',
    serviceType: serviceType || null,
    appliance: nextAppliance,
    worker: null,
    price: service?.startingPrice || 0,
    emergencySupported: true,
  });

  if (goToAppliance) {
    navigate('/customer/appliance');
    return;
  }

  if (!serviceType) {
    navigate('/customer/service-type');
    return;
  }

  navigate('/customer/location');
}

export function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(name) {
  if (!name) return '';
  return String(name).trim().split(' ')[0];
}
