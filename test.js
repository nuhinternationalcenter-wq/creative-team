const assert = require('assert');
const a = { a: 1, b: undefined };
const b = { a: 1 };
console.log(JSON.stringify(a) === JSON.stringify(b));
