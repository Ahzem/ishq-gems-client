/**
 * Gem form types and interfaces
 */
import type { JobProgress } from '../api/responses'

// ============================================================================
// Add Gem Form Types
// ============================================================================

export interface AddGemFormData {
  // Step 1: Lab Report
  labReport: File | null
  
  // Step 2: Gem Information
  reportNumber: string
  labName: string
  gemType: string
  variety: string
  weight: { value: number, unit: string }
  dimensions: { length: string, width: string, height: string, unit: string }
  shapeCut: string
  color: string
  clarity: string
  origin: string
  treatments: string
  certificateDate: string
  additionalComments: string
  
  // Listing Information
  listingType: 'direct-sale' | 'auction' | ''
  price: string
  reservePrice: string
  startingBid: string
  auctionDuration: string
  shippingMethod: 'seller-fulfilled' | 'ishq-gems-logistics' | 'in-person-via-ishq-gems'
  
  // Advanced fields (initially hidden)
  showAdvanced: boolean
  // Certificate Details
  fluorescence: string
  fluorescenceColor: string
  polish: string
  symmetry: string
  girdle: string
  culet: string
  depth: string
  table: string
  crownAngle: string
  pavilionAngle: string
  crownHeight: string
  pavilionDepth: string
  starLength: string
  lowerHalf: string
  
  // Market Information
  pricePerCarat: string
  marketTrend: string
  investmentGrade: string
  rapnetPrice: string
  discount: string
  
  // Additional Details
  laserInscription: string
  memo: boolean
  consignment: boolean
  stockNumber: string
  
  // Step 3: Media
  images: File[]
  videos: File[]
  
  // Step 4: Final
  confirmAccuracy: boolean
}

export interface AddGemFormProps {
  isAdmin?: boolean
  isEditMode?: boolean
  editGemId?: string
  initialData?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  onEditSuccess?: () => void
}

export interface AddGemFormStep {
  id: number
  title: string
  icon: any // eslint-disable-line @typescript-eslint/no-explicit-any
  description: string
}

export interface BackgroundJob {
  jobId: string
  gemType: string
  reportNumber: string
  progress: JobProgress
  startTime: number
}

export interface ToastNotification {
  message: string
  type: 'success' | 'error' | 'info'
}

export interface ExistingMedia {
  _id: string
  type: 'image' | 'video' | 'lab-report'
  url: string
  isPrimary: boolean
  order: number
  filename?: string
  fileSize?: number
}

// ============================================================================
// Upload Components Types
// ============================================================================

export interface UploadGalleryProps {
  images: File[]
  videos: File[]
  onImagesChange: (images: File[]) => void
  onVideosChange: (videos: File[]) => void
}

export interface EditMediaGalleryProps {
  existingImages: ExistingMedia[]
  existingVideos: ExistingMedia[]
  existingLabReport?: ExistingMedia
  newImages: File[]
  newVideos: File[]
  onNewImagesChange: (images: File[]) => void
  onNewVideosChange: (videos: File[]) => void
  onExistingMediaDelete: (mediaId: string, type: 'image' | 'video' | 'lab-report') => void
}

export interface StoredLabReport {
  url: string
  filename: string
  s3Key: string
  uploadedAt: number
  fileSize: number
  fileType: string
}

export interface UploadLabReportProps {
  labReport: File | null
  onLabReportChange: (file: File | null) => void
  isLoadingStoredReport?: boolean
  storedReportInfo?: StoredLabReport | null
  onNewFileSelected?: () => Promise<void>
}
