import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const cacheDirectory = path.join(root, ".cache", "serpapi");
const outputPath = path.join(root, "fixtures", "recorded", "krishi-nadia.json");

const files = (await readdir(cacheDirectory)).filter((file) => file.endsWith(".json"));
const queries = [];

for (const file of files) {
  const parsed = JSON.parse(await readFile(path.join(cacheDirectory, file), "utf8"));
  const query = parsed.query;
  if (!query?.engine || !query?.query || !parsed.raw) continue;

  const isHeroQuery = query.engine === "google"
    ? (query.query.includes('"Rice" "Nadia" "Flowering"') || query.query.includes('"Rice" "West Bengal" farmer scheme') || query.query.includes('"Rice" "Nadia" "West Bengal" mandi'))
    : query.engine === "google_maps"
      ? query.query.toLocaleLowerCase().includes("nadia") && query.parameters?.location?.toLocaleLowerCase().includes("west bengal")
      : query.engine === "google_trends"
        ? query.query.toLocaleLowerCase() === "rice brown spots" && query.parameters?.geo === "IN-WB"
        : query.engine === "youtube" && query.query.toLocaleLowerCase().includes("rice nadia");
  if (!isHeroQuery) continue;

  queries.push({
    engine: query.engine,
    query: query.query,
    parameters: query.parameters,
    raw: parsed.raw
  });
}

if (queries.length === 0) {
  throw new Error("No matching live cache entries were found. Run the live hero scenario first.");
}

const recording = {
  version: 1,
  label: "Recorded live SerpApi capture — Rice / Nadia / Flowering",
  recordedAt: new Date().toISOString(),
  module: "krishi",
  match: {
    crop: "rice",
    state: "west bengal",
    district: "nadia",
    stage: "flowering"
  },
  queries
};

await writeFile(outputPath, `${JSON.stringify(recording, null, 2)}\n`, "utf8");
console.log(`Recorded ${queries.length} real SerpApi query responses to ${outputPath}`);
