const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Fix ReviewCard.tsx specifically for the ESLint || vs ?? issue
  if (filePath.endsWith('ReviewCard.tsx')) {
    content = content.replace(
      /fallbackInitials=\{getInitials\(review\.companyName \|\| review\.customerName\)\}/g,
      'fallbackInitials={getInitials(review.companyName ? review.companyName : review.customerName)}'
    );
    content = content.replace(
      /src=\{review\.companyLogo \|\| ''\}/g,
      "src={review.companyLogo ? review.companyLogo : ''}"
    );
  }

  // 2. Fix canonical tailwind syntax: [var(--xxx)] -> (--xxx)
  // Except for specific known standard tailwind classes
  content = content.replace(/rounded-\[var\(--radius-2xl\)\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[var\(--radius-xl\)\]/g, 'rounded-xl');
  
  // General fallback for all other [var(--name)]
  content = content.replace(/\[var\(--([a-zA-Z0-9-]+)\)\]/g, '(--$1)');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
