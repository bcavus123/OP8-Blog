import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const files = execFileSync("git", ["ls-files", "app", "db", "scripts"], { encoding: "utf8" })
  .trim()
  .split(/\r?\n/)
  .filter((file) => /\.(?:ts|tsx|mjs|css)$/.test(file) && existsSync(file));

const mojibake = /(?:\u00C3[\u0080-\u00BF]|\u00C4[\u0080-\u00BF]|\u00C5[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]|\u00EF\u00BF\u00BD|\uFFFD)/;
const bad = files.filter((file) => mojibake.test(readFileSync(file, "utf8")));

if (bad.length) {
  console.error(`Bozuk Türkçe kodlama: ${bad.join(", ")}`);
  process.exit(1);
}

console.log("Türkçe UTF-8 kontrolü başarılı.");
