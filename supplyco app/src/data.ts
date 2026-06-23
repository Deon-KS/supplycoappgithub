import { Product, StoreLocation, UserProfile } from "./types";

export const STORES: StoreLocation[] = [
  {
    id: "tvm_eastfort",
    name: "Supplyco Supermarket, East Fort",
    nameMl: "ഈസ്റ്റ് ഫോർട്ട് സൂപ്പർമാർക്കറ്റ്, തിരുവനന്തപുരം",
    location: "Trivandrum",
    locationMl: "തിരുവനന്തപുരം",
    type: "Supermarket"
  },
  {
    id: "ekm_mgroad",
    name: "Maveli Store, MG Road, Ernakulam",
    nameMl: "മാവേലി സ്റ്റോർ, എം.ജി റോഡ്, എറണാകുളം",
    location: "Ernakulam",
    locationMl: "എറണാകുളം",
    type: "Maveli Store"
  },
  {
    id: "kzk_palayam",
    name: "Palayam Hypermarket, Kozhikode",
    nameMl: "പാളയം ഹൈപ്പർമാർക്കറ്റ്, കോഴിക്കോട്",
    location: "Kozhikode",
    locationMl: "കോഴിക്കോട്",
    type: "Hypermarket"
  },
  {
    id: "tsr_round",
    name: "Swaraj Round Outlet, Thrissur",
    nameMl: "സ്വരാജ് റൗണ്ട് ഔട്ട്ലെറ്റ്, തൃശൂർ",
    location: "Thrissur",
    locationMl: "തൃശൂർ",
    type: "Sovereign Outlet"
  }
];

export const INITIAL_USER: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  addressLine1: "",
  city: "",
  district: "",
  state: "Kerala",
  pincode: "",
  isVerified: true,
  activeStoreId: "tvm_eastfort",
  notificationsEnabled: true,
  theme: "vintage",
  language: "bilingual",
  rationCardNumber: "",
  rationCardType: "PHH"
};

