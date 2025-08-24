import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { config } from './lib/wagmi-config';
import Homepage from './pages/Homepage';
import { SiteViewPage } from './pages/SiteViewPage';
import { SiteEditPage } from './pages/SiteEditPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';
import "@measured/puck/puck.css";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/puck/:address/:identifier" element={<SiteEditPage />} />
              <Route path="/:address/:identifier" element={<SiteViewPage />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;
