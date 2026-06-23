export interface Product {
  id: string;
  name: string;
  nameMl: string;
  category: "groceries" | "vegetables" | "sabari";
  price: number; // Current selling price (adjusted for subsidy if isSubsidy)
  mrp: number; // Typical market price
  isSubsidy: boolean;
  unit: string;
  aisle: string;
  image: string;
  inStock: boolean;
  description?: string;
  subCategory?: string;
}

export interface Offer {
  id: string;
  productId: string;
  campaignName: string;
  offerPrice: number;
  isActive: boolean;
  expiresAt?: string | null;
  startsAt?: string | null;
  associatedTeam?: string; // e.g. "Brazil" for soccer discounts
  storeId?: string; // target store
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  addressLine1: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  activeStoreId: string;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "vintage";
  language: "english" | "malayalam" | "bilingual";
  rationCardNumber?: string;
  rationCardType?: "AAY" | "PHH" | "NPS" | "NPNS";
}

export interface StoreLocation {
  id: string;
  name: string;
  nameMl: string;
  location: string;
  locationMl: string;
  type: string;
}

export type AppTab =
  | "loading"
  | "login"
  | "register"
  | "home"
  | "groceries"
  | "vegetables"
  | "sabari"
  | "cart"
  | "profile"
  | "settings"
  | "ai-saver"
  | "admin";
