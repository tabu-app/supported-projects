const util = require("util");
const path = require("path");
const { readdir, readFile, exists } = require("fs");
const { Firestore } = require("@google-cloud/firestore");
const fetch = require("node-fetch");
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
    firestore.runTransaction(async (t) => {
      const chainsSnapshot = await firestore.collection("chains").get();

      if (chainsSnapshot.exists) {
        console.log(`Chain Exists`);
        const chainIds = chains.map((chain) => chain.chainId);
        const docData = snapshot.docs.map((doc) => doc.data());

        const toBeDeletedChains = docData.reduce((acc, doc) => {
          if (!chainIds.includes(doc.chainId)) {
            acc.push(doc.chainId);
          }
          return acc;
        }, []);

        console.log(`DELETING ASSETS`, toBeDeletedChains);
        await Promise.all(
          toBeDeletedChains.map((chainId) => {
            firestore.collection("chains").doc(chainId).delete();
          })
        );
        console.log(`CHAINS DELETED`);
      }
      console.log(`SAVING CHAINS`);
      await Promise.all(
        chains.map(async (chain) => {
          console.log(`SAVING CHAIN`, chain);
          firestore
            .collection("chains")
            .doc(chain.chainId)
            .set({ ...chain }, { merge: true });
        })
      );

      return t;
    });

    console.log("SAVING ASSETS");
    firestore.runTransaction(async (t) => {
      const snapshot = await firestore.collection("assets").get();

      if (snapshot.exists) {
        console.log(`SNAPSHOT EXISTS`);
        const updateSymbolList = chains
          .map((chain) => chain.assets)
          .map((asset) => asset.symbol.toUpperCase());

        const docData = snapshot.docs.map((doc) => doc.data());

        const deleteAssetList = docData.reduce((acc, doc) => {
          if (!updateSymbolList.includes(doc.symbol)) {
            acc.push(doc.symbol);
          }
          return acc;
        }, []);
        console.log(`DELETING ASSETS`, deleteAssetList);
        await Promise.all(
          deleteAssetList.map((delAssetSymbol) => {
            firestore.collection("assets").doc(delAssetSymbol.toUpperCase()).delete();
          })
        );
        console.log(`ASSETS DELETED`);
      }

      console.log(`SAVING ASSETS`);
      await Promise.all(
        chains.map(async (chain) => {
          //console.log(`SAVING ASSET`, chain);
          const chainId = chain.chainId;

          if (chain.assets.length) {
            chain.assets.forEach((asset) => {
              const key = asset.symbol;
              firestore
                .collection("assets")
                .doc(key.toUpperCase())
                .set({ ...asset, chainId, isSupported: true }, {merge: true});
            });
          }
        })
      );

      return t;
    });

  } catch (e) {
    console.log(`Transaction failure`, e);
  }
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
