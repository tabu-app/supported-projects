import { readdirSync, readFileSync } from "fs";
import path from "path";
import { Blockchain } from "@tabu/shared-types";
import Ajv from "ajv";

const ajv = new Ajv();
const BLOCKCHAINS_DIR = "./blockchains";

const COSMOS_ASSET_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    symbol: { type: "string" },
    baseDenom: { type: "string" },
    cosmosHubId: { type: "string" },
    decimals: { type: "integer" },
    website: { type: "string" },
    explorer: { type: "string" },
    shortDescription: { type: "string" },
    description: { type: "string" },
    link: { type: "string" },
    coinGeckoId: { type: "string" },
    logo: { type: "string" },
  },
  required: [
    "name",
    "symbol",
    "baseDenom",
    "cosmosHubId",
    "decimals",
    "website",
    "explorer",
    "shortDescription",
    "description",
    "link",
    "coinGeckoId",
    "logo",
  ],
};

const EVM_ASSET_SCHEMA = {
  type: "object",
  properties: {
    address: { type: "string" },
    name: { type: "string" },
    symbol: { type: "string" },
    decimals: { type: "integer" },
    website: { type: "string" },
    explorer: { type: "string" },
    shortDescription: { type: "string" },
    description: { type: "string" },
    link: { type: "string" },
    coinGeckoId: { type: "string" },
    logo: { type: "string" },
  },
  required: [
    "address",
    "name",
    "symbol",
    "decimals",
    "website",
    "explorer",
    "shortDescription",
    "description",
    "link",
    "coinGeckoId",
    "logo",
  ],
};

const COSMOS_ARRAY_SCHEMA = {
  type: "array",
  items: COSMOS_ASSET_SCHEMA,
};

const EVM_ARRAY_SCHEMA = {
  type: "array",
  items: EVM_ASSET_SCHEMA,
};

const COSMOS_CHAIN_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    chainId: { type: "string" },
    chain_type: { type: "string" },
    assets: COSMOS_ARRAY_SCHEMA,
  },

  required: ["name", "chainId", "chain_type", "assets"],
  additionalProperties: true,
};

const EVM_CHAIN_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    chainId: { type: "string" },
    chain_type: { type: "string" },
    assets: EVM_ARRAY_SCHEMA,
  },

  required: ["name", "chainId", "chain_type", "assets"],
  additionalProperties: true,
};

const cosmosValidationModel = ajv.compile(COSMOS_CHAIN_SCHEMA);
const evmValidationModel = ajv.compile(EVM_CHAIN_SCHEMA);

function isValidProp(prop): boolean {
  return typeof prop === "string";
}

function isValidAsset(obj: any): obj is Blockchain {
  //loop around an object and check if all properties are valid

  if (obj.chain_type === "cosmos") {
    obj.assets.forEach((asset) => {
      console.log(asset);
      console.log(isValidProp(asset.name));
      if (
        isValidProp(asset.name) ||
        isValidProp(asset.symbol) ||
        isValidProp(asset.baseDenom) ||
        isValidProp(asset.cosmosHubId) ||
        isValidProp(asset.website) ||
        isValidProp(asset.explorer) ||
        isValidProp(asset.shortDescription) ||
        isValidProp(asset.description) ||
        isValidProp(asset.link) ||
        isValidProp(asset.coinGeckoId) ||
        isValidProp(asset.logo)
      ) {
        return true;
      } else {
        return false;
      }
    });
  } else if (obj.chain_type === "evm") {
    obj.assets.forEach((asset) => {
      if (
        isValidProp(asset.address) ||
        isValidProp(asset.name) ||
        isValidProp(asset.symbol) ||
        isValidProp(asset.website) ||
        isValidProp(asset.explorer) ||
        isValidProp(asset.shortDescription) ||
        isValidProp(asset.description) ||
        isValidProp(asset.link) ||
        isValidProp(asset.coinGeckoId) ||
        isValidProp(asset.logo)
      ) {
        return true;
      } else {
        return false;
      }
    });
  }
  console.log("INVALID CHAIN:::, ", obj.name);
  return false;
}

describe(`Validate supported assets`, () => {
  let blockchainList;
  beforeAll(async () => {
    const assetDirectories = await readdirSync(BLOCKCHAINS_DIR);

    blockchainList = await Promise.all(
      assetDirectories.map((blockchain) => {
        return {
          [blockchain]: JSON.parse(
            readFileSync(path.join(BLOCKCHAINS_DIR, blockchain), "utf8")
          ),
        };
      })
    );
  });

  it(`all assets should conform to the Asset type @tabu/shared-types`, () => {
    blockchainList.forEach((chain) => {
      const key = Object.keys(chain)[0];

      const chainInfo: Blockchain = { ...chain[key] };

      const testType = isValidAsset(chainInfo);

      var propertyTest;
      if (chainInfo.chain_type === "cosmos") {
        console.log("COSMOS", chainInfo.name);
        propertyTest = cosmosValidationModel(chainInfo);
      } else if (chainInfo.chain_type === "evm") {
        console.log("EVM", chainInfo.name);
        propertyTest = evmValidationModel(chainInfo);
      }
      console.log("TEST TYPE ", testType);
      if (!testType) {
        throw new Error(
          `Asset ${key} does not adhere to the @tabu/shared-types.Blockchain schema`
        );
      }
      if (!propertyTest) {
        console.log(cosmosValidationModel.errors);
        console.log(evmValidationModel.errors);
        console.log("Check", chainInfo.name, "for errors");
      }

      expect(testType).toBeTruthy();
      expect(propertyTest).toBeTruthy();
    });
  });
});
