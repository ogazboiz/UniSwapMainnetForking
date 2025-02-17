import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")



// usdc and dai 
const main = async () => {

    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DaiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    // const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const liquidityProvider = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";
    const poolUSDDaiAddress = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5"

    await helpers.impersonateAccount(liquidityProvider);

    const impersonateSigner = await ethers.getSigner(liquidityProvider)
    let USDCContract = await ethers.getContractAt("IERC20", USDCAddress)
    let daiContract = await ethers.getContractAt("IERC20", DaiAddress)
    let UNIRouterContract = await ethers.getContractAt("IUniswapV2Router", UNIRouter)
    let poolContract = await ethers.getContractAt("IERC20", poolUSDDaiAddress)
    // let poolDaiContract = await ethers.getContractAt("IERC20",poolUSDDaiAddress)

    console.log("\n\n----------------start and proceed----------------")

    const usdcbal = await USDCContract.balanceOf(impersonateSigner)
    const daibal = await daiContract.balanceOf(impersonateSigner)
    const poolUsdcbal = await USDCContract.balanceOf(poolUSDDaiAddress)
    const poolDaibal = await daiContract.balanceOf(poolUSDDaiAddress)
    const lpBalance = await poolContract.balanceOf(liquidityProvider);
    // const poolbalOfDai = await 

    console.log("\n\n----------------Before----------------")
    console.log("Before balance of the user usdc balance:" + ethers.formatUnits(usdcbal, 6))
    console.log("Before balance of the user dai balance:" + ethers.formatUnits(daibal, 18))
    console.log("Before balance of the pool usdc balance:" + ethers.formatUnits(poolUsdcbal, 6))
    console.log("Before balance of the pool dai balance:" + ethers.formatUnits(poolDaibal, 18))
    console.log("Before balance of the liquidity balance:" + ethers.formatUnits(lpBalance, 18))


    // function addLiquidity(
    //     address tokenA,
    //     address tokenB,
    //     uint amountADesired,
    //     uint amountBDesired,
    //     uint amountAMin,
    //     uint amountBMin,
    //     address to,
    //     uint deadline
    // ) external returns (uint amountA, uint amountB, uint liquidity);
    console.log("0")
    let amountADesired = ethers.parseUnits("100000", 6)
    console.log("1")
    // function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    // let quoteB = await UNIRouterContract.quote(amountADesired, poolUsdcbal, poolDaibal)
    // const amountBDesired = quoteB
    let amountAMin = ethers.parseUnits("99000", 6);
    // const amountAMin = await amountBDesired * 95n / 100n;

    console.log("\n\n----------------Quote B----------------")
    // console.log("Quote B", ethers.formatUnits(quoteB, 18))
    // console.log("2")
    
    let amountBDesired = ethers.parseUnits("100000", 18);
    // const amtBMin = amtBtokenDesired * 95n / 100n; // Reduce by 5% instead of a fixed amount
    // const amountBMin = await amountBDesired * 95n / 100n;
    // let amountBMin = await amountBDesired * 95n / 100n;
    let amountBMin = await ethers.parseUnits("99000", 18);

    // const amountBMin = amountBDesired.mul(95).div(100);

    // console.log("3")

    // function addLiquidity(
    //     address tokenA,
    //     address tokenB,
    //     uint amountADesired,
    //     uint amountBDesired,
    //     uint amountAMin,
    //     uint amountBMin,
    //     address to,
    //     uint deadline
    // ) external returns (uint amountA, uint amountB, uint liquidity);
    const deadline = await helpers.time.latest() + 600;
    // Approve USDC
    console.log("\n----------------Approving USDC----------------");
    const approveTx = await USDCContract.connect(impersonateSigner).approve(UNIRouter, amountADesired);
    await approveTx.wait();
    const usdcAllowance = await USDCContract.allowance(impersonateSigner.address, UNIRouter);
    console.log("USDC Allowance:", ethers.formatUnits(usdcAllowance, 6));

    // Approve DAI
    console.log("\n----------------Approving DAI----------------");
    const approveTxII = await daiContract.connect(impersonateSigner).approve(UNIRouter, amountBDesired);
    await approveTxII.wait();
    const daiAllowance = await daiContract.allowance(impersonateSigner.address, UNIRouter);
    console.log("DAI Allowance:", ethers.formatUnits(daiAllowance, 18));
    console.log("\n----------------adding liquidity----------------")
    console.log("\n----------------Adding liquidity----------------");
    try {
        const addLiquidityTx = await UNIRouterContract.connect(impersonateSigner).addLiquidity(
            USDCAddress,
            DaiAddress,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            liquidityProvider,
            deadline
        );
        await addLiquidityTx.wait();
        console.log("Liquidity added successfully");
    } catch (error) {
        console.error("Error adding liquidity:", error);
    }

    const usdcbalAfter = await USDCContract.balanceOf(impersonateSigner.address);
    const daibalAfter = await daiContract.balanceOf(impersonateSigner.address);
    const poolUsdcbalAfter = await USDCContract.balanceOf(poolUSDDaiAddress);
    const poolDaibalAfter = await daiContract.balanceOf(poolUSDDaiAddress);
    const lpBalanceAfter = await poolContract.balanceOf(liquidityProvider);

    console.log("\n\n----------------After----------------")
    console.log("After balance of the user usdc balance:" + ethers.formatUnits(usdcbalAfter, 6))
    console.log("After balance of the user dai balance:" + ethers.formatUnits(daibalAfter, 18))
    console.log("After balance of the pool usdc balance:" + ethers.formatUnits(poolUsdcbalAfter, 6))
    console.log("After balance of the pool dai balance:" + ethers.formatUnits(poolDaibalAfter, 18))
    console.log("After balance of the liquidity balance:" + ethers.formatUnits(lpBalanceAfter, 18))
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})