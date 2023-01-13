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
    type: { type: "string" },
    logo: { type: "string" },
    denom: { type: "string" },
    prefix: { type: "string" },
    assets: COSMOS_ARRAY_SCHEMA,
  },

  required: ["name", "chainId", "type", "logo", "denom", "prefix", "assets"],
  additionalProperties: true,
};

const EVM_CHAIN_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    chainId: { type: "string" },
    type: { type: "string" },
    logo: { type: "string" },
    denom: { type: "string" },
    prefix: { type: "string" },
    assets: EVM_ARRAY_SCHEMA,
  },

  required: ["name", "chainId", "type", "logo", "denom", "prefix", "assets"],
  additionalProperties: true,
};

const cosmosValidationModel = ajv.compile(COSMOS_CHAIN_SCHEMA);
const evmValidationModel = ajv.compile(EVM_CHAIN_SCHEMA);

function isValidProp(prop: any): boolean {
  return typeof prop === "string" && prop.length > 1;
}

function isValidAsset(obj: any): boolean {
  if (!obj.type || (obj.type !== "cosmos" && obj.type !== "evm")) {
    return false;
  }

  for (let asset of obj.assets) {
    let validProps;
    if (obj.type === "cosmos") {
      validProps = [
        asset.name,
        asset.symbol,
        asset.baseDenom,
        asset.cosmosHubId,
        asset.website,
        asset.explorer,
        asset.shortDescription,
        asset.description,
        asset.link,
        asset.coinGeckoId,
        asset.logo,
      ];
    } else {
      validProps = [
        asset.address,
        asset.name,
        asset.symbol,
        asset.website,
        asset.explorer,
        asset.shortDescription,
        asset.description,
        asset.link,
        asset.coinGeckoId,
        asset.logo,
      ];
    }
    if (!validProps.every(isValidProp)) {
      return false;
    }
  }
  return true;
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

      if (chainInfo.type === "cosmos") {
        propertyTest = cosmosValidationModel(chainInfo);
      } else if (chainInfo.type === "evm") {
        propertyTest = evmValidationModel(chainInfo);
      }

      if (!testType) {
        throw new Error(
          `Asset ${chainInfo.name} does not adhere to the @tabu/shared-types.Blockchain schema`
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
