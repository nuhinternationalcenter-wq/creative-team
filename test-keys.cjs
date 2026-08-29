function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  let keys1 = Object.keys(obj1).filter(k => obj1[k] !== undefined);
  let keys2 = Object.keys(obj2).filter(k => obj2[k] !== undefined);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
console.log(deepEqual({ a: 1, b: undefined }, { a: 1 }));
