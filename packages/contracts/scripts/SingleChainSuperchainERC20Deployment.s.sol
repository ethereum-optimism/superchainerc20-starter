// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "forge-std/Script.sol";
import {Script} from "forge-std/Script.sol";
import {SuperchainERC20Deployer} from "./SuperchainERC20Deployer.sol";

contract SingleChainSuperchainERC20Deployment is Script, SuperchainERC20Deployer {
    function setUp() public {}

    function run() public {
        string memory chainToDeployTo = vm.parseTomlString(deployConfig, ".single_chain_deploy_config.chain");
        console.log("Deploying to chain: ", chainToDeployTo);
        vm.createSelectFork(chainToDeployTo);
        deployL2NativeSuperchainERC20();
    }
}
