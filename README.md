# Supported-projects

This repo hosts the supported blockchains and assets for Tabu. Adding support for you favorite assets only requires a PR following the instructions below. See you on the Interchain! 🚀

To add a blockchain to Tabu:

1. First create a new branch named with this schema `Blockchain/Name`.
2. Create a json file in the `blockchains` directory. Name the file the same as the blockchain you want to add (e.g. `juno.json`).

The json file schema should follow the below example:

```json
{
  "name": "Umee",
  "chainId": "umee-1",
  "type": "cosmos",
  "logo": "https://storage.googleapis.com/umeedropzone/umee_logo.svg",
  "denom": "umee",
  "prefix": "umee",
  "rpc": "https://rpc.mainnet.network.umee.cc/",
  "api": "https://api.mainnet.network.umee.cc",
  "bip44": {
    "coinType": 118
  },
  "bech32Config": {
    "bech32PrefixAccAddr": "umee",
    "bech32PrefixAccPub": "umeepub",
    "bech32PrefixValAddr": "umeevaloper",
    "bech32PrefixValPub": "umeevaloperpub",
    "bech32PrefixConsAddr": "umeevalcons",
    "bech32PrefixConsPub": "umeevalconspub"
  },
  "stakeCurrency": {
    "coinDenom": "UMEE",
    "coinMinimalDenom": "uumee",
    "coinDecimals": 6
  },
  "feeCurrencies": [
    {
      "coinDenom": "UMEE",
      "coinMinimalDenom": "uumee",
      "coinDecimals": 6,
      "gasPriceStep": {
        "low": 0.05,
        "average": 0.06,
        "high": 0.1
      }
    }
  ],
  "assets": [
    {
      "name": "Umee",
      "symbol": "UMEE",
      "baseDenom": "uumee",
      "denom": "umee",
      "cosmosHubId": "umee",
      "decimals": 6,
      "website": "https://umee.cc/",
      "explorer": "https://www.mintscan.io/umee",
      "shortDescription": "Simplest way to start your DeFi experience for staking, rates, and interoperable solutions across blockchains.",
      "description": "Umee is a layer one blockchain for cross chain communication and interoperability, built on the Cosmos SDK and powered by Tendermint Consensus along with a self sovereign validator network.",
      "link": "https://app.umee.cc/#/markets",
      "coinGeckoId": "umee",
      "logo": "https://storage.googleapis.com/umeedropzone/umee_logo.svg",
      "ethereum": "0xc0a4df35568f116c370e6a6a6022ceb908eeddac"
    }
  ]
}
```

DO NOT add ibc assets to the `assets` array. This is for NATIVE ASSETS ONLY. Our backend automatically accounts for ibc denom conversion.

Note that some chains may have different params then others. For example, Ethereum assets have an "address" param, whereas Cosmos assets do not. It's best to follow examples of existing files and if you have questions feel free to create an issue. 

## Type Options

We include a `type` param for blockchains so we can understand how to handle those chains in terms of signing and functionality. The two major types supported are `cosmos` and `evm`. 

## ChainId

EVM and Cosmos chains have different conventions for for the `chain-id` param. You can find a list of EVM chains and their ids [Here](https://chainlist.org/)

For Cosmos chains, the chain id should is a string, such as `umee-1`.

4. For each tracking, please create single commits for each asset you want to add using the following schema: `Asset: Symbol`

_This repo uses conventional commits, you must follow the syntax or it will not let you make a commit._

5. Finally create a Pull Request to merge your branch into the main branch.

Done :grinning:
