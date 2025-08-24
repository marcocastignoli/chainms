import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { config } from './lib/wagmi-config';
import Homepage from './pages/Homepage';
import SitePage from './pages/SitePage';
import PuckEditor from './pages/PuckEditor';
import './styles.css';
import "@measured/puck/puck.css";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/puck/:address/:identifier" element={<PuckEditor />} />
            <Route path="/:address/:identifier" element={<SitePage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
