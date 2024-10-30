# SuperchainERC20 Starter Kit

## Getting Started

### 1. Install prerequisites: `foundry`

`supersim` requires `anvil` to be installed.

Follow [this guide](https://book.getfoundry.sh/getting-started/installation) to install Foundry.

### 2. Clone the repository:

```sh
git clone git@github.com:ethereum-optimism/superchainerc20-starter.git
```

### 3. Navigate to the project directory:

```sh
cd superchainerc20-starter
```

### 4. Install project dependencies using pnpm:

```sh
pnpm i
```

### 5. Install smart contracts dependencies:

```sh
pnpm install:contracts
```

### 6. Start the development environment:

This command will:

- Start the `supersim` local development environment
- Deploy the smart contracts to the test networks
- Launch the example frontend application

```sh
pnpm dev
```
