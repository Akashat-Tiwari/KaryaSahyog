import { Wrench } from 'lucide-react';

export default function AuthShell({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900 tracking-tight">KaryaSahyog</p>
              <p className="text-xs text-slate-500">Cooperative home services</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 text-center">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 text-center mt-2">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
