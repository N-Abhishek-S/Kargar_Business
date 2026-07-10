const fs = require('fs');
const css = fs.readFileSync('src/styles/index.css', 'utf8');
const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
let count = 0;
let lines = stripped.split('\n');
for (let i = 0; i < lines.length; i++) {
  for (let char of lines[i]) {
    if (char === '{') count++;
    if (char === '}') count--;
  }
  if (count < 0) {
    console.log('Extra closing brace at line', i + 1);
    break;
  }
}
if (count > 0) console.log('Missing closing brace(s)', count);
else if (count === 0) console.log('Braces are balanced');
