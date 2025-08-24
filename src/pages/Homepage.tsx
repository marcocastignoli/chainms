import { Wallet } from "../components/Wallet";

export default function Homepage() {
  return (
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
      
      <div className="main-content">
        <Wallet />
        
        <div className="section">
          <h2>How to use:</h2>
        <ol>
          <li>Connect your wallet using any supported provider</li>
          <li>Select your preferred blockchain network</li>
          <li>Visit <code>/{'{address|ens_name}'}/{'{identifier}'}</code> to view a website</li>
          <li>If you're the owner, you'll see an edit button to modify the site</li>
          <li>Use the Puck editor to create and modify your websites</li>
          <li>Your changes are stored on-chain</li>
        </ol>
        </div>
        
        <div className="section">
          <h3>Examples:</h3>
        <ul>
          <li><code>/0x1234.../my-site</code> - Access by Ethereum address</li>
          <li><code>/vitalik.eth/homepage</code> - Access by ENS name</li>
        </ul>
        </div>
      </div>
    </div>
  );
}