const fs = require('fs');
let c = fs.readFileSync('seed.js', 'utf8');
let id = 1;
c = c.replace(/imageUrl: 'https:\/\/images\.unsplash\.com[^']+'/g, () => `imageUrl: '/images/food_${id++}.jpg'`);
fs.writeFileSync('seed.js', c);
console.log('Seed updated!');
