export function formatVenezuelanPhone(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/[^\d]/g, '');

  // Must start with +58 and be exactly 13 digits: +58 + 10 digits
  if (!digits.startsWith('58') || digits.length !== 12 && digits.length !== 13) {
    return phone; // fallback if malformed
  }

  // Remove the '+' if present
  const raw = digits.startsWith('58') ? digits : digits.slice(1);

  // Extract parts
  const country = '+58';
  const area = raw.slice(2, 5);       // 412, 414, etc.
  const part1 = raw.slice(5, 8);      // 341
  const part2 = raw.slice(8, 10);     // 21
  const part3 = raw.slice(10, 12);    // 01

  return `${country} ${area} ${part1} ${part2} ${part3}`;
}

export function convertToLocalVenezuelanFormat(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');

  if (!digits.startsWith('58') || digits.length !== 12) {
    return phone; // fallback
  }

  // Replace +58 → 0
  return '0' + digits.slice(2); // "04123412101"
}


export function formatLocalVenezuelanPhone(phone: string): string {
  const local = convertToLocalVenezuelanFormat(phone); // → 04123412101
  const digits = local.replace(/[^\d]/g, '');


  if (digits.length !== 11) return local;

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
}
