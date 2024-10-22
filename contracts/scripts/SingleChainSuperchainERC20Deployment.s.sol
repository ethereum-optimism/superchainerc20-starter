// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {SuperchainERC20Deployer} from "./SuperchainERC20Deployer.sol";

contract SingleChainSuperchainERC20Deployment is Script, SuperchainERC20Deployer {
    function setUp() public {}

    function run() public {
        deployL2NativeSuperchainERC20();
    }
}
