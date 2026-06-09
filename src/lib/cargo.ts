// Cargo / freight calculation helpers
export function volumetricWeight(lengthCm?: number | null, widthCm?: number | null, heightCm?: number | null): number {
  if (!lengthCm || !widthCm || !heightCm) return 0;
  return (lengthCm * widthCm * heightCm) / 6000;
}

export function chargeableWeight(actualKg?: number | null, lengthCm?: number | null, widthCm?: number | null, heightCm?: number | null): number {
  const vol = volumetricWeight(lengthCm, widthCm, heightCm);
  const actual = actualKg ?? 0;
  return Math.max(actual, vol);
}

// Indian number-to-words for invoice amount-in-words
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? " " + ones[o] : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = "";
  if (h) s += ones[h] + " Hundred";
  if (r) s += (s ? " " : "") + twoDigits(r);
  return s;
}

export function amountInWordsINR(amount: number): string {
  if (amount === 0) return "Zero Rupees Only";
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let n = rupees;
  let words = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) words += twoDigits(crore) + " Crore ";
  if (lakh) words += twoDigits(lakh) + " Lakh ";
  if (thousand) words += twoDigits(thousand) + " Thousand ";
  if (n) words += threeDigits(n);
  words = words.trim() + " Rupees";
  if (paise) words += " and " + twoDigits(paise) + " Paise";
  return words + " Only";
}
