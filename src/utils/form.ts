// export function getChangedFields(newData: any, originalData: any) {
//   const changes: Record<string, { old: any; new: any }> = {};
//
//   for (const key in newData) {
//     if (newData[key] !== originalData[key]) {
//       changes[key] = {
//         old: originalData[key],
//         new: newData[key],
//       };
//     }
//   }
//
//   return changes;
// }


function areEqual(a: any, b: any): boolean {
  // Handle numbers in string form (e.g., "2500.00" vs 2500)
  if (!isNaN(Number(a)) && !isNaN(Number(b))) {
    return Number(a) === Number(b);
  }

  // Handle arrays (shallow compare)
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((item, index) => item === b[index])
    );
  }

  // Handle objects (optional: deep compare)
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // Fallback
  return a === b;
}

export function getChangedFields(newData: any, originalData: any) {
  const changes: Record<string, { old: any; new: any }> = {};

  for (const key in newData) {
    if (!areEqual(newData[key], originalData[key])) {
      changes[key] = {
        old: originalData[key],
        new: newData[key],
      };
    }
  }

  return changes;
}
