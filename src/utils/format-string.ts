export function formatCodeVINM(code: number) {
  if (code < 10) {
    return `VINM_00${code}`;
  } else if (code < 100) {
    return `VINM_0${code}`;
  } else {
    return `VINM_${code}`;
  }
}
