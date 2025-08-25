import { Wallet } from "../components/Wallet";
import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function Homepage() {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [pageName, setPageName] = useState("");

  const handleCreateWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageName.trim() && address) {
      navigate(`/puck/${address}/${pageName.trim()}`);
    }
  };

  return (
    <div className="mobile-container">
      <div className="homepage-container">
        <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">ChainMS</h1>
          <p className="hero-subtitle">Blockchain Website Explorer</p>
          <p className="hero-description">
            Create and explore websites stored on the blockchain.
            Connect your wallet to edit your sites or browse existing ones.
          </p>
        </div>
      </div>
      
      <div className="examples-section">
        <div className="examples-container">
          <h2 className="examples-title">Try These Examples</h2>
          <div className="examples-grid">
            <Link to="/0x7dBA08Bdc233B28e2c99723c402Fc8F4e35AB55B/test" className="example-card">
              <div className="example-address">0x7dBA08Bdc233B28e2c99723c402Fc8F4e35AB55B</div>
              <div className="example-id">test</div>
            </Link>
            <Link to="/0xC3F6e18b429b6BAf1bD31B1E504aee7827C7AAb5/prova" className="example-card">
              <div className="example-address">0xC3F6e18b429b6BAf1bD31B1E504aee7827C7AAb5</div>
              <div className="example-id">prova</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="create-section">
        <div className="create-container">
          <h2 className="create-title">Create Your Website</h2>
          {isConnected ? (
            <form onSubmit={handleCreateWebsite} className="create-form">
              <input
                type="text"
                placeholder="Page name"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="page-name-input"
                required
              />
              <button type="submit" className="create-button">
                Create Now
              </button>
            </form>
          ) : (
            <p className="sign-in-message">Please sign in to create your website</p>
          )}
        </div>
      </div>

      <div className="main-content">
        <Wallet />
        
        <div className="how-to-container">
          <h2>How to use ChainMS</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Connect Wallet</h3>
                <p>Use any supported wallet provider</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Select Network</h3>
                <p>Choose your preferred blockchain</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Visit Sites</h3>
                <p>Access via /{'{address}'}/{'{id}'}</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Edit & Create</h3>
                <p>Own the address? Use our editor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
