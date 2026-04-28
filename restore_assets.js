import fs from 'fs';
import path from 'path';

const optimizedDir = 'public/assets/optimized';
const assetsDir = 'public/assets';

function moveFiles(sourceDir, targetDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      moveFiles(sourcePath, targetPath);
    } else {
      console.log(`Replacing ${targetPath}...`);
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

console.log('Replacing originals with optimized versions...');
moveFiles(optimizedDir, assetsDir);
console.log('Complete. Cleaning up...');
// Note: I won't delete the optimized dir yet just in case, but I'll remove the script later.
