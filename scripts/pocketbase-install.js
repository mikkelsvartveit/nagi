#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, createWriteStream, unlinkSync } from "fs";
import { chmod } from "fs/promises";
import { pipeline } from "stream/promises";
import path from "path";
import { fileURLToPath } from "url";

const POCKETBASE_VERSION = "0.36.1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "pocketbase");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "pocketbase");

function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;

  let os;
  if (platform === "darwin") {
    os = "darwin";
  } else if (platform === "linux") {
    os = "linux";
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  let architecture;
  if (arch === "arm64") {
    architecture = "arm64";
  } else if (arch === "x64") {
    architecture = "amd64";
  } else {
    throw new Error(`Unsupported architecture: ${arch}`);
  }

  return { os, architecture };
}

async function downloadPocketBase() {
  const { os, architecture } = getPlatformInfo();
  const url = `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_${os}_${architecture}.zip`;

  console.log(
    `Downloading PocketBase v${POCKETBASE_VERSION} for ${os}/${architecture}...`,
  );

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const zipPath = path.join(OUTPUT_DIR, "pocketbase.zip");

  try {
    // Download the zip file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download: ${response.status} ${response.statusText}`,
      );
    }

    const fileStream = createWriteStream(zipPath);
    await pipeline(response.body, fileStream);

    console.log("Extracting PocketBase...");

    execSync(`unzip -o "${zipPath}" -d "${OUTPUT_DIR}"`, { stdio: "inherit" });
    await chmod(OUTPUT_PATH, 0o755);

    console.log(`PocketBase installed successfully at ${OUTPUT_PATH}`);
  } finally {
    // Clean up zip file
    if (existsSync(zipPath)) {
      unlinkSync(zipPath);
    }
  }
}

downloadPocketBase().catch((error) => {
  console.error("Failed to download PocketBase:", error.message);
  process.exit(1);
});
