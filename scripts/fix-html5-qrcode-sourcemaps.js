// html5-qrcode@2.x publishes source maps whose "sources" point one directory
// too high (e.g. "../../src/core.ts" instead of "../src/core.ts"), so CRA's
// source-map-loader warns that it can't find the .ts files. Rewrite each
// broken path to the copy of src/ that ships inside the package.
const fs = require("fs");
const path = require("path");

const pkgDir = path.join(__dirname, "..", "node_modules", "html5-qrcode");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!fs.existsSync(pkgDir)) process.exit(0);

let fixed = 0;
for (const sub of ["esm", "cjs", "es2015"]) {
  const dir = path.join(pkgDir, sub);
  if (!fs.existsSync(dir)) continue;

  for (const mapFile of walk(dir).filter((f) => f.endsWith(".js.map"))) {
    const mapDir = path.dirname(mapFile);
    const map = JSON.parse(fs.readFileSync(mapFile, "utf8"));
    let changed = false;

    map.sources = map.sources.map((src) => {
      if (fs.existsSync(path.resolve(mapDir, src))) return src;
      const candidate = src.replace(/^\.\.\//, "");
      if (candidate !== src && fs.existsSync(path.resolve(mapDir, candidate))) {
        changed = true;
        return candidate;
      }
      return src;
    });

    if (changed) {
      fs.writeFileSync(mapFile, JSON.stringify(map));
      fixed++;
    }
  }
}

if (fixed) console.log(`fix-html5-qrcode-sourcemaps: fixed ${fixed} source map(s)`);
