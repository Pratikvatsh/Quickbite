const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\prati\\.gemini\\antigravity\\brain\\b62057fb-ca44-4abf-8b7b-da5feeeb5135';
const destDir = 'c:\\Users\\prati\\Desktop\\SEPM\\frontend\\public\\images';

const files = fs.readdirSync(srcDir).filter(f => f.startsWith('food_') && f.endsWith('.png'));

for (const file of files) {
  const match = file.match(/^food_(\d+)_/);
  if (match) {
    const id = match[1];
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, `food_${id}.png`));
    console.log(`Copied ${file} to food_${id}.png`);
  }
}

// Update seed.js to use .png
let seedContent = fs.readFileSync('seed.js', 'utf8');
seedContent = seedContent.replace(/\/images\/food_(\d+)\.jpg/g, '/images/food_$1.png');
fs.writeFileSync('seed.js', seedContent);
console.log('Seed updated to use .png extensions');
