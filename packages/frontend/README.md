# SuperchainERC20 Dev Tools

This frontend is a small tool to test SuperchainERC20 tokens locally.

![frontend-gif](https://github.com/user-attachments/assets/f7aef910-c9ef-4a9e-b94b-8626d8dea02b)

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

- [vite](https://vitejs.dev/)
- [wagmi](https://wagmi.sh/)
- [viem](https://viem.sh/)
- [@eth-optimism/viem](https://github.com/ethereum-optimism/op-viem) - Viem extensions for OP Stack interop
