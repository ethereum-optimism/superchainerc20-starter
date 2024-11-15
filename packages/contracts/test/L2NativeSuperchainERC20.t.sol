// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

// Testing utilities
import {Test} from "forge-std/Test.sol";

// Libraries
import {Predeploys} from "@contracts-bedrock/libraries/Predeploys.sol";
import {IERC20} from "@openzeppelin/contracts-v5/token/ERC20/IERC20.sol";
import {Ownable} from "@solady/auth/Ownable.sol";
import {IOwnable} from "@contracts-bedrock/universal/interfaces/IOwnable.sol";
import {ERC20} from "@solady-v0.0.245/tokens/ERC20.sol";

// Target contract
import {L2NativeSuperchainERC20} from "src/L2NativeSuperchainERC20.sol";

/// @title L2NativeSuperchainERC20Test
/// @notice Contract for testing the L2NativeSuperchainERC20Test contract.
contract L2NativeSuperchainERC20Test is Test {
    address internal constant ZERO_ADDRESS = address(0);
    address internal constant SUPERCHAIN_TOKEN_BRIDGE = Predeploys.SUPERCHAIN_TOKEN_BRIDGE;
    address internal constant MESSENGER = Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER;
    address owner;
    address alice;
    address bob;

    L2NativeSuperchainERC20 public superchainERC20;

    /// @notice Sets up the test suite.
    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        superchainERC20 = new L2NativeSuperchainERC20(owner, "Test", "TEST", 18);
    }

    /// @notice Helper function to setup a mock and expect a call to it.
    function _mockAndExpect(address _receiver, bytes memory _calldata, bytes memory _returned) internal {
        vm.mockCall(_receiver, _calldata, _returned);
        vm.expectCall(_receiver, _calldata);
    }

    /// @notice Tests the metadata of the token is set correctly.
    function testMetadata() public view {
        assertEq(superchainERC20.name(), "Test");
        assertEq(superchainERC20.symbol(), "TEST");
        assertEq(superchainERC20.decimals(), 18);
    }

    /// @notice Tests that owner can mint tokens to an address.
    function testFuzz_mintTo_succeeds(address _to, uint256 _amount) public {
        vm.expectEmit(true, true, true, true);
        emit IERC20.Transfer(address(0), _to, _amount);

        vm.prank(owner);
        superchainERC20.mintTo(_to, _amount);

        assertEq(superchainERC20.totalSupply(), _amount);
        assertEq(superchainERC20.balanceOf(_to), _amount);
    }

    /// @notice Tests the mintTo function reverts when the caller is not the owner.
    function testFuzz_mintTo_succeeds(address _minter, address _to, uint256 _amount) public {
        vm.assume(_minter != owner);

        // Expect the revert with `Unauthorized` selector
        vm.expectRevert(Ownable.Unauthorized.selector);

        vm.prank(_minter);
        superchainERC20.mintTo(_to, _amount);
    }

    /// @notice Tests that ownership of the token can be renounced.
    function testRenounceOwnership() public {
        vm.expectEmit(true, true, true, true);
        emit IOwnable.OwnershipTransferred(owner, address(0));

        vm.prank(owner);
        superchainERC20.renounceOwnership();
        assertEq(superchainERC20.owner(), address(0));
    }

    /// @notice Tests that ownership of the token can be transferred.
    function testFuzz_testTransferOwnership(address _newOwner) public {
        vm.assume(_newOwner != owner);
        vm.assume(_newOwner != ZERO_ADDRESS);

        vm.expectEmit(true, true, true, true);
        emit IOwnable.OwnershipTransferred(owner, _newOwner);

        vm.prank(owner);
        superchainERC20.transferOwnership(_newOwner);

        assertEq(superchainERC20.owner(), _newOwner);
    }

    /// @notice Tests that tokens can be transferred using the transfer function.
    function testFuzz_transfer_succeeds(address _sender, uint256 _amount) public {
        vm.assume(_sender != ZERO_ADDRESS);
        vm.assume(_sender != bob);

        vm.prank(owner);
        superchainERC20.mintTo(_sender, _amount);

        vm.expectEmit(true, true, true, true);
        emit IERC20.Transfer(_sender, bob, _amount);

        vm.prank(_sender);
        assertTrue(superchainERC20.transfer(bob, _amount));
        assertEq(superchainERC20.totalSupply(), _amount);

        assertEq(superchainERC20.balanceOf(_sender), 0);
        assertEq(superchainERC20.balanceOf(bob), _amount);
    }

    /// @notice Tests that tokens can be transferred using the transferFrom function.
    function testFuzz_transferFrom_succeeds(address _spender, uint256 _amount) public {
        vm.assume(_spender != ZERO_ADDRESS);
        vm.assume(_spender != bob);
        vm.assume(_spender != alice);

        vm.prank(owner);
        superchainERC20.mintTo(bob, _amount);

        vm.prank(bob);
        superchainERC20.approve(_spender, _amount);

        vm.prank(_spender);
        vm.expectEmit(true, true, true, true);
        emit IERC20.Transfer(bob, alice, _amount);
        assertTrue(superchainERC20.transferFrom(bob, alice, _amount));

        assertEq(superchainERC20.balanceOf(bob), 0);
        assertEq(superchainERC20.balanceOf(alice), _amount);
    }

    /// @notice tests that an insufficient balance cannot be transferred.
    function testFuzz_transferInsufficientBalance_reverts(address _to, uint256 _mintAmount, uint256 _sendAmount)
        public
    {
        vm.assume(_mintAmount < type(uint256).max);
        _sendAmount = bound(_sendAmount, _mintAmount + 1, type(uint256).max);

        vm.prank(owner);
        superchainERC20.mintTo(address(this), _mintAmount);

        vm.expectRevert(ERC20.InsufficientBalance.selector);
        superchainERC20.transfer(_to, _sendAmount);
    }

    /// @notice tests that an insufficient allowance cannot be transferred.
    function testFuzz_transferFromInsufficientAllowance_reverts(
        address _to,
        address _from,
        uint256 _approval,
        uint256 _amount
    ) public {
        vm.assume(_from != ZERO_ADDRESS);
        vm.assume(_approval < type(uint256).max);
        _amount = _bound(_amount, _approval + 1, type(uint256).max);

        vm.prank(owner);
        superchainERC20.mintTo(_from, _amount);

        vm.prank(_from);
        superchainERC20.approve(address(this), _approval);

        vm.expectRevert(ERC20.InsufficientAllowance.selector);
        superchainERC20.transferFrom(_from, _to, _amount);
    }
}
