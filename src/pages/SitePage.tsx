import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Data } from '@measured/puck';
import { Render } from '@measured/puck';
import { getPageFromContract } from '../lib/get-page';
import config from '../puck.config';

export default function SitePage() {
  const { address, identifier } = useParams<{ address: string; identifier: string }>();
  const { address: userAddress } = useAccount();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!address || !identifier) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const pageData = await getPageFromContract(address, identifier);
        setData(pageData);
      } catch (err) {
        setError('Failed to load page data');
        console.error('Error loading page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, identifier]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!data) {
    return (
      <div className="not-found">
        <h1>Page Not Found</h1>
        <p>No data found for {address}/{identifier}</p>
        {userAddress?.toLowerCase() === address?.toLowerCase() && (
          <p>
            <a href={`/puck/${address}/${identifier}`}>Create this page</a>
          </p>
        )}
      </div>
    );
  }

  const isOwner = userAddress?.toLowerCase() === address?.toLowerCase();

  return (
    <div>
      {isOwner && (
        <div className="edit-bar">
          <a href={`/puck/${address}/${identifier}`} className="edit-button">
            Edit Page
          </a>
        </div>
      )}
      <Render config={config} data={data} />
    </div>
  );
}