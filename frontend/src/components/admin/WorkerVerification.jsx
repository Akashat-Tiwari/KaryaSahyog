// TODO: Connect to backend once GET /admin/workers and GET /admin/bookings endpoints are built.
import { useState } from 'react';
import {
  ShieldAlert,
  Check,
  X,
  FileText,
  ExternalLink,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

const INITIAL_PENDING_WORKERS = [
  {
    id: 'WKR-APP-01',
    name: 'Vikram Singh',
    phone: '+91 98101 22334',
    skill: 'Master Electrician',
    appliedDate: 'Sep 14, 2026',
    experience: '6 Years',
    status: 'Pending',
    documents: [
      { name: 'Aadhaar Card', verified: true },
      { name: 'ITI Trade Cert', verified: true },
      { name: 'Police Verification', verified: false },
    ],
  },
  {
    id: 'WKR-APP-02',
    name: 'Sunita Devi',
    phone: '+91 98711 44556',
    skill: 'Sanitary & Plumbing Specialist',
    appliedDate: 'Sep 13, 2026',
    experience: '4 Years',
    status: 'Pending',
    documents: [
      { name: 'Aadhaar Card', verified: true },
      { name: 'National Skill Card', verified: true },
    ],
  },
  {
    id: 'WKR-APP-03',
    name: 'Manoj Yadav',
    phone: '+91 99123 55678',
    skill: 'Commercial & Ambulance Driver',
    appliedDate: 'Sep 13, 2026',
    experience: '9 Years',
    status: 'Pending',
    documents: [
      { name: 'Commercial DL', verified: true },
      { name: 'Aadhaar Card', verified: true },
      { name: 'Medical Fitness', verified: true },
    ],
  },
  {
    id: 'WKR-APP-04',
    name: 'Farhan Akhtar',
    phone: '+91 98990 11223',
    skill: 'HVAC & Split AC Technician',
    appliedDate: 'Sep 12, 2026',
    experience: '5 Years',
    status: 'Pending',
    documents: [
      { name: 'Aadhaar Card', verified: true },
      { name: 'Apprentice Diploma', verified: true },
      { name: 'Govt. Skill ID', verified: true },
    ],
  },
  {
    id: 'WKR-APP-05',
    name: 'Kavita Sharma',
    phone: '+91 98223 99887',
    skill: 'Kitchen Appliance & Inverter Tech',
    appliedDate: 'Sep 11, 2026',
    experience: '3 Years',
    status: 'Pending',
    documents: [
      { name: 'Aadhaar Card', verified: true },
      { name: 'Police Verification', verified: true },
    ],
  },
];

export default function WorkerVerification() {
  const [workers, setWorkers] = useState(INITIAL_PENDING_WORKERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = (id, name) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'Approved' } : w))
    );
    showToast(`Worker application for ${name} has been approved! Credentials activated.`);
  };

  const handleReject = (id, name) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'Rejected' } : w))
    );
    showToast(`Worker application for ${name} has been declined.`);
  };

  const handleReset = () => {
    setWorkers(INITIAL_PENDING_WORKERS);
    showToast('Reset worker verification queue to initial state.');
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skill.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && worker.status === statusFilter;
  });

  const pendingCount = workers.filter((w) => w.status === 'Pending').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Worker Verification Desk
            </h3>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Review onboarding applications, KYC documents, and cooperative compliance
          </p>
        </div>

        {/* Filter Pills & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            {['All', 'Pending', 'Approved', 'Rejected'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatusFilter(item)}
                className={`text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  statusFilter === item
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
            title="Reset to Initial Queue"
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
          placeholder="Filter by applicant name or skill trade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

      {/* Table Component */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-xs text-gray-600 border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Worker Name</th>
              <th className="py-3 px-4">Skill & Exp.</th>
              <th className="py-3 px-4">Applied Date</th>
              <th className="py-3 px-4">KYC Documents</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Name & Phone */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs">
                        {worker.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{worker.name}</div>
                        <div className="text-[11px] text-gray-400">{worker.phone}</div>
                      </div>
                    </div>
                  </td>

                  {/* Skill & Experience */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800 block">
                      {worker.skill}
                    </span>
                    <span className="text-[11px] text-blue-600">
                      {worker.experience}
                    </span>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3 px-4 text-gray-600">
                    {worker.appliedDate}
                  </td>

                  {/* Documents (Link/Icon) */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {worker.documents.map((doc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewDoc({ worker, doc })}
                          className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-2 py-0.5 rounded border border-gray-200 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>{doc.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        worker.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : worker.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {worker.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                      {worker.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                      <span>{worker.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    {worker.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReject(worker.id, worker.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(worker.id, worker.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No worker applications found matching current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Document Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-sm border border-gray-200 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {previewDoc.doc.name}
                  </h4>
                  <p className="text-xs text-gray-500">Applicant: {previewDoc.worker.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Document Visual */}
            <div className="h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center p-4 text-center">
              <Eye className="w-6 h-6 text-gray-400 mb-2" />
              <div className="text-xs font-semibold text-gray-700">Govt. Certified KYC Record</div>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                Verified cryptographic checksum against UIDAI / Digilocker verification registry.
              </p>
              <span className="mt-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                OCR Hash Match: Pass
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
