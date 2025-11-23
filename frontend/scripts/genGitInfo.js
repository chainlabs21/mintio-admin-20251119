// frontend/scripts/genGitInfo.js
import { execSync } from "child_process";
import { writeFileSync } from "fs";

try {
  const hash = execSync("git rev-parse --short HEAD").toString().trim();
  const date = execSync("git log -1 --format=%cd --date=local").toString().trim();

  writeFileSync(
    "./src/gitInfo.json",
    JSON.stringify({ hash, date }, null, 2),
    "utf8"
  );

  console.log("gitInfo.json generated:", { hash, date });
} catch (err) {
  console.error("Failed to generate gitInfo.json:", err);
}
