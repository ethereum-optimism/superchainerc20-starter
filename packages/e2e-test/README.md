# E2E Tests

This package contains end-to-end tests for cross-chain functionality, particularly focusing on token bridging between L2 chains.

## Overview

These tests require a live `supersim` instance to be running. Easiest way to run it is to run `pnpm e2e-test` from the base of the repository.

## Tests

### Bridge Tests (`bridge.spec.ts`)

- Token bridging between L2 chains
  - Successful token transfers between L2A and L2B
  - Validation of insufficient balance scenarios
  - Message passing and relay verification

## Running Tests

Note: Tests require a running `supersim` instance & the contracts to be already deployed. Run `pnpm e2e-test` from the root of the repository to start the test environment & running tests.

This will

- start `supersim`
- deploy contracts
- run e2e tests

## Built with

- [vite](https://vitejs.dev/)
- [vitest](https://vitest.dev/)
- [viem](https://viem.sh/)
- [@eth-optimism/viem](https://github.com/ethereum-optimism/op-viem) - Viem extensions for OP Stack interop
