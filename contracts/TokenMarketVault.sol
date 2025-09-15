// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title TokenMarket Rebalancing Vault
/// @notice ERC-4626 vault that automatically rebalances Smart Index portfolios
/// @dev Implements automated DeFi strategy execution with creator fee distribution
contract TokenMarketVault is ERC4626, AccessControl, ReentrancyGuard, Pausable {
    using Math for uint256;

    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    // Strategy execution parameters
    uint256 public constant MAX_BASIS_POINTS = 10000;
    uint256 public constant MIN_REBALANCE_AMOUNT = 100 * 10**18; // 100 tokens minimum

    // User strategies and positions
    struct Strategy {
        bool active;
        uint256 createdAt;
        uint256 lastRebalance;
        uint256 totalAssetsManaged;
        uint256 shareSupply;
        uint64 performanceFee; // Basis points (200 = 2%)
        uint64 rebalanceFrequency; // Hours between rebalances
        string name;
        string description;
    }

    struct AssetWeight {
        address asset;
        uint256 targetWeight; // Basis points
        uint256 currentWeight;
    }

    // Events
    event StrategyCreated(address indexed user, uint256 indexed strategyId, string name);
    event StrategyRebalanced(address indexed user, uint256 indexed strategyId, uint256 timestamp);
    event PerformanceFeeCollected(address indexed user, uint256 indexed strategyId, uint256 amount);
    event EmergencyAction(string action, address actor, uint256 timestamp);

    mapping(address => Strategy[]) public userStrategies;
    mapping(address => AssetWeight[]) public userAssetWeights;
    mapping(address => uint256) public userTotalFeesCollected;

    // Emergency controls
    uint256 public maxSlippageTolerance = 300; // 3%
    bool public whitelistOnly = false;
    mapping(address => bool) public whitelist;
    address public emergencyAdmin;

    modifier onlyWhitelisted() {
        if (whitelistOnly) {
            require(whitelist[msg.sender] || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not whitelisted");
        }
        _;
    }

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    )
        ERC4626(asset_)
        ERC20(name_, symbol_)
    {
        emergencyAdmin = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STRATEGIST_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }

    /// @notice Deposit assets and create a new strategy
    /// @param assets Amount of underlying assets to deposit
    /// @param receiver Address to receive PIT tokens
    /// @param strategyName Human-readable strategy name
    /// @param strategyDescription Strategy description
    /// @param performanceFee Performance fee in basis points
    /// @param rebalanceFrequency Hours between automated rebalances
    /// @param targetAssets Array of asset addresses for the portfolio
    /// @param targetWeights Array of target weights in basis points
    function depositAndCreateStrategy(
        uint256 assets,
        address receiver,
        string memory strategyName,
        string memory strategyDescription,
        uint64 performanceFee,
        uint64 rebalanceFrequency,
        address[] memory targetAssets,
        uint256[] memory targetWeights
    )
        external
        nonReentrant
        whenNotPaused
        onlyWhitelisted
        returns (uint256 shares)
    {
        require(targetAssets.length == targetWeights.length, "Assets/weights length mismatch");
        require(targetAssets.length > 0, "At least one asset required");
        require(performanceFee <= 300, "Performance fee too high (max 3%)"); // Max 3%

        // Deposit assets and mint PIT tokens
        shares = deposit(assets, receiver);

        // Create strategy
        Strategy memory newStrategy = Strategy({
            active: true,
            createdAt: block.timestamp,
            lastRebalance: block.timestamp,
            totalAssetsManaged: assets,
            shareSupply: shares,
            performanceFee: performanceFee,
            rebalanceFrequency: rebalanceFrequency,
            name: strategyName,
            description: strategyDescription
        });

        userStrategies[receiver].push(newStrategy);

        // Set asset weights
        _setStrategyAssetWeights(receiver, userStrategies[receiver].length - 1, targetAssets, targetWeights);

        emit StrategyCreated(receiver, userStrategies[receiver].length - 1, strategyName);
    }

    /// @notice Execute rebalancing for a user's strategy
    /// @param user Address of the user whose strategy to rebalance
    /// @param strategyId ID of the strategy to rebalance
    function executeRebalance(address user, uint256 strategyId)
        external
        nonReentrant
        whenNotPaused
        onlyRole(STRATEGIST_ROLE)
    {
        require(strategyId < userStrategies[user].length, "Invalid strategy ID");

        Strategy storage strategy = userStrategies[user][strategyId];
        require(strategy.active, "Strategy not active");
        require(
            block.timestamp >= strategy.lastRebalance + (strategy.rebalanceFrequency * 1 hours),
            "Too early for rebalance"
        );

        // Get current asset values and compare with targets
        AssetWeight[] storage assetWeights = userAssetWeights[user];

        uint256 totalAssets = convertToAssets(strategy.shareSupply);
        require(totalAssets >= MIN_REBALANCE_AMOUNT, "Insufficient assets for rebalance");

        // Rebalancing logic would be implemented here
        // 1. Calculate current vs target allocations
        // 2. Execute necessary swaps via DEX integration
        // 3. Update strategy state
        // 4. Collect performance fees if applicable

        strategy.lastRebalance = block.timestamp;
        strategy.totalAssetsManaged = totalAssets;

        emit StrategyRebalanced(user, strategyId, block.timestamp);
    }

    /// @notice Collect performance fees for creators
    /// @param user Address of the user to collect fees from
    /// @param strategyId ID of the strategy to collect fees from
    function collectPerformanceFees(address user, uint256 strategyId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (uint256 feesCollected)
    {
        require(strategyId < userStrategies[user].length, "Invalid strategy ID");

        Strategy storage strategy = userStrategies[user][strategyId];
        require(strategy.active, "Strategy not active");

        uint256 currentValue = convertToAssets(strategy.shareSupply);
        uint256 previousValue = strategy.totalAssetsManaged;
        uint256 profit = currentValue > previousValue ? currentValue - previousValue : 0;

        if (profit > 0) {
            feesCollected = (profit * strategy.performanceFee) / MAX_BASIS_POINTS;
            userTotalFeesCollected[user] += feesCollected;
            strategy.totalAssetsManaged = currentValue - feesCollected;

            emit PerformanceFeeCollected(user, strategyId, feesCollected);
        }
    }

    function _setStrategyAssetWeights(
        address user,
        uint256 strategyIndex,
        address[] memory assets,
        uint256[] memory weights
    ) private {
        // Clear existing weights
        delete userAssetWeights[user];

        // Set new weights
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            AssetWeight memory weight = AssetWeight({
                asset: assets[i],
                targetWeight: weights[i],
                currentWeight: weights[i] // Initial current weight = target
            });
            userAssetWeights[user].push(weight);
            totalWeight += weights[i];
        }

        require(totalWeight == MAX_BASIS_POINTS, "Weights must total 100%");
    }

    // Emergency functions
    function emergencyPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit EmergencyAction("PAUSE", msg.sender, block.timestamp);
    }

    function emergencyResume() external onlyRole(GUARDIAN_ROLE) {
        _unpause();
        emit EmergencyAction("RESUME", msg.sender, block.timestamp);
    }

    function emergencyWithdraw(
        address receiver,
        uint256 assets,
        uint256 deadline
    ) external onlyRole(GUARDIAN_ROLE) nonReentrant {
        // Allow emergency withdrawal with reduced constraints
        _withdraw(receiver, assets, 0); // Allow unlimited slippage in emergency
        emit EmergencyAction("WITHDRAW", receiver, block.timestamp);
    }

    // Whitelist management
    function enableWhitelist() external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelistOnly = true;
        emit EmergencyAction("WHITELIST_ENABLED", msg.sender, block.timestamp);
    }

    function disableWhitelist() external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelistOnly = false;
        emit EmergencyAction("WHITELIST_DISABLED", msg.sender, block.timestamp);
    }

    function addToWhitelist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelist[account] = true;
        emit EmergencyAction("WHITELIST_ADD", account, block.timestamp);
    }

    // View functions
    function getUserStrategies(address user) external view returns (Strategy[] memory) {
        return userStrategies[user];
    }

    function getUserStrategyCount(address user) external view returns (uint256) {
        return userStrategies[user].length;
    }

    function getUserAssetWeights(address user) external view returns (AssetWeight[] memory) {
        return userAssetWeights[user];
    }
}
