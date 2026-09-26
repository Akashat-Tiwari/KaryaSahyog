import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const fade = setTimeout(() => setVisible(false), 1600);
    const go = setTimeout(() => navigate('/role-selection'), 2000);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(fade);
      clearTimeout(go);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div
        className={`text-center transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-5">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Karya Sahyog</h1>
        <p className="text-sm text-slate-400 mt-2">Trusted home services, nearby</p>
      </div>
    </div>
  );
}
