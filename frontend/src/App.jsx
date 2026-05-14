import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FindingDetail from './pages/FindingDetail';
import ApprovalQueue from './pages/ApprovalQueue';
import Drugs from './pages/Drugs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/findings"    element={<ApprovalQueue />} />
        <Route path="/findings/:id" element={<FindingDetail />} />
        <Route path="/approval"    element={<ApprovalQueue />} />
        <Route path="/drugs"       element={<Drugs />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
