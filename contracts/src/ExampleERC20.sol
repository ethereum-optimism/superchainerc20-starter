// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// TODO (https://github.com/ethereum-optimism/superchainerc20-starter/issues/3): delete this contract after template contract is merged.
contract ExampleERC20 {
    string public name;

    string public symbol;

    uint256 public immutable decimals;

    address public owner;


    constructor(
        address _owner,
        string memory _name,
        string memory _symbol,
        uint256 _decimals
    ) {
        owner = _owner;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
}
