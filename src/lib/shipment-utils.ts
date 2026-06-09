export const STATUSES = [
  "Booked",
  "Picked Up",
  "At Origin Airport",
  "In Transit",
  "At Destination Airport",
  "Out for Delivery",
  "Delivered",
] as const;

export type ShipmentStatus = (typeof STATUSES)[number];

export function statusIndex(s: string): number {
  return STATUSES.indexOf(s as ShipmentStatus);
}

export function generateAwb(): string {
  // 3-digit airline prefix + 8-digit serial, e.g. 297-12345678
  const prefix = String(Math.floor(100 + Math.random() * 899));
  const serial = String(Math.floor(10_000_000 + Math.random() * 89_999_999));
  return `${prefix}-${serial}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
