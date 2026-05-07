const fs = require('fs');
const content = fs.readFileSync('components/itinerary-builder/index.tsx', 'utf8');

const lines = content.split('\n');
let stack = [];
lines.forEach((line, index) => {
  // Regex for opening tags that are NOT self-closing
  // This is tricky with regex. Let's just find all <div and subtract those that have />
  
  const allOpens = line.match(/<div/g) || [];
  const selfCloses = line.match(/<div[^>]*\/>/g) || [];
  const closes = line.match(/<\/div/g) || [];
  
  for (let i = 0; i < allOpens.length - selfCloses.length; i++) {
    stack.push(index + 1);
  }
  
  closes.forEach(() => {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(`Extra closing div at line ${index + 1}`);
    }
  });
});

console.log(`Unclosed divs at lines: ${stack.join(', ')}`);
console.log(`Remaining open count: ${stack.length}`);
