const fs = require("fs");
const path = require("path");

function moveRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
      moveRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    // Si el archivo ya existe, lo sobrescribimos (js sobreescribe? no debería haber conflicto si json esta en dest y js en src)
    // Pero si hay conflicto, mejor loguearlo
    if (fs.existsSync(dest)) {
      console.warn(`Warning: Overwriting ${dest}`);
    }
    fs.renameSync(src, dest);
  }
}

const distSrc = path.join(__dirname, "../dist/src");
const distRoot = path.join(__dirname, "../dist");

if (fs.existsSync(distSrc)) {
  console.log("Detected dist/src, merging into dist...");
  try {
    moveRecursive(distSrc, distRoot);
    console.log("Merge complete. Cleaning up dist/src...");
    fs.rmSync(distSrc, { recursive: true, force: true });
    console.log("Cleanup done.");
  } catch (error) {
    console.error("Error during postbuild merge:", error);
    process.exit(1);
  }
} else {
  console.log("No dist/src detected, skipping merge.");
}
