import { Product, Offer } from "../types";

export interface SoccerTeamState {
  teamName: string;
  goals: number;
  isKnockedOut: boolean;
  matchEnded: boolean;
  nextMatchKickedOff: boolean;
}

export const INITIAL_SOCCER_TEAMS: SoccerTeamState[] = [
  { teamName: "Argentina", goals: 3, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Brazil", goals: 2, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Germany", goals: 4, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "France", goals: 1, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "England", goals: 2, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Spain", goals: 5, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Portugal", goals: 0, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Netherlands", goals: 2, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Belgium", goals: 1, isKnockedOut: true, matchEnded: true, nextMatchKickedOff: false },
  { teamName: "Croatia", goals: 3, isKnockedOut: false, matchEnded: false, nextMatchKickedOff: false },
  { teamName: "Morocco", goals: 2, isKnockedOut: false, matchEnded: true, nextMatchKickedOff: true },
];

export function getSoccerTeamDiscount(team: SoccerTeamState): number {
  if (team.isKnockedOut) return 0;
  if (!team.matchEnded) return 0;
  if (team.nextMatchKickedOff) return 0;
  return team.goals;
}

export interface CalculatedPrice {
  realMrp: number;
  supplycoMrp: number;
  offerPrice: number;
  isOfferActive: boolean;
  baseActivePrice: number;
  soccerDiscountPct: number;
  soccerDiscountAmt: number;
  finalPrice: number;
  savings: number;
  isExpired: boolean;
  offerExpiresAt: string | null;
  supplycoDeduction: number;
  specialOfferDiscount: number;
  finalNet: number;
}

export function calculateProductPrice(
  product: Product,
  offers: Offer[] = [],
  soccerTeams: SoccerTeamState[] = INITIAL_SOCCER_TEAMS
): CalculatedPrice {
  const realMrp = product.mrp ?? 0;
  const supplycoMrp = product.price ?? 0;
  const supplycoDeduction = Math.max(0, realMrp - supplycoMrp);

  const activeOffer = offers.find(o => o.productId === product.id && o.isActive);

  let isExpired = false;
  if (activeOffer && activeOffer.expiresAt) {
    try {
      const expirationDate = new Date(activeOffer.expiresAt);
      isExpired = expirationDate.getTime() < Date.now();
    } catch {
      isExpired = false;
    }
  }

  let isNotStartedYet = false;
  if (activeOffer && activeOffer.startsAt) {
    try {
      const startDate = new Date(activeOffer.startsAt);
      isNotStartedYet = startDate.getTime() > Date.now();
    } catch {
      isNotStartedYet = false;
    }
  }

  const isOfferActive = !!activeOffer && !isExpired && !isNotStartedYet && activeOffer.offerPrice > 0;
  const baseActivePrice = isOfferActive ? activeOffer.offerPrice : supplycoMrp;

  let soccerDiscountPct = 0;
  if (product.category === "sabari" && activeOffer && activeOffer.campaignName === "Soccer Eleven" && activeOffer.associatedTeam) {
    const matchedTeam = soccerTeams.find(
      (t) => t.teamName.toLowerCase() === activeOffer.associatedTeam?.toLowerCase()
    );
    if (matchedTeam) {
      const baseDiscount = getSoccerTeamDiscount(matchedTeam);
      if (matchedTeam.teamName.toLowerCase() === "brazil" && product.id === "sab_tea") {
        soccerDiscountPct = baseDiscount * 2;
      } else {
        soccerDiscountPct = baseDiscount;
      }
    }
  }

  const soccerDiscountAmt = baseActivePrice * (soccerDiscountPct / 100);
  const specialOfferDiscount = (supplycoMrp - baseActivePrice) + soccerDiscountAmt;
  const offerPrice = Math.max(0, supplycoMrp - specialOfferDiscount);

  const finalNet = offerPrice;
  const finalPrice = finalNet;
  const savings = Math.max(0, realMrp - finalPrice);

  return {
    realMrp,
    supplycoMrp,
    offerPrice,
    isOfferActive,
    baseActivePrice,
    soccerDiscountPct,
    soccerDiscountAmt,
    finalPrice,
    savings,
    isExpired,
    offerExpiresAt: activeOffer ? activeOffer.expiresAt : null,
    supplycoDeduction,
    specialOfferDiscount,
    finalNet
  };
}
