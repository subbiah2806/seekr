import { InitializeReusableChunks } from '@subbiah/reusable/initializeReusableChunks';

function App() {
  return (
    <InitializeReusableChunks>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="px-6 text-center">
          <h1 className="mb-4 text-5xl font-bold text-foreground">Hello World</h1>
          <p className="text-lg text-muted-foreground">Seekr Mobile Application</p>
          <p className="mt-2 text-sm text-muted-foreground">Powered by Capacitor</p>
        </div>
      </div>
    </InitializeReusableChunks>
  );
}

export default App;
