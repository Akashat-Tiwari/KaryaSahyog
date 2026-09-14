// TODO: Connect to backend once GET /admin/workers and GET /admin/bookings endpoints are built.
import { useState } from 'react';
import {
  Calendar,
  X,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  User,
  MapPin,
  Phone,
  Eye,
} from 'lucide-react';

const INITIAL_BOOKINGS = [
  {
    id: 'BK-8901',
    customer: 'Pooja Sharma',
    customerPhone: '+91 98112 34567',
    workerAssigned: 'Rajesh Kumar',
    workerPhone: '+91 98765 43210',
    service: 'MCB Trip & Main Electrical Panel Repair',
    category: 'Electrical',
    status: 'Active',
    amount: 450,
    time: 'Today, 2:15 PM',
    address: 'House #42, Sector 56, Huda Colony, Gurugram',
    paymentMethod: 'UPI / Escrow Held',
  },
  {
    id: 'BK-8902',
    customer: 'Amitabh Verma',
    customerPhone: '+91 98711 88990',
    workerAssigned: 'Unassigned',
    workerPhone: '-',
    service: 'Ceiling Fan & 3 Switchboards Installation',
    category: 'Fixtures',
    status: 'Pending',
    amount: 850,
    time: 'Today, 3:00 PM',
    address: 'Flat 302, DLF Phase 4, Block B, Gurugram',
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'BK-8903',
    customer: 'Sneha Roy',
    customerPhone: '+91 99100 22334',
    workerAssigned: 'Abdul Hassan',
    workerPhone: '+91 99880 12345',
    service: 'Kitchen Basin Pipe & Pressure Leak',
    category: 'Plumbing',
    status: 'Completed',
    amount: 650,
    time: 'Today, 11:30 AM',
    address: 'Villa 18, Sushant Lok 1, C-Block, Gurugram',
    paymentMethod: 'Online / Cooperative Settled',
  },
  {
    id: 'BK-8904',
    customer: 'Rohan Malhotra',
    customerPhone: '+91 98990 77112',
    workerAssigned: 'Manoj Yadav',
    workerPhone: '+91 99123 55678',
    service: 'Emergency Patient Hospital Transport',
    category: 'Driver',
    status: 'Active',
    amount: 800,
    time: 'Today, 1:45 PM',
    address: 'Apt 12B, Golf Course Road, Tower 6, Gurugram',
    paymentMethod: 'UPI Direct',
  },
  {
    id: 'BK-8905',
    customer: 'Kavita Patel',
    customerPhone: '+91 98221 44332',
    workerAssigned: 'Farhan Akhtar',
    workerPhone: '+91 98990 11223',
    service: 'Split AC Power Socket Replacement',
    category: 'HVAC',
    status: 'Completed',
    amount: 600,
    time: 'Yesterday, 4:20 PM',
    address: 'Tower A, Nirvana Country, Sector 50, Gurugram',
    paymentMethod: 'Online Transfer',
  },
  {
    id: 'BK-8906',
    customer: 'Vikram Joshi',
    customerPhone: '+91 98450 11992',
    workerAssigned: 'Sunil Aggarwal',
    workerPhone: '+91 98111 66554',
    service: 'Commercial 3-Phase Wiring Diagnostic',
    category: 'Electrical',
    status: 'Pending',
    amount: 1200,
    time: 'Today, 4:00 PM',
    address: 'SCO 24, Sector 29 Commercial Plaza, Gurugram',
    paymentMethod: 'Corporate Invoice',
  },
];

export default function BookingManagement() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCancelBooking = (id) => {
    if (window.confirm(`Are you sure you want to cancel booking ${id}?`)) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
      );
      showToast(`Booking ${id} has been cancelled.`);
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => ({ ...prev, status: 'Cancelled' }));
      }
    }
  };

  const handleReset = () => {
    setBookings(INITIAL_BOOKINGS);
    showToast('Reset booking records to default state.');
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.workerAssigned.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'All') return matchesSearch;
    return matchesSearch && booking.status === filter;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Booking Dispatch Management
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {bookings.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track active customer requests, dispatched workers, and settlement status
          </p>
        </div>

        {/* Filter Pills & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filter === item
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="Reset to Initial Bookings"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by Booking ID, Customer, Worker, or Service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="bg-gray-900 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-2 text-sm cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-xs text-gray-600 border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Booking ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Worker Assigned</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Booking ID */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                    {b.id}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-800">{b.customer}</div>
                    <div className="text-[11px] text-gray-400">{b.time}</div>
                  </td>

                  {/* Worker Assigned */}
                  <td className="py-3.5 px-4">
                    {b.workerAssigned !== 'Unassigned' ? (
                      <div className="flex items-center gap-1.5 font-medium text-gray-800">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>{b.workerAssigned}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        Awaiting Dispatch
                      </span>
                    )}
                  </td>

                  {/* Service */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-800 max-w-[200px] truncate" title={b.service}>
                      {b.service}
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400">
                      {b.category}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        b.status === 'Active'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : b.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                      {b.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                      {b.status === 'Cancelled' && <X className="w-3 h-3" />}
                      <span>{b.status}</span>
                    </span>
                  </td>

                  {/* Amount (in ₹) */}
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="View full booking details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          title="Cancel this booking"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No bookings found matching current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for View Details */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-sm border border-gray-200 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">
                    Booking #{selectedBooking.id}
                  </h4>
                  <p className="text-xs text-gray-500">Created: {selectedBooking.time}</p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedBooking.status === 'Active'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : selectedBooking.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedBooking.status === 'Cancelled'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {selectedBooking.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              {/* Service details */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Service Requested
                </span>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">
                  {selectedBooking.service}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{selectedBooking.address}</span>
                </div>
              </div>

              {/* Customer & Worker Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Customer
                  </span>
                  <div className="font-semibold text-gray-900 mt-1">{selectedBooking.customer}</div>
                  <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Assigned Worker
                  </span>
                  <div className="font-semibold text-gray-900 mt-1">
                    {selectedBooking.workerAssigned}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{selectedBooking.workerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Amount & Settlement */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">
                    Total Amount
                  </span>
                  <div className="text-base font-bold text-emerald-900">
                    ₹{selectedBooking.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">
                    Payment Gateway
                  </span>
                  <span className="font-medium text-xs text-emerald-800">
                    {selectedBooking.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' ? (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                >
                  Cancel Booking
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
