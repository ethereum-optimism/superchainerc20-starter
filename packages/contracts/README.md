# Contracts

## Overview

This repository contains contracts and tooling for deploying and managing SuperchainERC20 tokens.

## Contracts

### src/

- `L2NativeSuperchainERC20.sol` - A simple SuperchainERC20 implementation that allows the owner to mint new tokens.

## Tests

### test/

- `L2NativeSuperchainERC20.t.sol` - Tests for the L2NativeSuperchainERC20 contract, covering basic ERC20 functionality, minting, ownership, and transfers.

- `SuperchainERC20.t.sol` - Tests for cross-chain functionality including cross-chain minting and burning operations.

  - If you implement your own custom SuperchainERC20 token, make sure to run these unit tests against it to confirm that it works correctly with the [SuperchainERC20Bridge](https://specs.optimism.io/interop/predeploys.html#superchainerc20bridge)

  ```diff
  // Example of updating SuperchainERC20Test to use your custom token implementation:
  contract SuperchainERC20Test is Test {
      address internal constant ZERO_ADDRESS = address(0);
      address internal constant SUPERCHAIN_TOKEN_BRIDGE = Predeploys.SUPERCHAIN_TOKEN_BRIDGE;
      address internal constant MESSENGER = Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER;

  -   SuperchainERC20 public superchainERC20;
  +   MyCustomSuperchainERC20 public superchainERC20;

      /// @notice Sets up the test suite.
      function setUp() public {
  -       superchainERC20 = new L2NativeSuperchainERC20(address(this), "Test", "TEST", 18);
  +       superchainERC20 = new MyCustomSuperchainERC20();
      }
  ...
  ```

## Scripts

### scripts/

- `SuperchainERC20Deployer.s.sol` - Script for deploying the L2NativeSuperchainERC20 token to the configured chains in sequence, reading chain configuration from TOML.

## Deploying

For more information on how to deploy the token, check out [the deployment guide](../../README.md#-deploying-superchainerc20s).

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```
