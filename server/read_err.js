import fs from 'fs';
try {
  const content = fs.readFileSync('error.log', 'utf8');
  console.log('--- ERROR LOG HEAD ---');
  console.log(content.substring(0, 500));
  console.log('--- ERROR LOG TAIL ---');
  console.log(content.slice(-2000));
} catch(e) { console.error(e); }
