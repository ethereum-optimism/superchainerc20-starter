// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {L2NativeSuperchainERC20} from "../src/L2NativeSuperchainERC20.sol";

contract SuperchainERC20Deployer {
    string deployConfig;

    constructor() {
        string memory filePath = string.concat(vm.projectRoot(), "/configs/deploy-config.toml");
        deployConfig = vm.readFile(filePath);
    }

    /// @notice Modifier that wraps a function in broadcasting.
    modifier broadcast() {
        vm.startBroadcast(msg.sender);
        _;
        vm.stopBroadcast();
    }

    /// @notice Foundry cheatcode VM.
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function deployL2NativeSuperchainERC20() public broadcast returns (address addr_) {
        address owner = vm.parseTomlAddress(deployConfig, ".token.owner_address");
        string memory name = vm.parseTomlString(deployConfig, ".token.name");
        string memory symbol = vm.parseTomlString(deployConfig, ".token.symbol");
        uint256 decimals = vm.parseTomlUint(deployConfig, ".token.decimals");
        addr_ = _deployCreate2({
            _creationCode: type(L2NativeSuperchainERC20).creationCode,
            _constructorParams: abi.encode(owner, name, symbol, decimals)
        });
    }

    /// @notice The CREATE2 salt to be used when deploying the token.
    function _implSalt() internal view returns (bytes32) {
        string memory salt = vm.parseTomlString(deployConfig, ".deploy_config.salt");
        return keccak256(abi.encodePacked(salt));
    }

    /// @notice Deploys a contract using the CREATE2 opcode.
    /// @param _creationCode The contract creation code.
    /// @param _constructorParams The constructor parameters.
    function _deployCreate2(bytes memory _creationCode, bytes memory _constructorParams)
        internal
        returns (address addr_)
    {
        bytes32 salt = _implSalt();
        bytes memory initCode = abi.encodePacked(_creationCode, _constructorParams);
        address preComputedAddress = vm.computeCreate2Address(salt, keccak256(initCode));
        if (preComputedAddress.code.length > 0) {
            console.log(
                "L2NativeSuperchainERC20 already deployed at %s", preComputedAddress, "on chain id: ", block.chainid
            );
            addr_ = preComputedAddress;
        } else {
            assembly {
                addr_ := create2(0, add(initCode, 0x20), mload(initCode), salt)
            }
            require(addr_ != address(0), "L2NativeSuperchainERC20 deployment failed");
            console.log("Deployed L2NativeSuperchainERC20 at address: ", addr_, "on chain id: ", block.chainid);
        }
    }
}
