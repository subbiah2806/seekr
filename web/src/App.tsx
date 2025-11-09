import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InitializeReusableChunks } from '@subbiah/reusable/InitializeReusableChunks';
import { ResumeBuilder } from './pages/ResumeBuilder';

function App() {
  return (
    <InitializeReusableChunks applyToBody>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/resume-builder" replace />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
        </Routes>
      </BrowserRouter>
    </InitializeReusableChunks>
  );
}

export default App;
