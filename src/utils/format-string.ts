export function formatCodeVINM(code: number) {
  if (code < 10) {
    return `VINM_00${code}`;
  } else if (code < 100) {
    return `VINM_0${code}`;
  } else {
    return `VINM_${code}`;
  }
}

export function formatNumericId(id: number, maxPrefixLength: number = 2) {
  // Convert id to string
  const idString = id.toString();

  // Calculate how many zeros to add
  const zerosToAdd = Math.max(0, maxPrefixLength - idString.length);

  // Create a string with the required number of zeros
  const zeros = '0'.repeat(zerosToAdd);

  // Return the formatted string
  return `${zeros}${id}`;
}
