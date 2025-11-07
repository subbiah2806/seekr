/**
 * Main App Component
 */

import { InitializeReusableChunks } from '@subbiah/reusable/InitializeReusableChunks.tsx';

function AppContent() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-8">
      <h1 className="text-4xl font-bold">Hello World</h1>
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
