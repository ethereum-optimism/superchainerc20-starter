// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {L2NativeSuperchainERC20} from "../src/L2NativeSuperchainERC20.sol";

contract SuperchainERC20Deployer is Script {
    string deployConfig;

    constructor() {
        string memory deployConfigPath = vm.envOr("DEPLOY_CONFIG_PATH", string("/configs/deploy-config.toml"));
        string memory filePath = string.concat(vm.projectRoot(), deployConfigPath);
        deployConfig = vm.readFile(filePath);
    }

    /// @notice Modifier that wraps a function in broadcasting.
    modifier broadcast() {
        vm.startBroadcast(msg.sender);
        _;
        vm.stopBroadcast();
    }

    function setUp() public {}

    function run() public {
        string[] memory chainsToDeployTo = vm.parseTomlStringArray(deployConfig, ".deploy_config.chains");

        address deployedAddress;
        address ownerAddr;

        for (uint256 i = 0; i < chainsToDeployTo.length; i++) {
            string memory chainToDeployTo = chainsToDeployTo[i];

            console.log("Deploying to chain: ", chainToDeployTo);

            vm.createSelectFork(chainToDeployTo);
            (address _deployedAddress, address _ownerAddr) = deployL2NativeSuperchainERC20();
            deployedAddress = _deployedAddress;
            ownerAddr = _ownerAddr;
        }

        outputDeploymentResult(deployedAddress, ownerAddr);
    }

    function deployL2NativeSuperchainERC20() public broadcast returns (address addr_, address ownerAddr_) {
        ownerAddr_ = vm.parseTomlAddress(deployConfig, ".token.owner_address");
        string memory name = vm.parseTomlString(deployConfig, ".token.name");
        string memory symbol = vm.parseTomlString(deployConfig, ".token.symbol");
        uint256 decimals = vm.parseTomlUint(deployConfig, ".token.decimals");
        require(decimals <= type(uint8).max, "decimals exceeds uint8 range");
        bytes memory initCode = abi.encodePacked(
            type(L2NativeSuperchainERC20).creationCode, abi.encode(ownerAddr_, name, symbol, uint8(decimals))
        );
        address preComputedAddress = vm.computeCreate2Address(_implSalt(), keccak256(initCode));
        if (preComputedAddress.code.length > 0) {
            console.log(
                "L2NativeSuperchainERC20 already deployed at %s", preComputedAddress, "on chain id: ", block.chainid
            );
            addr_ = preComputedAddress;
        } else {
            addr_ = address(new L2NativeSuperchainERC20{salt: _implSalt()}(ownerAddr_, name, symbol, uint8(decimals)));
            console.log("Deployed L2NativeSuperchainERC20 at address: ", addr_, "on chain id: ", block.chainid);
        }
    }

    function outputDeploymentResult(address deployedAddress, address ownerAddr) public {
        console.log("Outputting deployment result");

        string memory obj = "result";
        vm.serializeAddress(obj, "deployedAddress", deployedAddress);
        string memory jsonOutput = vm.serializeAddress(obj, "ownerAddress", ownerAddr);

        vm.writeJson(jsonOutput, "deployment.json");
    }

    /// @notice The CREATE2 salt to be used when deploying the token.
    function _implSalt() internal view returns (bytes32) {
        string memory salt = vm.parseTomlString(deployConfig, ".deploy_config.salt");
        return keccak256(abi.encodePacked(salt));
    }
}
