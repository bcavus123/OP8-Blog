import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const files = execFileSync("git", ["ls-files", "app", "db", "scripts"], { encoding: "utf8" })
  .trim().split(/\r?\n/)
  .filter((file) => /\.(?:ts|tsx|mjs|css)$/.test(file) && existsSync(file));
const bad = [];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  if (/Ã|Ä|Å|Â|â(?:†|€“|€™|€¦|€¢)|ï¿½|�/.test(source)) bad.push(file);
}
if (bad.length) {
  console.error(`Bozuk Türkçe kodlama: ${bad.join(", ")}`);
  process.exit(1);
}
console.log("Türkçe UTF-8 kontrolü başarılı.");
