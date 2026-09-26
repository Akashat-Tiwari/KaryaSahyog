import { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { getCustomerNotifications, syncCustomerNotifications, markAllNotificationsRead, markNotificationRead } from '../../../api/customerService';

export default function Notifications() {
  const [items, setItems] = useState(() => getCustomerNotifications());

  useEffect(() => {
    syncCustomerNotifications().then(setItems).catch(() => {});
  }, []);

  return (
    <CustomerLayout title="Notifications" subtitle="Updates for your bookings, payments, and reviews.">
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setItems(markAllNotificationsRead())}
          className="text-sm font-semibold text-blue-700"
        >
          Mark all read
        </button>
      </div>
      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">You have no notifications.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setItems(markNotificationRead(item.id))}
              className={`w-full text-left bg-white border rounded-xl p-4 ${item.unread ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{item.time}</p>
                </div>
                {item.unread && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
