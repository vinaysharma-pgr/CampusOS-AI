import fs from "node:fs";

const path = "src/services/aiService.js";
let c = fs.readFileSync(path, "utf8");

// Remove the BUS TRANSPORT block (from the comment to the closing lines.push(""))
const re = /\n  \/\/ Bus info[\s\S]*?lines\.push\(""\);\n/;

if (c.match(re)) {
  c = c.replace(re, "\n");
  fs.writeFileSync(path, c, "utf8");
  console.log("aiService.js — bus section removed");
} else {
  // Try alternative pattern
  const re2 = /\/\/ Bus info[\s\S]*?lines\.push\(""\);\n/;
  if (c.match(re2)) {
    c = c.replace(re2, "");
    fs.writeFileSync(path, c, "utf8");
    console.log("aiService.js — bus section removed (alt pattern)");
  } else {
    console.log("Could not find bus section. Showing lines with 'BUS':");
    const lines = c.split("\n");
    lines.forEach((line, i) => { if (line.toLowerCase().includes("bus")) console.log((i+1) + ": " + line); });
  }
}