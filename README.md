# Comprehensive Blockchain Wallet Locking System Project Specification

This project is Staking management system on EVM.
Token is ERC-20 standard.

Try running some of the following tasks:

### Environment value setting in .env file
```shell
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_network_api
```



### project install

```shell
npm install
```
### project compile

```shell
npx hardhat compile
```
The result will be
```shell
Generating typings for: 42 artifacts in dir: typechain-types for target: ethers-v6
Successfully generated 126 typings!
Compiled 40 Solidity files successfully (evm target: paris).
```
### project test

```shell
npx hardhat test
```

The result will be 

```shell
TokenFactory
    Wallet Factory
      ✔ should create token (659ms)
      ✔ Should set user1 as admin
      ✔ Should not set admin if caller is not admin
      ✔ Owner verification
    Token Locking Contract
      ✔ Should Token Lock in smart contract with user1
      ✔ Should not withdraw in 3 months with user1
      ✔ Should withdraw after 3 month with user1
      ✔ Should Token Lock in smart contract with user2
      ✔ Should not withdraw in 3 months with user2
      ✔ Should withdraw after 3 month with user2
    RewardDistribution Contract
      ✔ Should withdraw after 3 month with reward with user1
      ✔ Should not withdraw in 3 months with Reward with user1
      ✔ Should withdraw after 3 month with reward with user2
      ✔ Should not withdraw in 3 months with Reward with user2


  14 passing (860ms)
```
