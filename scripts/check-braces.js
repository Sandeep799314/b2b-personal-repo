const fs = require('fs');
const content = fs.readFileSync('components/itinerary-builder/index.tsx', 'utf8');

const returnStart = content.indexOf('return (');
const returnContent = content.slice(returnStart);

let stack = [];
let inString = null;

for (let i = 0; i < returnContent.length; i++) {
  const char = returnContent[i];
  const nextChar = returnContent[i+1];
  
  if (inString) {
    if (char === inString) inString = null;
    continue;
  }
  
  if (char === '"' || char === "'" || char === '`') {
    inString = char;
    continue;
  }
  
  if (char === '{') {
    stack.push(i);
  } else if (char === '}') {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(`Extra closing brace at position ${i}`);
    }
  }
}

console.log(`Remaining open braces count: ${stack.length}`);
if (stack.length > 0) {
  stack.forEach(pos => {
    const line = returnContent.slice(0, pos).split('\n').length;
    console.log(`Unclosed brace at line ${line + returnContent.slice(0, returnStart).split('\n').length - 1}`);
  });
}
