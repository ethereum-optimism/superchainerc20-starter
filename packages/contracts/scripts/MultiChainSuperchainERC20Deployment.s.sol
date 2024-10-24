// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {Script} from "forge-std/Script.sol";
import {ICreateX} from "createx/ICreateX.sol";
import {Preinstalls} from "@contracts-bedrock/libraries/Preinstalls.sol";
import {L2NativeSuperchainERC20} from "../src/L2NativeSuperchainERC20.sol";
import {SuperchainERC20Deployer} from "./SuperchainERC20Deployer.sol";

contract MultiChainSuperchainERC20Deployment is Script, SuperchainERC20Deployer {
    function setUp() public {}

    function run() public {
        string[2][] memory rpcUrls = vm.rpcUrls();
        for (uint256 i = 0; i < rpcUrls.length; i++) {
            string memory rpcAlias = rpcUrls[i][0];

            console.log("Deploying to chain: ", rpcAlias);

            vm.createSelectFork(rpcAlias);
            deployL2NativeSuperchainERC20();
        }
    }
}
