/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  ratePerNight: number;
  maxGuests: number;
  sizeSquareMeter: number;
  amenities: string[];
  imageUrl: string;
  roomNumbers?: string[];
  isBundle?: boolean; // true = ratePerNight covers all roomNumbers together
}

export interface Experience {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: string;
  category: "adventure" | "dining" | "wellness" | "leisure";
  highlight: string;
  imageUrl: string;
}

export interface SpecialPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  durationDays: number;
  discountPercentage: number;
  includedExperiences: string[];
  costMultiplier: number;
}

export interface Booking {
  id: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  guestsText: string;
  nightsNum: number;
  totalCost: number;
  createdTime: string;
  status: "Confirmed" | "Completed" | "Pending" | "Cancelled";
  selectedExperiences: Experience[];
  specialRequests?: string;
  billingName: string;
  billingEmail: string;
  firstName: string;
  lastName: string;
  countryRegion: string;
  city?: string;
  phonePrefix?: string;
  phoneNumber?: string;
  paperlessConfirmation?: boolean;
  bookingForSelf?: boolean;
  workTrip?: boolean;
  cotRequested?: boolean;
  extraBedRequested?: boolean;
  extraBedCount?: number;
  extraBedRate?: number;
  extraBedTotal?: number;
  arrivalTime?: string;
  assignedRooms?: string[];
  roomsBooked?: number;
  paymentMode?: "advance" | "full";
  advanceAmount?: number;
  remainingAmount?: number;
  paymentProofRef?: string;
  paymentProofAmount?: number;
  paymentProofDateTime?: string;
  paymentProofSubmitted?: boolean;
  paymentVerified?: boolean;
}
