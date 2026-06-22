const fs = require('fs');
const path = require('path');
const https = require('https');

const foods = [
  { id: '1', keyword: 'dosa,food' },
  { id: '2', keyword: 'idli,food' },
  { id: '3', keyword: 'poha,food' },
  { id: '4', keyword: 'thali,food' },
  { id: '5', keyword: 'biryani,food' },
  { id: '6', keyword: 'friedrice,food' },
  { id: '7', keyword: 'samosa,food' },
  { id: '8', keyword: 'pavbhaji,food' },
  { id: '9', keyword: 'pakora,food' },
  { id: '10', keyword: 'chai,tea' },
  { id: '11', keyword: 'coldcoffee,drink' },
  { id: '12', keyword: 'limesoda,drink' },
  { id: '13', keyword: 'gulabjamun,sweet' },
  { id: '14', keyword: 'noodles,food' },
  { id: '15', keyword: 'chickennoodles,food' }
];

const destDir = path.join(__dirname, '../frontend/public/images');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

async function download(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return download(redirectUrl, filename).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed to download: ' + res.statusCode));
      }
      const file = fs.createWriteStream(filename);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function run() {
  for (const item of foods) {
    console.log(`Downloading ${item.keyword}...`);
    try {
      await download(`https://loremflickr.com/500/400/${item.keyword}`, path.join(destDir, `food_${item.id}.jpg`));
    } catch (e) { console.error(e.message); }
  }
  console.log('Done!');
}

run();
