// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

// Contracts
import {ERC20} from "@solady/tokens/ERC20.sol";

// Libraries
import {PredeployAddresses} from "@interop-lib/libraries/PredeployAddresses.sol";

// Interfaces
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC7802, IERC165} from "@interop-lib/interfaces/IERC7802.sol";

/// @title SuperchainERC20
/// @notice A standard ERC20 extension implementing IERC7802 for unified cross-chain fungibility across
///         the Superchain. Allows the SuperchainTokenBridge to mint and burn tokens as needed.
abstract contract SuperchainERC20 is ERC20, IERC7802 {
    /// @notice Allows the SuperchainTokenBridge to mint tokens.
    /// @param _to     Address to mint tokens to.
    /// @param _amount Amount of tokens to mint.
    function crosschainMint(address _to, uint256 _amount) external {
        require(msg.sender == PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE, "Unauthorized");

        _mint(_to, _amount);

        emit CrosschainMint(_to, _amount, msg.sender);
    }

    /// @notice Allows the SuperchainTokenBridge to burn tokens.
    /// @param _from   Address to burn tokens from.
    /// @param _amount Amount of tokens to burn.
    function crosschainBurn(address _from, uint256 _amount) external {
        require(msg.sender == PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE, "Unauthorized");

        _burn(_from, _amount);

        emit CrosschainBurn(_from, _amount, msg.sender);
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 _interfaceId) public view virtual returns (bool) {
        return _interfaceId == type(IERC7802).interfaceId || _interfaceId == type(IERC20).interfaceId
            || _interfaceId == type(IERC165).interfaceId;
    }
}
