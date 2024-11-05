# SuperchainERC20 Dev Tools

This frontend is a small tool to test SuperchainERC20 tokens locally.

## Features

- 🪙 Faucet UI to drip tokens
- 🌉 Bridge UI to send tokens between chains
- 📊 See recent token mint/burn/transfer activity
- 💰 See total supply per chain
- ℹ️ See token info

## Getting Started

1. Set up environment variables:

```sh
pnpm init:env
```

2. Start the development server:

```sh
pnpm dev
```

Your app should now be running at http://localhost:5173

## Built with

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [viem](https://viem.sh/) - TypeScript Interface for Ethereum
- [@eth-optimism/viem](https://github.com/ethereum-optimism/op-viem) - Viem extensions for OP Stack interop
