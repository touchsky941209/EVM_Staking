import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { Token } from "../typechain-types";

describe("TokenFactory", function () {
    async function deployFixture() {
        const [admin, user1, user2] = await ethers.getSigners();
        const ERC20Test = await ethers.getContractFactory("Token");
        const USDT = await ERC20Test.connect(user1).deploy("USDT", "USDT", 6, 100_000_000_000n);
        const USDC = await ERC20Test.connect(user1).deploy("USDC", "USDC", 6, 100_000_000_000n);

        const ETH = await ERC20Test.connect(user1).deploy("ETH", "ETH", 18, 100_000_000n);
        await USDT.waitForDeployment();
        await USDC.waitForDeployment();

        const _StakingContract = await ethers.getContractFactory("StakingContract");
        const StakingContract = await _StakingContract.deploy(admin);

        return {
            admin,
            user1,
            user2,
            USDC,
            USDT,
            StakingContract,
        }
    }

    describe("Wallet Factory", async () => {
        it("should create token", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal("100000.0");
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals
            await USDT.connect(user1).approve(StakingContract, amountToDeposit);
            await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal("99900.0");
        })

        it("Should set user1 as admin", async () => {
            const { admin, user1, StakingContract } = await loadFixture(deployFixture)
            await StakingContract.connect(admin).setAdmin(user1)
        })

        it("Should not set admin if caller is not admin", async () => {
            const { admin, user1, StakingContract } = await loadFixture(deployFixture)
            await expect(StakingContract.connect(user1).setAdmin(user1)).to.be.revertedWith("caller is not admin")
        })

        it("Owner verification", async () => {
            const { admin, user1, StakingContract } = await loadFixture(deployFixture)
            const adminAddress = await StakingContract.connect(user1).admin()
            await expect(adminAddress).to.equal(admin)
        })
    })

    describe("Token Locking Contract", async () => {
        it("Should Token Lock in smart contract with user1", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }

            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));

            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
        })

        it("Should not withdraw in 3 months with user1", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));
            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
            await expect(StakingContract.connect(user1).WithDraw(1, USDT))
                .to.be.revertedWith("Lock time not elapsed");
        })

        it("Should withdraw after 3 month with user1", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }

            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));

            const threeMonthsInSeconds = 3 * 30 * 24 * 60 * 60; // Approximation
            await time.increase(threeMonthsInSeconds);
            await StakingContract.connect(user1).WithDraw(1, USDT)

            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
        })



        it("Should Token Lock in smart contract with user2", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }

            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));

            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
        })

        it("Should not withdraw in 3 months with user2", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));
            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
            await expect(StakingContract.connect(user1).WithDraw(1, USDT))
                .to.be.revertedWith("Lock time not elapsed");
        })

        it("Should withdraw after 3 month with user2", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }

            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));

            const threeMonthsInSeconds = 3 * 30 * 24 * 60 * 60; // Approximation
            await time.increase(threeMonthsInSeconds);
            await StakingContract.connect(user1).WithDraw(1, USDT)

            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
        })

    })

    describe("RewardDistribution Contract", async () => {
        it("Should withdraw after 3 month with reward with user1", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }

            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));

            const threeMonthsInSeconds = 3 * 30 * 24 * 60 * 60; // Approximation

            await time.increase(threeMonthsInSeconds);
            await StakingContract.connect(user1).WithDraw(1, USDT)
            
            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
        })

        it("Should not withdraw in 3 months with Reward with user1", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));
            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
            await expect(StakingContract.connect(user1).WithDraw(1, USDT))
                .to.be.revertedWith("Lock time not elapsed");
        })

        it("Should withdraw after 3 month with reward with user2", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }

            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));

            const threeMonthsInSeconds = 3 * 30 * 24 * 60 * 60; // Approximation

            await time.increase(threeMonthsInSeconds);
            await StakingContract.connect(user1).WithDraw(1, USDT)
            
            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
        })

        it("Should not withdraw in 3 months with Reward with user2", async () => {
            const { USDT, USDC, StakingContract, admin, user1 } = await loadFixture(deployFixture)
            const initAmount = 100000.0;
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String(initAmount.toFixed(1)));
            const amountToDeposit = ethers.parseUnits("100", 6); // 100 USDT, adjust decimals

            for (let i = 0; i < 3; i++) {
                await USDT.connect(user1).approve(StakingContract, amountToDeposit);
                await StakingContract.connect(user1).Deposite(USDT, amountToDeposit);
            }
            expect(await ethers.formatUnits(await USDT.balanceOf(user1), 6)).to.equal(String((initAmount - 3 * 100).toFixed(1)));
            const tokenList = await StakingContract.connect(user1).getStakingTokenList()
            const startTimeList = await StakingContract.connect(user1).getStakingTokenStartTime()
            const amountList = await StakingContract.connect(user1).getStakingTokenAmount()
            await expect(StakingContract.connect(user1).WithDraw(1, USDT))
                .to.be.revertedWith("Lock time not elapsed");
        })
    })
});
