const util = require("util");
const path = require("path");
const { isEqual } = require("lodash");

const { readdir, readFile, exists } = require("fs");
const { Firestore } = require("@google-cloud/firestore");
const ASSETS_DIR = "../blockchains";
const PROJECTS_DIR = "../projects";

const firestore = new Firestore({ projectId: "umee-wallet" });

async function extractDirectoryContents(TARGET_DIR) {
  console.log("EXTRACTING FROM", TARGET_DIR);
  const dirExists = await util.promisify(exists)(TARGET_DIR);

  if (!dirExists) {
    console.log(`${TARGET_DIR} does not exists in repository ... aborting`);
    return;
  }

  const files = await util.promisify(readdir)(TARGET_DIR);

  if (files.length < 1) {
    console.log(`Did not find any files in ${TARGET_DIR} - exiting.`);
    return;
  } else {
    const filesContent = await Promise.all(
      files.map((file) => {
        return util.promisify(readFile)(path.join(TARGET_DIR, file), "utf8");
      })
    );

    const fileMap = filesContent.map((fileValue) => {
      return JSON.parse(fileValue);
    });

    return fileMap;
  }
}

async function storeAssets(chains) {
  if (!chains || !chains.length > 0) {
    return;
  }

  try {
    console.log(`SAVING CHAINS`);
    await firestore.runTransaction(async (t) => {
      const chainsSnapshot = await firestore.collection("chains").get();
      const existingChains = new Map(
        chainsSnapshot.docs.map((doc) => [doc.data().chainId, doc.data()])
      );

      const { newChains, updatedChains, deletedChains } = getChainDiff(
        chains,
        existingChains
      );

      await Promise.all(
        newChains.map((chain) =>
          firestore.collection("chains").doc(chain.chainId).set(chain)
        )
      );

      await Promise.all(
        updatedChains.map((chain) =>
          firestore.collection("chains").doc(chain.chainId).update(chain)
        )
      );

      await Promise.all(
        deletedChains.map((chainId) =>
          firestore.collection("chains").doc(chainId).delete()
        )
      );

      return t;
    });

    console.log("SAVING ASSETS");
    await firestore.runTransaction(async (t) => {
      const assetsSnapshot = await firestore.collection("assets").get();
      const existingAssets = new Set(
        assetsSnapshot.docs.map((doc) => doc.data().symbol)
      );

      const newAssets = getNewAssets(chains, existingAssets);

      await Promise.all(
        Array.from(newAssets.values()).map((asset) =>
          firestore.collection("assets").doc(asset.symbol).set(asset)
        )
      );

      return t;
    });
  } catch (e) {
    console.log(`Transaction failure`, e);
  }
}

function getChainDiff(newChains, existingChains) {
  const newChainIds = new Set(newChains.map((chain) => chain.chainId));
  const existingChainIds = new Set(existingChains.keys());

  const newChainsMap = new Map(
    newChains.map((chain) => [chain.chainId, chain])
  );
  const updatedChains = [];
  const deletedChains = [];

  for (const chainId of existingChainIds) {
    if (!newChainIds.has(chainId)) {
      deletedChains.push(chainId);
    } else if (
      !isEqual(existingChains.get(chainId), newChainsMap.get(chainId))
    ) {
      updatedChains.push(newChainsMap.get(chainId));
    }
  }

  const newChainsArray = newChains.filter(
    (chain) => !existingChainIds.has(chain.chainId)
  );


  return { newChains: newChainsArray, updatedChains, deletedChains };
}

function getNewAssets(chains, existingAssets) {
  const newAssets = new Map();

  for (const chain of chains) {
    for (const asset of chain.assets) {
      if (!existingAssets.has(asset.symbol)) {
        newAssets.set(asset.symbol, { ...asset, chainId: chain.chainId });
      }
    }

  }

  return newAssets;
}

async function storeProjects(projects) {
  if (!projects || projects.length < 1) {
    return;
  }
  console.log("SAVING PROJECTS", projects);
  try {
    firestore.runTransaction(async (t) => {
      const snapshot = await firestore.collection("projects").get();
      if (snapshot.exists) {
        const updateSymbolList = projects.map((project) => project.name);

        const docData = snapshot.docs.map((doc) => doc.data());

        const deleteAssetList = docData.reduce((acc, doc) => {
          if (!updateSymbolList.includes(doc.name)) {
            acc.push(doc.name);
          }
          return acc;
        }, []);
      }

      await Promise.all(
        deleteAssetList.map((delAssetSymbol) => {
          firestore.collection("projects").doc(delAssetSymbol).delete();
        })
      );

      await Promise.all(
        assets.map(async (asset) => {
          const key = asset.name;
          firestore.collection("projects").doc(key).set(asset);
        })
      );

      return t;
    });
  } catch (e) {
    console.log(`Transaction failure`, e);
  }
}

console.log("STARGING ASSET AND PROJECT UPDATER");
extractDirectoryContents(ASSETS_DIR).then((chains) => storeAssets(chains));
extractDirectoryContents(PROJECTS_DIR).then((projects) =>
  storeProjects(projects)
);
