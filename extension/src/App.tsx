/**
 * Main App Component
 * Wraps the application with InitializeReusableChunks for proper library initialization
 */

import { InitializeReusableChunks } from '@subbiah/reusable/InitializeReusableChunks.tsx';
import { Popup } from './components/Popup';

function AppContent() {
  return (
    <div className="min-h-[700px] w-[600px] overflow-y-auto bg-background">
      <Popup />
    </div>
  );
}

export default function App() {
  return (
    <InitializeReusableChunks>
      <AppContent />
    </InitializeReusableChunks>
  );
}
