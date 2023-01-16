# Supported-projects

Supported Projects for Tao-Systems Projects API

To add an blockchain to Tabu Wallet follow the steps below:

1. First create a new branch with this format `Blockchain/Name`.
2. Create a folder in the blockchain director with the name of the blockchain.

The json should be as follows:

```json
{
  "name": "Umee",
  "chainId": "umee-1",
  "assets": [
    {
      "name": "Umee",
      "symbol": "UMEE",
      "baseDenom": "uumee",
      "cosmosHubId": "umee",
      "decimals": 6,
      "website": "https://umee.cc/",
      "explorer": "https://www.mintscan.io/umee",
      "shortDescription": "Short description ",
      "description": "Full description",
      "link": "https://app.umee.cc/#/markets",
      "coinGeckoId": "umee",
      "logo": "https://assets.coingecko.com/coins/images/20635/small/1Ab_Umee_Brand_Icon_Full_Color.png?1645018295"
    }
  ]
}
```

Notice the assets array is where you would add native assets of that chain. Different chains may have different params.

For example ethereum assets have the "address" param.

## Type Options

- Native (ETH, BTC, SOL)
- ERC20 (Tokens on EVM, WETH, BabyDoge, Chainlink)
- COSMOS (Cosmos Native Assets, Atom, Osmo, Juno)

## ChainId

For all EVM Chains this should be a number if an evm based chain. You can find a list of EVM chains and their ids [Here](https://chainlist.org/)

For Cosmos based chains the chain Id should be something like "umee-1", "juno-1" etc.

4. Create a commit that follows this naming pattern `Asset: Symbol`

5. Add tokens cosmoshub id: `https://chains.cosmos.directory/{id}`

_This repo uses conventional commits, you must follow the syntax or it will not let you make a commit._

5. Finally create a Pull Request to merge your asset branch into the main branch.

Done :grinning:
