import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070B16] text-slate-100">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
