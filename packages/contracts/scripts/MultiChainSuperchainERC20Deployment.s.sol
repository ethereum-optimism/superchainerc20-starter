// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {Script} from "forge-std/Script.sol";
import {ICreateX} from "createx/ICreateX.sol";
import {Preinstalls} from "@contracts-bedrock/libraries/Preinstalls.sol";
import {L2NativeSuperchainERC20} from "../src/L2NativeSuperchainERC20.sol";
import {SuperchainERC20Deployer} from "./SuperchainERC20Deployer.sol";

contract MultiChainSuperchainERC20Deployment is Script, SuperchainERC20Deployer {
    function setUp() public {}

    function run() public {
        string[] memory rpcUrls =
            (getFoundryConfigRpcUrls().length > 0) ? getFoundryConfigRpcUrls() : getSuperchainRpcUrls();
        for (uint256 i = 0; i < rpcUrls.length; i++) {
            console.log("Deploying to chain: ", rpcUrls[i]);

            vm.createSelectFork(rpcUrls[i]);
            deployL2NativeSuperchainERC20();
        }
    }

    function getFoundryConfigRpcUrls() internal view returns (string[] memory) {
        string[2][] memory rpcUrls = vm.rpcUrls();
        string[] memory extractedRpcAliases = new string[](rpcUrls.length);
        for (uint256 i = 0; i < rpcUrls.length; i++) {
            extractedRpcAliases[i] = rpcUrls[i][0];
        }
        return extractedRpcAliases;
    }

    function getSuperchainRpcUrls() internal view returns (string[] memory) {
        string memory filePath = string.concat(vm.projectRoot(), "/configs/chains.json");
        string memory json = vm.readFile(filePath);

        uint256 maxChains = 100; // You can adjust this based on your expected number of chains
        string[] memory rpcUrls = new string[](maxChains);
        uint256[] memory chainIDsToAdd = vm.envUint("CHAIN_IDS", ",");
        string memory network = vm.envOr("NETWORK", string("sepolia"));
        uint256 index = 0;

        for (uint256 i = 0; i < maxChains; i++) {
            string memory rpcUrlPath = string(abi.encodePacked(".", network, "[", vm.toString(i), "].rpcUrl"));
            string memory chainIdPath = string(abi.encodePacked(".", network, "[", vm.toString(i), "].chainId"));

            if (!stdJson.keyExists(json, rpcUrlPath) || !stdJson.keyExists(json, chainIdPath)) {
                break;
            }

            uint256 chainId = stdJson.readUint(json, chainIdPath);

            for (uint256 j = 0; j < chainIDsToAdd.length; j++) {
                if (chainId == chainIDsToAdd[j]) {
                    rpcUrls[index] = stdJson.readString(json, rpcUrlPath);
                    index++;
                    break;
                }
            }
        }

        // Resize the array to remove unused slots
        assembly {
            mstore(rpcUrls, index)
        }

        return rpcUrls;
    }
}
