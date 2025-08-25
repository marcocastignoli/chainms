import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Render, type Data } from "@measured/puck";
import { useAccount } from "wagmi";
import { isAddress, getAddress } from "viem";
import config from "../puck.config";
import { getPageFromContract } from "../lib/get-page";

export function SiteViewPage() {
  const { address, identifier } = useParams<{ address: string; identifier: string }>();
  const navigate = useNavigate();
  const { address: connectedAddress, isConnected } = useAccount();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isOwner = connectedAddress && 
    address &&
    isAddress(address) && 
    isAddress(connectedAddress) && 
    getAddress(connectedAddress) === getAddress(address);

  useEffect(() => {
    async function fetchData() {
      if (!address || !identifier) {
        setError("Missing address or identifier");
        setLoading(false);
        return;
      }

      // Allow both addresses and ENS names
      if (!isAddress(address) && !address.endsWith('.eth')) {
        setError("Invalid address format");
        setLoading(false);
        return;
      }

      try {
        const pageData = await getPageFromContract(address, identifier);
        if (!pageData) {
          setError("Page not found");
        } else {
          setData(pageData);
        }
      } catch (err) {
        setError(`Failed to load page: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [address, identifier]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
        <p>Fetching page data from blockchain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Page Not Found</h2>
        <p>The page {address}/{identifier} does not exist.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!isConnected) {
    // Show site with wallet connection prompt
    return (
      <div className="mobile-container">
        <div className="site-view-container">
          <div className="status-banner connect">
            <p>💡 <strong>Are you the owner of this site?</strong> Connect your wallet to edit it!</p>
            <button onClick={() => navigate('/')}>
              Connect Wallet
            </button>
          </div>
          <div style={{ padding: '0 20px' }}>
            <Render config={config} data={data} />
          </div>
        </div>
      </div>
    );
  }

  if (isOwner) {
    // Show edit mode for owner
    return (
      <div className="mobile-container">
        <div className="site-view-container">
          <div className="status-banner owner">
            <p><strong>✅ You are the owner of this site!</strong></p>
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log("=== EDIT BUTTON CLICKED ===");
                console.log("Current URL:", window.location.href);
                console.log("Target URL:", `/puck/${address}/${identifier}`);
                console.log("Address:", address);
                console.log("Identifier:", identifier);
                console.log("Connected Address:", connectedAddress);
                console.log("Is Owner:", isOwner);
                console.log("========================");
                
                // Navigate to edit page
                navigate(`/puck/${address}/${identifier}`);
              }}
            >
              Edit this page
            </button>
          </div>
          <div style={{ padding: '0 20px' }}>
            <Render config={config} data={data} />
          </div>
        </div>
      </div>
    );
  }

  // Show read-only view for non-owners
  return (
    <div className="mobile-container">
      <div className="site-view-container">
        <div className="status-banner readonly">
          <p>🔒 This site is owned by another address. You can view it but cannot edit.</p>
        </div>
        <Render config={config} data={data} />
      </div>
    </div>
  );
}