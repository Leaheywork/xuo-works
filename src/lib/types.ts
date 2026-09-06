export type ObjectStatus = "available" | "in_bidding" | "sold";

export interface XuoObject {
  id: string;
  title: string;
  price: number;
  materials: string;
  dimensions: string;
  weightKg: number;
  year: number;
  description: string;
  status: ObjectStatus;
  images: string[];
  currentBid?: number;
  bidCount?: number;
  hoursLeft?: number;
}
