import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Playground from './pages/Playground';
import { Header } from './components/Header';
import { BackendGate } from './components/BackendGate';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <BackendGate>
        {({ backendLive }) => (
          <Routes>
            <Route path="/" element={<Playground backendLive={backendLive} />} />
            <Route path="*" element={<Playground backendLive={backendLive} />} />
          </Routes>
        )}
      </BackendGate>
    </BrowserRouter>
  );
}
