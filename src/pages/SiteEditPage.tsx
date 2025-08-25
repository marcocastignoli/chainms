import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import { useAccount, useEnsAddress, useWalletClient, useWriteContract } from "wagmi";
import { isAddress, getAddress } from "viem";
import config from "../puck.config";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/contract";
import { optimism } from "wagmi/chains";
import { getPageFromContract } from "../lib/get-page";

export function SiteEditPage() {
  const { address, identifier } = useParams<{ address: string; identifier: string }>();
  const navigate = useNavigate();
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const [data, setData] = useState<Partial<Data> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishStatus, setPublishStatus] = useState<{
    type: 'idle' | 'publishing' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  
  // Handle ENS resolution
  const { data: resolvedAddress } = useEnsAddress({
    name: isAddress(address || '') ? undefined : address,
  });
  
  const actualAddress = isAddress(address || '') ? address : resolvedAddress;
  
  const isOwner = connectedAddress && 
    actualAddress &&
    isAddress(actualAddress) && 
    isAddress(connectedAddress) && 
    getAddress(connectedAddress) === getAddress(actualAddress);

  useEffect(() => {
    async function fetchData() {
      if (!address || !identifier) {
        setIsLoading(false);
        return;
      }

      try {
        const pageData = await getPageFromContract(address, identifier);
        setData(pageData);
      } catch (err) {
        console.error('Failed to load page data:', err);
        setData({ content: [], root: { props: {} } });
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchData();
    }, 1000); // Reduced timeout

    return () => clearTimeout(timer);
  }, [address, identifier]);

  // Always show something first, regardless of loading state
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>⏳ Loading Edit Page...</h2>
        <p>Checking wallet connection and permissions...</p>
        <p><strong>Debug:</strong> Loading edit page for {address}/{identifier}</p>
      </div>
    );
  }

  if (!isLoading && !isConnected) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>🔗 Wallet Connection Required</h2>
        <p>Please connect your wallet to edit this page.</p>
        <p><strong>Debug:</strong> isConnected = {isConnected ? 'true' : 'false'}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Homepage to Connect
        </button>
      </div>
    );
  }

  if (!isLoading && isConnected && !isOwner) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>🚫 Access Denied</h2>
        <p>You can only edit pages owned by your connected wallet address.</p>
        <p><strong>Page Owner:</strong> {address}</p>
        <p><strong>Your Address:</strong> {connectedAddress}</p>
        <p><strong>Debug:</strong> isConnected = {isConnected ? 'true' : 'false'}, isOwner = {isOwner ? 'true' : 'false'}</p>
        <button 
          onClick={() => navigate(`/${address}/${identifier}`)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          View Page (Read-only)
        </button>
      </div>
    );
  }

  
  return (
    <div>
      {/* Editor banner at bottom */}
      <div className="status-banner owner">
        <p>🎨 <strong>Editing {identifier}</strong> as {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}</p>
      </div>
      
      {/* Publish status banner - shows above editor banner when active */}
      {publishStatus.type !== 'idle' && (
        <div className="status-banner" style={{
          bottom: '6rem', // Position above the editor banner
          background: 
            publishStatus.type === 'publishing' ? 'rgba(255, 193, 7, 0.05)' :
            publishStatus.type === 'success' ? 'rgba(40, 167, 69, 0.05)' :
            publishStatus.type === 'error' ? 'rgba(220, 53, 69, 0.05)' : 'rgba(108, 117, 125, 0.05)',
          color:
            publishStatus.type === 'publishing' ? '#856404' :
            publishStatus.type === 'success' ? '#155724' :
            publishStatus.type === 'error' ? '#721c24' : '#6c757d',
          borderColor:
            publishStatus.type === 'publishing' ? 'rgba(255, 193, 7, 0.2)' :
            publishStatus.type === 'success' ? 'rgba(40, 167, 69, 0.2)' :
            publishStatus.type === 'error' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(108, 117, 125, 0.1)'
        }}>
          <p>
            {publishStatus.type === 'publishing' && '⏳ '}
            {publishStatus.type === 'success' && '✅ '}
            {publishStatus.type === 'error' && '❌ '}
            {publishStatus.message}
          </p>
        </div>
      )}
      
      <Puck
        config={config}
        data={data || { content: [], root: { props: {} } }}
        viewports={[
          {
            width: 414,
            label: "Mobile"
          }
        ]}
        onPublish={async (data) => {
          try {
            if (!walletClient) {
              setPublishStatus({ type: 'error', message: 'Wallet not connected properly. Please reconnect your wallet.' });
              return;
            }

            
            // Show loading state
            setPublishStatus({ type: 'publishing', message: 'Sending transaction to Optimism blockchain...' });
            
            // Force the transaction to use Optimism chain
            await writeContractAsync({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'store',
              args: [identifier!, JSON.stringify(data)],
              chain: optimism,
              account: connectedAddress
            });
            
            setPublishStatus({ type: 'success', message: 'Data stored successfully on Optimism blockchain!' });
            
            // Redirect after a short delay so user can see success message
            setTimeout(() => {
              navigate(`/${address}/${identifier}`);
            }, 2000);
            
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            
            if (error.message?.includes('User rejected')) {
              setPublishStatus({ type: 'error', message: 'Transaction cancelled by user.' });
            } else if (error.message?.includes('network') || error.message?.includes('chain')) {
              setPublishStatus({ type: 'error', message: 'Network error. Please make sure your wallet is connected to Optimism network.' });
            } else {
              setPublishStatus({ type: 'error', message: `Failed to store data: ${error.message || 'Unknown error'}` });
            }
          }
        }}
      />
    </div>
  );
}