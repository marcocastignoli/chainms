# ChainMS - Blockchain Website Explorer

ChainMS is a decentralized content management system that allows users to create, store, and view websites directly on the blockchain. Built as a proof of concept, it demonstrates how web content can be permanently stored on-chain and accessed through a user-friendly interface.

## 🌟 What is ChainMS?

ChainMS enables users to:
- **Create websites** using a visual drag-and-drop editor powered by [Puck](https://puckeditor.com/)
- **Store content on-chain** - websites are permanently stored on the Optimism blockchain
- **Access sites** via wallet addresses or ENS names in the format `/{address|ens_name}/{identifier}`
- **Edit owned sites** - only the wallet owner can modify their content

## 🏗️ How It Works

1. **Connect your wallet** - Use MetaMask, Coinbase Wallet, or any EIP-6963 compatible wallet
2. **Select network** - Currently supports Optimism blockchain
3. **Create or view sites** - Access existing sites or create new ones if you own the address
4. **Visual editing** - Use the integrated Puck editor for drag-and-drop website building
5. **On-chain storage** - All changes are stored directly on the blockchain via smart contract

## 🔗 URL Structure

- **View a site**: `/{address}/{identifier}` - e.g., `/vitalik.eth/homepage`
- **Edit a site**: `/puck/{address}/{identifier}` (owner only)
- **Homepage**: `/` - Connect wallet and browse examples

## 🚀 Features

- **Wallet Integration**: Seamless connection with popular Web3 wallets
- **Visual Editor**: Drag-and-drop interface for creating rich content
- **Blockchain Storage**: Permanent, decentralized content storage on Optimism
- **ENS Support**: Access sites using human-readable ENS names
- **Responsive Design**: Works on desktop and mobile devices
- **Authentication**: Automatic owner detection and edit permissions

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Web3**: Wagmi + Viem for blockchain interactions
- **Editor**: Puck (React-based visual editor)
- **Blockchain**: Optimism network
- **Styling**: Custom CSS with modern glassmorphism design

## 🎯 Use Cases

- **Personal homepages** stored permanently on-chain
- **Decentralized portfolios** that can't be taken down
- **Community pages** owned by DAOs or organizations
- **Educational content** with permanent accessibility
- **Creative projects** that live forever on the blockchain

## 🔮 Vision

ChainMS demonstrates the potential for truly decentralized web content where:
- **No servers** - content lives on the blockchain
- **No censorship** - permanent and immutable storage
- **True ownership** - only you control your content
- **Global access** - available anywhere, anytime

---

*This is a proof of concept built to explore the possibilities of on-chain content management. All content is stored on the Optimism blockchain.*
