import { impersonateAccount, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DaiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    // const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const liquidityProvider = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";
    const poolUSDDaiAddress = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5"

    await helpers.impersonateAccount(liquidityProvider)

    const impersonatePerson = await ethers.getSigner(liquidityProvider)
    const USDCContract = await ethers.getContractAt("IERC20", USDCAddress)
    const daiContract= await ethers.getContractAt("IERC20", DaiAddress)
    const UNIRouterContract = await ethers.getContractAt("IUniswapV2Router", UNIRouter)
    const poolUSDDaiContract = await ethers.getContractAt("IERC20", poolUSDDaiAddress)
    

   console.log("\n\n-----------let move 🚀------------")

   const usdcBal = await USDCContract.balanceOf(liquidityProvider)
   const daiBal = await daiContract.balanceOf(liquidityProvider)
   const poolUsdcBal = await USDCContract.balanceOf(poolUSDDaiAddress)
   const poolDaiBal = await daiContract.balanceOf(poolUSDDaiAddress)
   const lpBalance = await poolUSDDaiContract.balanceOf(liquidityProvider);


   console.log("\n\n-----------BeFore 🏖------------")
   console.log("Before balance of the user usdc balance:" + ethers.formatUnits(usdcBal, 6))
   console.log("Before balance of the user dai balance:" + ethers.formatUnits(daiBal, 18))
   console.log("Before balance of the user pool usdc balance:" + ethers.formatUnits(poolUsdcBal, 6))
   console.log("Before balance of the user pool dai balance:" + ethers.formatUnits(poolDaiBal, 18))
   console.log("Before balance of the liquidity balance:" + ethers.formatUnits(lpBalance, 18))



console.log("\n\n-----------Processing Liquidity ⌛------------")

 // Ensure the liquidity amount is valid
 const Liquidity = lpBalance; // Use the full balance to avoid underflow
await poolUSDDaiContract.connect(impersonatePerson).approve(UNIRouter, Liquidity);

//  const Liquidity = ethers.parseUnits("0.075104720681049982", 18); // Use the full LP balance

 // Check if the liquidity provider has sufficient LP tokens
 

  const amtATokenDesired = ethers.parseUnits("100000", 6);
  const amtBTokenDesired = ethers.parseUnits("90000", 18);

  // Calculate quoteB correctly with await
//   let quoteB = await UNIRouterContract.quote(amtATokenDesired, poolUsdcBal, poolDaiBal);
//   let amtBTokenDesired = quoteB;


  const amountBMin = (amtBTokenDesired * 95n) / 100n;
  const amountAMin = (amtATokenDesired * 95n) / 100n;
//   const deadline = (await helpers.time.latest()) + 500;


//  const deadline = (await helpers.time.latest()) + 500;

//    function removeLiquidity(
//     address tokenA,
//     address tokenB,
//     uint liquidity,
//     uint amountAMin,
//     uint amountBMin,
//     address to,
//     uint deadline
// ) external returns (uint amountA, uint amountB);
const deadline = await helpers.time.latest() + 600
console.log("\n\n-----------Remove Liquidity------------")

try {
    const removeLiquidityTx = await UNIRouterContract.connect(impersonatePerson)
        .removeLiquidity(
            USDCAddress, 
            DaiAddress, 
            Liquidity, 
            amountAMin, 
            amountBMin, 
            liquidityProvider, 
            deadline
        );
    await removeLiquidityTx.wait();
        console.log("Liquidity remove successfully");
} catch (error) {
    console.error("error removing liquidity " + error);
}

const usdcbalAfter = await USDCContract.balanceOf(liquidityProvider)
const daibalAfter = await daiContract.balanceOf(liquidityProvider)
const poolUsdcbalAfter = await USDCContract.balanceOf(poolUSDDaiAddress)
const poolDaibalAfter = await daiContract.balanceOf(poolUSDDaiAddress)
const lpBalanceAfter = await poolUSDDaiContract.balanceOf(liquidityProvider);


console.log("\n\n-----------AFTER 🕑 ------------")
console.log("After balance of the user usdc balance:" + ethers.formatUnits(usdcbalAfter, 6))
console.log("After balance of the user dai balance:" + ethers.formatUnits(daibalAfter, 18))
console.log("After balance of the user pool usdc balance:" + ethers.formatUnits(poolUsdcbalAfter, 6))
console.log("After balance of the user pool dai balance:" + ethers.formatUnits(poolDaibalAfter, 18))
console.log("After balance of the liquidity balance:" + ethers.formatUnits(lpBalanceAfter, 18))


   
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})