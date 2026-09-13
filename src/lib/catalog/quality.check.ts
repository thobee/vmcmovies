import { highestQuality, parseQualities } from "./quality";

const parsed = parseQualities("720p, 1080P, 4k, 2160p, junk");
console.assert(parsed.join(",") === "720p,1080p,4K", parsed.join(","));
console.assert(highestQuality(parsed) === "4K");
console.assert(parseQualities(undefined).length === 0);
console.log("quality.check ok");
