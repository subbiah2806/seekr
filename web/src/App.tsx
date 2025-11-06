import { InitializeReusableChunks } from '@subbiah/reusable/initializeReusableChunks';

function App() {
  return (
    <InitializeReusableChunks>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">Hello World</h1>
          <p className="text-xl text-muted-foreground">Seekr Web Application</p>
        </div>
      </div>
    </InitializeReusableChunks>
  );
}

export default App;
