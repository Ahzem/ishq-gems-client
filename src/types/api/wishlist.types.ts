// Wishlist API Response Types
// These types match the actual API response structure from the backend

export interface WishlistApiGemSeller {
  id: string;
  storeSettings?: {
    storeName: string;
    storeSlogan?: string;
    storeDescription?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
  };
}

export interface WishlistApiGem {
  id: string;
  title?: string;
  description?: string;
  price: number;
  images: string[];
  category?: string;
  seller: WishlistApiGemSeller;
  createdAt: string;
  // Additional gem properties that might be present
  variety?: string;
  gemType?: string;
  color?: string;
  clarity?: string;
  shapeCut?: string;
  treatments?: string;
  origin?: string;
  weight?: {
    value: number;
    unit: string;
  };
  investmentGrade?: string;
  labName?: string;
}

export interface WishlistApiItem {
  id: string;
  gemId: string;
  gem: WishlistApiGem;
  dateAdded: string;
  createdAt: string;
}

export interface WishlistApiPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface WishlistApiResponse {
  success: boolean;
  message: string;
  data: {
    items: WishlistApiItem[];
    pagination: WishlistApiPagination;
  };
}

// Toggle response type
export interface WishlistToggleApiResponse {
  success: boolean;
  message: string;
  data: {
    action: 'added' | 'removed';
    inWishlist: boolean;
    gemId: string;
    item?: WishlistApiItem;
  };
}
