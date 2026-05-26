import { Navigate, Route, Routes } from 'react-router-dom';
import BulkUpload from './pages/BulkUpload.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Operations from './pages/Operations.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Workflows from './pages/Workflows.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/bulk-upload" element={<BulkUpload />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/operations" element={<Operations />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/workflows" element={<Workflows />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
