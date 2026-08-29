const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

const newDeepEqual = `
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 === 'string' && typeof obj2 === 'string') {
    if (obj1.startsWith('data:image/') && obj1.length > 200000 && obj2 === '[Large Base64 Image Omitted for Firestore]') return true;
    if (obj2.startsWith('data:image/') && obj2.length > 200000 && obj1 === '[Large Base64 Image Omitted for Firestore]') return true;
  }
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  let keys1 = Object.keys(obj1).filter(k => obj1[k] !== undefined);
  let keys2 = Object.keys(obj2).filter(k => obj2[k] !== undefined);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
`;

code = code.replace(/function deepEqual[\s\S]*?return true;\n}/, newDeepEqual.trim());

fs.writeFileSync('src/context/WorkContext.tsx', code);
