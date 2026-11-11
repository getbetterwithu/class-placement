const fs = require('fs');
const path = require('path');

const repoDir = path.dirname(__dirname);
const html = fs.readFileSync(path.join(repoDir, 'index.html'), 'utf8');

// Check that new functions and elements exist
const checks = [
  'loadSampleDemo',
  'executeAssignment',
  'balanceGender',
  'EMBEDDED_SAMPLE_STUDENTS',
  'EMBEDDED_SAMPLE_SEPARATIONS',
  '학생데이터_샘플.xlsx',
  '분리대상_샘플.xlsx',
  '신학번Str',
  'BOMB_IMAGE',
  'schoolType',
  'genderMode',
  'idFormat',
  'downloadOfflineHtml'
];

checks.forEach(str => {
  if (!html.includes(str)) {
    throw new Error('Missing check: ' + str);
  }
});

console.log(`All ${checks.length} check keywords verified in index.html!`);

// Validate structure: DOCTYPE, html, head, body tags
if (!html.startsWith('<!DOCTYPE html>')) throw new Error('Missing DOCTYPE');
if (!html.includes('</html>')) throw new Error('Missing closing html tag');
console.log('HTML structure verified successfully!');
