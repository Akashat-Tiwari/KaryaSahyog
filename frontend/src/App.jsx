import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkerDashboard from './components/worker/WorkerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            <div className="p-10 text-center">
              Login Page Placeholder (Teammate will build this)
            </div>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
