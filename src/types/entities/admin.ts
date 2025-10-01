
/**
 * Admin-specific seller application interface
 */
export interface AdminSellerApplication {
  _id: string
  fullName: string
  email: string
  phone: string
  nicNumber: string
  dateOfBirth?: string
  hasNGJALicense: boolean
  ngjaLicenseNumber?: string
  yearsOfExperience: string
  gemstoneTypes: string[]
  preferredLanguage: string
  whyJoin: string
  status: 'pending' | 'verified' | 'rejected'
  applicationDate: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  videoCallCompleted?: boolean
  videoCallVerified: boolean
  accountCreated: boolean
  applicationMode?: 'new' | 'buyer-upgrade'
  // Document URLs
  nicFrontUrl: string
  nicBackUrl: string
  ngjaLicenseUrl?: string
  sampleCertificateUrl?: string
}

/**
 * Admin-specific seller user interface
 */
export interface AdminSellerUser {
  _id: string
  fullName: string
  email: string
  phone?: string
  avatar?: string
  role: 'seller'
  isActive: boolean
  isBlocked: boolean
  sellerVerified: boolean
  sellerVerifiedAt?: string
  yearsOfExperience?: string
  gemstoneTypes?: string[]
  hasNGJALicense?: boolean
  preferredLanguage?: string
  createdAt: string
  lastLoginAt?: string
  // Seller metrics
  totalListings: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  responseRate: number
  // Flags
  hasActiveViolations: boolean
  violationCount: number
  lastViolationDate?: string
}

/**
 * Admin-specific buyer user interface
 */
export interface AdminBuyerUser {
  _id: string
  fullName: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  status: 'active' | 'suspended' | 'banned'
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  // Buyer metrics
  totalOrders: number
  totalSpent: number
  wishlistItems: number
  lastOrderDate?: string
  // Flags
  hasActiveViolations: boolean
  violationCount: number
  lastViolationDate?: string
}

/**
 * Admin dashboard statistics interface
 */
export interface AdminDashboardStats {
  overview: {
    totalUsers: number
    totalSellers: number
    totalBuyers: number
    activeUsers: number
    pendingVerifications: number
    totalListings: number
    activeListings: number
    publishedListings: number
    pendingListings: number
    totalOrders: number
    monthlyOrders: number
    platformRevenue: number
    monthlyRevenue: number
    reportedListings: number
    pendingPaymentReceipts: number
    orderGrowthRate: number
  }
  recentActivity: {
    newUsersThisWeek: number
    newApplicationsThisWeek: number
    newListingsThisWeek: number
    ordersThisWeek: number
  }
  trends: {
    userGrowth: number
    sellerGrowth: number
    listingGrowth: number
    orderGrowth: number
  }
}

/**
 * Admin recent activity interface
 */
export interface AdminRecentActivity {
  id: string
  type: string
  message: string
  time: string
  icon: string
  color: string
  metadata?: Record<string, unknown>
}

/**
 * Admin buyer statistics interface
 */
export interface AdminBuyerStats {
  totalBuyers: number
  activeBuyers: number
  suspendedBuyers: number
  bannedBuyers: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  newBuyersThisMonth: number
}

/**
 * Admin flagged review interface
 */
export interface AdminFlaggedReview {
  _id: string
  rating: number
  comment: string
  reviewerName: string
  reviewerEmail: string
  gemId: string
  gemName: string
  createdAt: string
  flaggedAt?: string
  flaggedBy?: string
  flaggedReason?: string
  status: 'flagged' | 'resolved' | 'approved' | 'rejected'
  resolvedAt?: string
  resolvedBy?: string
}

/**
 * Admin flagged reviews statistics interface
 */
export interface AdminFlaggedReviewsStats {
  pending: number
  approved: number
  rejected: number
  avgResponseTimeHours: number
}
