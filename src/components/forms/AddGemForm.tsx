'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, FileText, Gem, Camera, ClipboardCheck, AlertCircle, Star, RefreshCw, HelpCircle, ExternalLink, MoveRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import UploadLabReport from './UploadLabReport'
import UploadGallery from './UploadGallery'
import EditMediaGallery from './EditMediaGallery'
import SearchableSelect from './SearchableSelect'
import Tooltip from '@/components/common/Tooltip'
import gemService from '@/services/gem.service'
import adminGemService from '@/services/admin-gem.service'
import type { GemMetadata } from '@/types/entities/gem'
import type { 
  AddGemFormData, 
  AddGemFormProps, 
  AddGemFormStep, 
  BackgroundJob, 
  ToastNotification,
  StoredLabReport 
} from '@/types'
import useLabReportStorage from '@/hooks/useLabReportStorage'
import UploadProgress from '@/components/loading/UploadProgress'
import { environment } from '@/config/environment'
import {
  GEM_TYPES,
  GEM_VARIETIES,
  SHAPE_CUT_OPTIONS,
  COLOR_OPTIONS,
  CLARITY_GRADES,
  ORIGIN_OPTIONS,
  TREATMENT_OPTIONS,
  LAB_NAMES,
  INVESTMENT_GRADES,
  MARKET_TRENDS,
  FLUORESCENCE_INTENSITIES,
  FLUORESCENCE_COLORS,
  POLISH_SYMMETRY_GRADES
} from '@/constants/gem-options'
import { intelligentlyMatchGemData } from '@/utils/intelligent-gem-matcher'

const initialFormData: AddGemFormData = {
  labReport: null,
  reportNumber: '',
  labName: '',
  gemType: '',
  variety: '',
  weight: { value: 0, unit: 'ct' },
  dimensions: { length: '', width: '', height: '', unit: 'mm' },
  shapeCut: '',
  color: '',
  clarity: '',
  origin: '',
  treatments: '',
  certificateDate: '',
  additionalComments: '',
  listingType: '',
  price: '',
  reservePrice: '',
  startingBid: '',
  auctionDuration: '',
  shippingMethod: 'seller-fulfilled',
  showAdvanced: false,
  // Certificate Details
  fluorescence: '',
  fluorescenceColor: '',
  polish: '',
  symmetry: '',
  girdle: '',
  culet: '',
  depth: '',
  table: '',
  crownAngle: '',
  pavilionAngle: '',
  crownHeight: '',
  pavilionDepth: '',
  starLength: '',
  lowerHalf: '',
  // Market Information
  pricePerCarat: '',
  marketTrend: '',
  investmentGrade: '',
  rapnetPrice: '',
  discount: '',
  // Additional Details
  laserInscription: '',
  memo: false,
  consignment: false,
  stockNumber: '',
  images: [],
  videos: [],
  confirmAccuracy: false
}

const steps: AddGemFormStep[] = [
  { id: 1, title: 'Lab Certificate', icon: FileText, description: 'Upload your lab certificate' },
  { id: 2, title: 'Gem Details', icon: Gem, description: 'Enter gemstone information' },
  { id: 3, title: 'Media Upload', icon: Camera, description: 'Add photos and videos' },
  { id: 4, title: 'Review & Submit', icon: ClipboardCheck, description: 'Final review and submission' }
]

// Using imported constants from gem-options.ts
const auctionDurations = ['3 days', '5 days', '7 days', '10 days', '14 days']
const shippingMethods = [
  { value: 'seller-fulfilled', label: 'Seller Fulfilled' },
  { value: 'ishq-gems-logistics', label: 'Ishq Gems Logistics' },
  { value: 'in-person-via-ishq-gems', label: 'In-Person via Ishq Gems' }
]

// Use centralized interface - already imported

export default function AddGemForm({ 
  isAdmin = false, 
  isEditMode = false, 
  editGemId, 
  initialData, 
  onEditSuccess 
}: AddGemFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AddGemFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Async submission states
  const [useAsyncSubmission, setUseAsyncSubmission] = useState(true) // Enable async by default
  
  // Lab report extraction states
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState(false)
  const [extractedData, setExtractedData] = useState<GemMetadata | null>(null)

  // Background progress tracking for multiple concurrent uploads
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>([])

  // Toast notification state
  const [toast, setToast] = useState<ToastNotification | null>(null)

  // Edit mode states for existing media
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingImages, setExistingImages] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingVideos, setExistingVideos] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingLabReport, setExistingLabReport] = useState<any>(null)
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([])

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)

  // localStorage for lab report persistence
  const { storedLabReport, saveLabReport, clearLabReport, isExpired } = useLabReportStorage()
  const [isLoadingStoredReport, setIsLoadingStoredReport] = useState(false)
  const [hasAutoTriggeredOCR, setHasAutoTriggeredOCR] = useState(false)

  const updateFormData = useCallback((updates: Partial<AddGemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  // Show enhanced toast with progress for background jobs
  const showToast = (message: string, type: 'success' | 'error' | 'info', duration = 4000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }

  // Add background job tracking
  const addBackgroundJob = (jobId: string, gemType: string, reportNumber: string) => {
    const newJob = {
      jobId,
      gemType,
      reportNumber,
      progress: {
        jobId,
        status: 'pending' as const,
        progress: 0,
        message: 'Starting processing...',
        steps: {
          validating: false,
          creatingGem: false,
          processingMedia: false,
          finalizing: false
        }
      },
      startTime: Date.now()
    }
    setBackgroundJobs(prev => [...prev, newJob])
    
    // Start polling for this job
    pollBackgroundJob(jobId, gemType, reportNumber)
  }

  // Poll background job progress
  const pollBackgroundJob = async (jobId: string, gemType: string, reportNumber: string) => {
    try {
      const finalProgress = await gemService.pollJobStatus(
        jobId,
        (progress) => {
          setBackgroundJobs(prev => prev.map(job => 
            job.jobId === jobId ? { ...job, progress } : job
          ))
          
          // Show progress toasts for major milestones
          if (progress.progress === 30) {
            showToast(`${gemType} (${reportNumber}): Creating gem record...`, 'info', 2000)
          } else if (progress.progress === 70) {
            showToast(`${gemType} (${reportNumber}): Processing media...`, 'info', 2000)
          }
        },
        2000, // Poll every 2 seconds
        300000 // 5 minute timeout
      )
      
      if (finalProgress.status === 'completed') {
        // Remove from background jobs
        setBackgroundJobs(prev => prev.filter(job => job.jobId !== jobId))
        
        // Show success toast
        showToast(`✨ ${gemType} (${reportNumber}) added successfully! Check your listings.`, 'success', 6000)
        
      } else if (finalProgress.status === 'failed') {
        // Keep failed job visible with error state
        setBackgroundJobs(prev => prev.map(job => 
          job.jobId === jobId ? { ...job, progress: finalProgress } : job
        ))
        
        showToast(`❌ Failed to process ${gemType} (${reportNumber}): ${finalProgress.error}`, 'error', 8000)
      }
    } catch (error) {
      console.error('Background job polling error:', error)
      showToast(`❌ Connection lost while processing ${gemType} (${reportNumber})`, 'error', 6000)
    }
  }

  // Reset form for new entry
  const resetFormForNewEntry = () => {
    setCurrentStep(1)
    setFormData(initialFormData)
    setExtractedData(null)
    setExtractionSuccess(false)
    setExtractionError(null)
    setErrors({})
    // Clear existing media for edit mode
    setExistingImages([])
    setExistingVideos([])
    setExistingLabReport(null)
    setDeletedMediaIds([])
    // Clear upload states
    setUploadProgress({})
    setIsUploading(false)
    // Clear stored lab report for new form
    clearLabReport()
    setHasAutoTriggeredOCR(false)
  }

  // Handle deletion of existing media
  const handleExistingMediaDelete = useCallback((mediaId: string, type: 'image' | 'video' | 'lab-report') => {
    setDeletedMediaIds(prev => [...prev, mediaId])
    
    if (type === 'image') {
      setExistingImages(prev => prev.filter(img => img._id !== mediaId))
    } else if (type === 'video') {
      setExistingVideos(prev => prev.filter(vid => vid._id !== mediaId))
    } else if (type === 'lab-report') {
      setExistingLabReport(null)
    }
  }, [])

  // Load stored lab report on component mount
  useEffect(() => {
    const loadStoredReport = async () => {
      if (storedLabReport && !hasAutoTriggeredOCR) {
        setIsLoadingStoredReport(true)
        
        try {
          // Check if stored report is not too old (24 hours)
          if (isExpired(storedLabReport)) {
            // Clear expired report
            clearLabReport()
            setToast({
              message: 'Previous lab report has expired. Please upload a new one.',
              type: 'info'
            })
            setTimeout(() => setToast(null), 4000)
            return
          }

          // Create a mock file object for preview
          const mockFile = new File(
            [new Blob()], 
            storedLabReport.filename, 
            { 
              type: storedLabReport.fileType,
              lastModified: storedLabReport.uploadedAt
            }
          )
          
          // Set the mock file to show in preview
          updateFormData({ labReport: mockFile })
          
          // Show loading toast
          setToast({
            message: 'Loading previous lab report and extracting data...',
            type: 'info'
          })
          setTimeout(() => setToast(null), 3000)
          
          // Auto-trigger OCR using the stored URL
          await extractLabReportFromUrl(storedLabReport.url)
          setHasAutoTriggeredOCR(true)
          
        } catch (error) {
          console.error('Error loading stored report:', error)
          
          // Don't clear the stored report if it's just an OCR service issue
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          if (errorMessage.includes('OCR service is temporarily unavailable') || 
              errorMessage.includes('OCR service is currently unavailable')) {
            // OCR service is down, but keep the stored report for manual use
            setToast({
              message: 'Previous lab report loaded, but OCR extraction failed. You can continue with manual entry or try OCR again later.',
              type: 'info'
            })
            setTimeout(() => setToast(null), 6000)
          } else {
            // Other errors - clear the stored report
            clearLabReport()
            setToast({
              message: 'Failed to load previous lab report. Please upload a new one.',
              type: 'error'
            })
            setTimeout(() => setToast(null), 4000)
          }
          
          setHasAutoTriggeredOCR(true) // Prevent retry loops
        } finally {
          setIsLoadingStoredReport(false)
        }
      }
    }

    loadStoredReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedLabReport, hasAutoTriggeredOCR, updateFormData])

  // Pre-populate form data in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      if (environment.isDevelopment) {
        console.log('Pre-populating form data for edit mode:', initialData)
      }
      
      // Create form data from initial data
      const editFormData: Partial<AddGemFormData> = {
        // Basic gem information
        reportNumber: initialData.reportNumber || '',
        labName: initialData.labName || '',
        gemType: initialData.gemType || '',
        variety: initialData.variety || '',
        weight: initialData.weight || { value: 0, unit: 'ct' },
        dimensions: initialData.dimensions || { length: '', width: '', height: '', unit: 'mm' },
        shapeCut: initialData.shapeCut || '',
        color: initialData.color || '',
        clarity: initialData.clarity || '',
        origin: initialData.origin || '',
        treatments: initialData.treatments || '',
        certificateDate: initialData.certificateDate || '',
        additionalComments: initialData.additionalComments || '',
        
        // Listing information
        listingType: initialData.listingType || '',
        price: initialData.price?.toString() || '',
        startingBid: initialData.startingBid?.toString() || '',
        reservePrice: initialData.reservePrice?.toString() || '',
        auctionDuration: initialData.auctionDuration || '',
        shippingMethod: initialData.shippingMethod || 'seller-fulfilled',
        
        // Advanced fields
        fluorescence: initialData.fluorescence || '',
        fluorescenceColor: initialData.fluorescenceColor || '',
        polish: initialData.polish || '',
        symmetry: initialData.symmetry || '',
        girdle: initialData.girdle || '',
        culet: initialData.culet || '',
        depth: initialData.depth || '',
        table: initialData.table || '',
        crownAngle: initialData.crownAngle || '',
        pavilionAngle: initialData.pavilionAngle || '',
        crownHeight: initialData.crownHeight || '',
        pavilionDepth: initialData.pavilionDepth || '',
        starLength: initialData.starLength || '',
        lowerHalf: initialData.lowerHalf || '',
        
        // Market information
        pricePerCarat: initialData.pricePerCarat || '',
        marketTrend: initialData.marketTrend || '',
        investmentGrade: initialData.investmentGrade || '',
        rapnetPrice: initialData.rapnetPrice || '',
        discount: initialData.discount || '',
        
        // Additional details
        laserInscription: initialData.laserInscription || '',
        memo: initialData.memo || false,
        consignment: initialData.consignment || false,
        stockNumber: initialData.stockNumber || '',
        
        // Show advanced if any advanced fields are populated
        showAdvanced: Boolean(
          initialData.fluorescence || initialData.polish || initialData.symmetry ||
          initialData.pricePerCarat || initialData.marketTrend || initialData.investmentGrade
        ),
        
        // For edit mode, we don't pre-populate files since they need to be handled differently
        images: [],
        videos: [],
        labReport: null,
        confirmAccuracy: false
      }
      
      updateFormData(editFormData)
      
      // Set extracted data if available to show success state
      if (initialData.reportNumber && initialData.labName) {
        setExtractedData({
          reportNumber: initialData.reportNumber,
          labName: initialData.labName,
          gemType: initialData.gemType,
          variety: initialData.variety,
          weight: initialData.weight,
          dimensions: initialData.dimensions,
          shapeCut: initialData.shapeCut,
          color: initialData.color,
          clarity: initialData.clarity,
          origin: initialData.origin,
          treatments: initialData.treatments,
          certificateDate: initialData.certificateDate,
          additionalComments: initialData.additionalComments
        })
        setExtractionSuccess(true)
      }

      // Populate existing media files in edit mode
      if (initialData.media && Array.isArray(initialData.media)) {
        const images = initialData.media.filter((m: { type: string }) => m.type === 'image')
        const videos = initialData.media.filter((m: { type: string }) => m.type === 'video')
        const labReport = initialData.media.find((m: { type: string }) => m.type === 'lab-report')
        
        setExistingImages(images)
        setExistingVideos(videos)
        if (labReport) {
          setExistingLabReport(labReport)
        }
      }

      // Also check for labReportId field
      if (initialData.labReportId) {
        setExistingLabReport(initialData.labReportId)
      }
    }
  }, [isEditMode, initialData, updateFormData])

  // Extract data from lab report using S3 URL (server proxies to OCR)
  const extractLabReportFromUrl = useCallback(async (url: string) => {
    setIsExtracting(true)
    setExtractionProgress(0)
    setExtractionError(null)
    setExtractionSuccess(false)

    try {
      // Call our server endpoint; server attaches Authorization to OCR
      const ocrResult = await gemService.extractLabReportByUrl(url)
      
      // Debug logging to understand the response structure
      if (environment.isDevelopment) {
        console.log('OCR Result:', ocrResult)
      }
      
      if (!ocrResult.success) {
        // Handle specific error cases
        let errorMessage = 'OCR service is currently unavailable'
        
        if (ocrResult.message) {
          if (ocrResult.message.includes('Failed to process lab report URL') || 
              ocrResult.message.includes('Unknown error') ||
              ocrResult.message.includes('fetch failed') ||
              ocrResult.message.includes('ECONNREFUSED')) {
            errorMessage = 'OCR service is temporarily unavailable. You can continue with manual entry.'
          } else {
            errorMessage = ocrResult.message
          }
        }
        
        throw new Error(errorMessage)
      }
      
      // Check if we have valid data - be more flexible about the data structure
      if (!ocrResult.data || (typeof ocrResult.data === 'object' && Object.keys(ocrResult.data).length === 0)) {
        throw new Error('No gem data was extracted from the lab report. You can continue with manual entry.')
      }

      setExtractedData(ocrResult.data)
      setExtractionSuccess(true)
        
        // Show success toast
        setToast({
          message: 'Data extracted successfully from stored report! Form fields have been pre-filled with intelligent matching.',
          type: 'success'
        })
        setTimeout(() => setToast(null), 3000)
        
        // Apply intelligent matching to extracted data
        const matchedData = intelligentlyMatchGemData(ocrResult.data)
        
        // Pre-fill form with intelligently matched data
        const updates: Partial<AddGemFormData> = {}
        
        if (matchedData.reportNumber) updates.reportNumber = matchedData.reportNumber
        if (matchedData.labName) updates.labName = matchedData.labName
        if (matchedData.gemType) updates.gemType = matchedData.gemType
        if (matchedData.variety) updates.variety = matchedData.variety
        if (matchedData.weight) updates.weight = matchedData.weight
        if (matchedData.dimensions) updates.dimensions = matchedData.dimensions
        if (matchedData.shapeCut) updates.shapeCut = matchedData.shapeCut
        if (matchedData.color) updates.color = matchedData.color
        if (matchedData.clarity) updates.clarity = matchedData.clarity
        if (matchedData.origin) updates.origin = matchedData.origin
        if (matchedData.treatments) updates.treatments = matchedData.treatments
        if (matchedData.certificateDate) updates.certificateDate = matchedData.certificateDate
        if (matchedData.additionalComments) updates.additionalComments = matchedData.additionalComments
        
        updateFormData(updates)
    } catch (error) {
      console.error('Lab report extraction error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract data from lab report'
      setExtractionError(errorMessage)
      throw error
    } finally {
      setIsExtracting(false)
      setExtractionProgress(0)
    }
  }, [updateFormData])

  // Delete previous lab report from S3 if exists
  const deletePreviousLabReport = useCallback(async () => {
    if (storedLabReport?.s3Key) {
      try {
        await gemService.deleteLabReport(storedLabReport.s3Key)
        if (environment.isDevelopment) {
          console.log('Previous lab report deleted from S3:', storedLabReport.s3Key)
        }
      } catch (error) {
        // Log the error but don't fail the upload process
        console.warn('Failed to delete previous lab report (non-critical):', error)
        if (environment.isDevelopment) {
          console.warn('This is a non-critical error. The upload will continue with the new file.')
        }
        // Don't throw error - continue with upload even if deletion fails
      }
    }
  }, [storedLabReport])

  // Extract data from lab report
  const extractLabReportData = useCallback(async (file: File) => {
    if (!file) return

    setIsExtracting(true)
    setExtractionProgress(0)
    setExtractionError(null)
    setExtractionSuccess(false)

    try {
      // Delete previous lab report if exists
      await deletePreviousLabReport()

      // Debug: Check file before upload
      if (environment.isDevelopment) {
        console.log('File details before upload:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })
      }

      const response = await gemService.extractLabReportWithProgress(
        file,
        (progress) => {
          setExtractionProgress(progress)
        }
      )

      if (response.success) {
        // Check if we have valid data - be more flexible about the data structure
        if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
          throw new Error('No gem data was extracted from the lab report. You can continue with manual entry.')
        }
        
        setExtractedData(response.data)
        setExtractionSuccess(true)
        
        // Store lab report URL in localStorage for future use
        if (response.meta?.s3Url) {
          const storedReport: StoredLabReport = {
            url: response.meta.s3Url,
            filename: response.meta.filename,
            s3Key: response.meta.s3Key,
            uploadedAt: Date.now(),
            fileSize: file.size,
            fileType: file.type
          }
          saveLabReport(storedReport)
        }
        
        // Show success toast
        setToast({
          message: 'Data extracted successfully! Form fields have been pre-filled with intelligent matching.',
          type: 'success'
        })
        setTimeout(() => setToast(null), 3000)
        
        // Apply intelligent matching to extracted data
        const matchedData = intelligentlyMatchGemData(response.data)
        
        // Pre-fill form with intelligently matched data
        const updates: Partial<AddGemFormData> = {}
        
        if (matchedData.reportNumber) updates.reportNumber = matchedData.reportNumber
        if (matchedData.labName) updates.labName = matchedData.labName
        if (matchedData.gemType) updates.gemType = matchedData.gemType
        if (matchedData.variety) updates.variety = matchedData.variety
        if (matchedData.weight) updates.weight = matchedData.weight
        if (matchedData.dimensions) updates.dimensions = matchedData.dimensions
        if (matchedData.shapeCut) updates.shapeCut = matchedData.shapeCut
        if (matchedData.color) updates.color = matchedData.color
        if (matchedData.clarity) updates.clarity = matchedData.clarity
        if (matchedData.origin) updates.origin = matchedData.origin
        if (matchedData.treatments) updates.treatments = matchedData.treatments
        if (matchedData.certificateDate) updates.certificateDate = matchedData.certificateDate
        if (matchedData.additionalComments) updates.additionalComments = matchedData.additionalComments
        
        updateFormData(updates)
      } else {
        // Handle specific error cases for consistency
        let errorMessage = 'Failed to extract data from lab report'
        
        if (response.message) {
          if (response.message.includes('Failed to process lab report URL') || 
              response.message.includes('Unknown error') ||
              response.message.includes('fetch failed') ||
              response.message.includes('ECONNREFUSED')) {
            errorMessage = 'OCR service is temporarily unavailable. You can continue with manual entry.'
          } else {
            errorMessage = response.message
          }
        }
        
        setExtractionError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Lab report extraction error:', error)
      let errorMessage = 'Failed to extract data from lab report'
      
      if (error instanceof Error) {
        if (error.message.includes('OCR service is temporarily unavailable')) {
          errorMessage = error.message
        } else if (error.message.includes('fetch failed') || 
                   error.message.includes('ECONNREFUSED') ||
                   error.message.includes('NetworkError')) {
          errorMessage = 'OCR service is temporarily unavailable. You can continue with manual entry.'
        } else {
          errorMessage = error.message
        }
      }
      
      setExtractionError(errorMessage)
      throw error
    } finally {
      setIsExtracting(false)
      setExtractionProgress(0)
    }
  }, [updateFormData, deletePreviousLabReport, saveLabReport])

  // Check validation without setting errors (for disabled state)
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.labReport
      case 2:
        return !!(
          formData.reportNumber?.trim() &&
          formData.labName?.trim() &&
          formData.gemType?.trim() &&
          formData.weight?.value > 0 &&
          formData.color?.trim() &&
          formData.clarity?.trim() &&
          formData.origin?.trim() &&
          formData.listingType?.trim() &&
          formData.shippingMethod?.trim() &&
          (formData.listingType === 'direct-sale' ? formData.price?.trim() : true) &&
          (formData.listingType === 'auction' ? 
            (formData.startingBid?.trim() && formData.reservePrice?.trim() && formData.auctionDuration?.trim()) : 
            true)
        )
      case 3:
        // In edit mode, check if there are existing images or new images
        if (isEditMode) {
          return existingImages.length > 0 || formData.images?.length > 0
        }
        return formData.images?.length > 0
      case 4:
        return formData.confirmAccuracy
      default:
        return false
    }
  }, [formData, existingImages.length, isEditMode])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.labReport) {
          newErrors.labReport = 'Lab certificate is required'
        }
        break
      case 2:
        if (!formData.reportNumber?.trim()) newErrors.reportNumber = 'Report number is required'
        if (!formData.labName?.trim()) newErrors.labName = 'Lab name is required'
        if (!formData.gemType?.trim()) newErrors.gemType = 'Gem type is required'
        if (!formData.weight?.value || formData.weight.value <= 0) newErrors.weight = 'Weight must be greater than 0'
        if (!formData.color?.trim()) newErrors.color = 'Color is required'
        if (!formData.clarity?.trim()) newErrors.clarity = 'Clarity is required'
        if (!formData.origin?.trim()) newErrors.origin = 'Origin is required'
        if (!formData.listingType?.trim()) newErrors.listingType = 'Listing type is required'
        if (formData.listingType === 'direct-sale' && (!formData.price?.trim() || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0)) {
          newErrors.price = 'Valid price is required for direct sale'
        }
        if (formData.listingType === 'auction' && (!formData.startingBid?.trim() || isNaN(parseFloat(formData.startingBid)) || parseFloat(formData.startingBid) <= 0)) {
          newErrors.startingBid = 'Valid starting bid is required for auction'
        }
        if (formData.listingType === 'auction' && (!formData.reservePrice?.trim() || isNaN(parseFloat(formData.reservePrice)) || parseFloat(formData.reservePrice) <= 0)) {
          newErrors.reservePrice = 'Valid reserve price is required for auction'
        }
        if (formData.listingType === 'auction' && formData.startingBid && formData.reservePrice && 
            !isNaN(parseFloat(formData.startingBid)) && !isNaN(parseFloat(formData.reservePrice)) && 
            parseFloat(formData.reservePrice) < parseFloat(formData.startingBid)) {
          newErrors.reservePrice = 'Reserve price must be greater than or equal to starting bid'
        }
        if (formData.listingType === 'auction' && !formData.auctionDuration?.trim()) {
          newErrors.auctionDuration = 'Auction duration is required for auction'
        }
        if (!formData.shippingMethod?.trim()) {
          newErrors.shippingMethod = 'Shipping method is required'
        }
        break
      case 3:
        // In edit mode, check if there are existing images or new images
        const hasImages = isEditMode 
          ? (existingImages.length > 0 || formData.images?.length > 0)
          : (formData.images?.length > 0)
        
        if (!hasImages) {
          newErrors.images = isEditMode 
            ? 'At least one image is required. You can keep existing images or upload new ones.'
            : 'At least one image is required'
        }
        break
      case 4:
        if (!formData.confirmAccuracy) {
          newErrors.confirmAccuracy = 'Please confirm the accuracy of your information'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueWithoutExtraction = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handleExtractAndContinue = async () => {
    if (!validateStep(currentStep)) return
    
    if (formData.labReport) {
      try {
        await extractLabReportData(formData.labReport)
        // Auto-scroll to step 2 after extraction
        setTimeout(() => {
          setCurrentStep(prev => Math.min(prev + 1, 4))
        }, 500) // Small delay to show success message
      } catch (error) {
        console.error('OCR extraction failed, but you can continue with manual entry', error)
        // Show error toast but still allow navigation
        setToast({
          message: 'OCR extraction failed, but you can continue with manual entry. The lab report has been uploaded successfully.',
          type: 'info'
        })
        setTimeout(() => setToast(null), 6000)
      }
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return
    
    // Extract data from lab report before moving to step 2
    if (currentStep === 1 && formData.labReport && !extractedData) {
      await extractLabReportData(formData.labReport)
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)
    
    try {
              // Debug: Check authentication state and submission mode
        const token = localStorage.getItem('token')
        console.log('Form submission debug:', {
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : null,
          isEditMode,
          editGemId,
          isAdmin,
          useAsyncSubmission,
          willUseAsyncPath: useAsyncSubmission && !isAdmin && !isEditMode
        })
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }
      
      // Debug: Log form data state
      console.log('Form submission started with data:', {
        images: formData.images?.length || 0,
        videos: formData.videos?.length || 0,
        labReport: formData.labReport?.name || null,
        storedLabReport: storedLabReport ? {
          filename: storedLabReport.filename,
          s3Key: storedLabReport.s3Key,
          fileSize: storedLabReport.fileSize
        } : null,
        reportNumber: formData.reportNumber,
        gemType: formData.gemType
      })
      
      // Step 1: Generate temporary gem ID for file organization
      const tempGemId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Step 2: Prepare files for upload
      const filesToUpload: Array<{
        fileName: string;
        fileType: string;
        fileSize: number;
        mediaType: 'image' | 'video' | 'lab-report';
        gemId: string;
        file: File;
      }> = []

      // Add images
      formData.images.forEach((file, index) => {
        // Validate that file is actually a File object
        if (file instanceof File && file.name && file.type && file.size > 0) {
          filesToUpload.push({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            mediaType: 'image',
            gemId: tempGemId,
            file
          })
        } else {
          console.warn('Invalid image file at index', index, ':', file)
        }
      })

      // Add videos
      formData.videos.forEach((file, index) => {
        // Validate that file is actually a File object
        if (file instanceof File && file.name && file.type && file.size > 0) {
          filesToUpload.push({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            mediaType: 'video',
            gemId: tempGemId,
            file
          })
        } else {
          console.warn('Invalid video file at index', index, ':', file)
        }
      })

      // Add lab report if exists
      // Check if we have a stored lab report from OCR process
      if (storedLabReport && storedLabReport.url && storedLabReport.s3Key) {
        console.log('Using stored lab report from OCR process:', storedLabReport)
        // Lab report is already in S3, we'll include it in the final media files
        // No need to upload it again
      } else if (formData.labReport && formData.labReport instanceof File && 
          formData.labReport.name && formData.labReport.type && formData.labReport.size > 0) {
        filesToUpload.push({
          fileName: formData.labReport.name,
          fileType: formData.labReport.type,
          fileSize: formData.labReport.size,
          mediaType: 'lab-report',
          gemId: tempGemId,
          file: formData.labReport
        })
      } else if (formData.labReport) {
        console.warn('Invalid lab report file:', formData.labReport)
      }

      // Safety check: Ensure we have files to upload
      if (filesToUpload.length === 0) {
        throw new Error('No files to upload. Please add at least one image before submitting.')
      }

      // Additional validation: Check that all required properties are present
      for (const file of filesToUpload) {
        if (!file || typeof file !== 'object' || 
            !file.fileName || !file.fileType || !file.fileSize || 
            !file.mediaType || !file.gemId || !file.file) {
          console.error('Invalid file object:', file)
          throw new Error(`Invalid file data: Missing required properties in file ${file?.fileName || 'unknown'}`)
        }
      }

      // Step 3: Get pre-signed URLs for file uploads
      const uploadRequest = filesToUpload.map(f => ({
        fileName: f.fileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        mediaType: f.mediaType,
        gemId: f.gemId
      }))
      
      console.log('Upload request data:', uploadRequest)
      
      const uploadUrlsResponse = await gemService.generateUploadUrls(uploadRequest)

      if (!uploadUrlsResponse.success) {
        // Surface server-provided error message for easier debugging
        throw new Error(uploadUrlsResponse.message || 'Failed to generate upload URLs')
      }

      // Step 4: Upload files to S3
      const uploadPromises = filesToUpload.map(async (fileData, index) => {
        const uploadInfo = uploadUrlsResponse.data[index]
        const progressKey = `${fileData.mediaType}-${fileData.fileName}`
        
        // Set initial progress
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }))
        
        await gemService.uploadToS3(
          fileData.file, 
          uploadInfo.uploadUrl,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [progressKey]: progress }))
          }
        )
        
        // Remove from progress tracking when complete
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[progressKey]
          return newProgress
        })
        
        return {
          s3Key: uploadInfo.s3Key,
          type: fileData.mediaType,
          filename: fileData.fileName,
          fileSize: fileData.fileSize,
          mimeType: fileData.fileType,
          isPrimary: fileData.mediaType === 'image' && index === 0, // First image is primary
          order: index
        }
      })

      // Show upload progress indicator
      setIsUploading(true)
      const uploadedFiles = await Promise.all(uploadPromises)
      setIsUploading(false)

      // Add stored lab report to uploaded files if it exists
      if (storedLabReport && storedLabReport.url && storedLabReport.s3Key) {
        uploadedFiles.push({
          s3Key: storedLabReport.s3Key,
          type: 'lab-report',
          filename: storedLabReport.filename,
          fileSize: storedLabReport.fileSize,
          mimeType: storedLabReport.fileType,
          isPrimary: false,
          order: uploadedFiles.length // Put lab report at the end
        })
        console.log('Added stored lab report to uploaded files:', {
          s3Key: storedLabReport.s3Key,
          filename: storedLabReport.filename,
          fileSize: storedLabReport.fileSize
        })
      }

      // Debug: Log final uploaded files
      console.log('Final uploaded files array:', uploadedFiles.map(file => ({
        s3Key: file.s3Key,
        type: file.type,
        filename: file.filename,
        fileSize: file.fileSize
      })))
      
      // Debug: Check if lab report is included
      const labReportCount = uploadedFiles.filter(file => file.type === 'lab-report').length
      console.log('Lab reports in uploaded files:', labReportCount)
      
      if (labReportCount > 0) {
        const labReport = uploadedFiles.find(file => file.type === 'lab-report')
        console.log('Lab report details:', {
          s3Key: labReport?.s3Key,
          filename: labReport?.filename,
          fileSize: labReport?.fileSize
        })
      }

      // Step 5: Prepare gem data for backend
      const baseGemData = {
        // Lab Report Information
        reportNumber: formData.reportNumber,
        labName: formData.labName,
        certificateDate: formData.certificateDate || undefined,
        
        // Basic Gem Information
        gemType: formData.gemType,
        variety: formData.variety || undefined,
        weight: {
          value: formData.weight.value && !isNaN(formData.weight.value) ? formData.weight.value : 0,
          unit: formData.weight.unit as 'ct' | 'g'
        },
        dimensions: formData.dimensions.length || formData.dimensions.width || formData.dimensions.height ? {
          length: formData.dimensions.length,
          width: formData.dimensions.width,
          height: formData.dimensions.height,
          unit: formData.dimensions.unit as 'mm' | 'cm'
        } : undefined,
        shapeCut: formData.shapeCut || undefined,
        color: formData.color,
        clarity: formData.clarity,
        origin: formData.origin,
        treatments: formData.treatments || undefined,
        additionalComments: formData.additionalComments || undefined,
        
        // Advanced Certificate Details (only if showAdvanced is true)
        ...(formData.showAdvanced && {
          fluorescence: formData.fluorescence || undefined,
          fluorescenceColor: formData.fluorescenceColor || undefined,
          polish: formData.polish || undefined,
          symmetry: formData.symmetry || undefined,
          girdle: formData.girdle || undefined,
          culet: formData.culet || undefined,
          depth: formData.depth || undefined,
          table: formData.table || undefined,
          crownAngle: formData.crownAngle || undefined,
          pavilionAngle: formData.pavilionAngle || undefined,
          crownHeight: formData.crownHeight || undefined,
          pavilionDepth: formData.pavilionDepth || undefined,
          starLength: formData.starLength || undefined,
          lowerHalf: formData.lowerHalf || undefined,
          
          // Market Information
          pricePerCarat: formData.pricePerCarat || undefined,
          marketTrend: formData.marketTrend as 'Rising' | 'Stable' | 'Declining' || undefined,
          investmentGrade: formData.investmentGrade as 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' || undefined,
          rapnetPrice: formData.rapnetPrice || undefined,
          discount: formData.discount || undefined,
          
          // Additional Details
          laserInscription: formData.laserInscription || undefined,
          memo: formData.memo || undefined,
          consignment: formData.consignment || undefined,
          stockNumber: formData.stockNumber || undefined,
        }),
        
        // Listing Information
        listingType: formData.listingType as 'direct-sale' | 'auction',
        price: formData.listingType === 'direct-sale' && formData.price && !isNaN(parseFloat(formData.price)) ? parseFloat(formData.price) : undefined,
        startingBid: formData.listingType === 'auction' && formData.startingBid && !isNaN(parseFloat(formData.startingBid)) ? parseFloat(formData.startingBid) : undefined,
        reservePrice: formData.listingType === 'auction' && formData.reservePrice && !isNaN(parseFloat(formData.reservePrice)) ? parseFloat(formData.reservePrice) : undefined,
        auctionDuration: formData.listingType === 'auction' && formData.auctionDuration ? formData.auctionDuration : undefined,
        shippingMethod: formData.shippingMethod as 'seller-fulfilled' | 'ishq-gems-logistics' | 'in-person-via-ishq-gems',
        
        // Media information
        mediaFiles: uploadedFiles,
        
        // Edit mode: include deleted media IDs and gem ID for proper validation
        ...(isEditMode && deletedMediaIds.length > 0 && { deletedMediaIds }),
        ...(isEditMode && editGemId && { gemId: editGemId })
      }

      // Step 6: Create gem listing
      if (useAsyncSubmission && !isAdmin && !isEditMode) {
        // Use async submission for regular users (only for new gems, not edits)
        const submitResponse = await gemService.submitGemAsync(baseGemData)
        
        if (!submitResponse.success || !submitResponse.data) {
          throw new Error(submitResponse.message || 'Failed to submit gem listing')
        }

        // Set up background processing
        const jobId = submitResponse.data.jobId
        
        // Add to background jobs for tracking
        addBackgroundJob(jobId, formData.gemType, formData.reportNumber)
        
        // Clear stored lab report from localStorage
        clearLabReport()
        
        // Show immediate success message
        showToast(`🚀 ${formData.gemType} (${formData.reportNumber}) submitted! Processing in background...`, 'success', 5000)
        
        // Reset form immediately for new entry
        resetFormForNewEntry()
        
        // Don't set isProcessing or wait for completion - let it happen in background
        return
       } else {
         // Use synchronous submission (for admin or legacy mode)
         let response;
         
         if (isEditMode && editGemId) {
           // Update existing gem
           response = await gemService.updateGem(editGemId, baseGemData)
         } else if (isAdmin) {
           // Create new admin gem
           response = await adminGemService.createAdminGem({
             ...baseGemData,
             // Admin-specific fields
             isPlatformGem: true,
             sellerType: 'Ishq' as const,
             adminSubmitted: true,
             autoVerified: true,
           })
         } else {
           // Create new regular gem
           response = await gemService.createGem(baseGemData)
         }
        
        if (!response.success) {
          throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} gem listing`)
        }

        // Step 7: Clear stored lab report from localStorage on successful submission
        clearLabReport()
        
        // Show success message
        const successMessage = isEditMode
          ? `✅ ${formData.gemType} (${formData.reportNumber}) updated successfully!`
          : isAdmin 
            ? `✅ ${formData.gemType} (${formData.reportNumber}) added as Ishq Gems! Automatically verified and ready.`
            : `✅ ${formData.gemType} (${formData.reportNumber}) created! It will be reviewed by our team.`
        
        showToast(successMessage, 'success', 6000)
        
        // Handle success callback for edit mode
        if (isEditMode && onEditSuccess) {
          setTimeout(() => {
            onEditSuccess()
          }, 1000) // Shorter delay
        } else {
          // Reset form for new entry (for admin and regular create)
          setTimeout(() => {
            resetFormForNewEntry()
          }, 1500) // Brief delay to show success
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      
      let errorMessage = 'Failed to submit gem listing. Please try again.'
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Duplicate Report Number') || error.message.includes('already exists')) {
          if (isEditMode) {
            errorMessage = `There was an issue updating the gem listing. The report number "${formData.reportNumber}" might already be in use by another gem. Please contact support if this persists.`
            
            // In edit mode, this might be a backend issue - don't require field change
            setErrors({ reportNumber: 'Report number conflict detected. Contact support if this issue persists.' })
          } else {
            errorMessage = `Report number "${formData.reportNumber}" already exists. Please verify the report number or check if this gem has already been listed.`
            
            // Highlight the report number field
            setErrors({ reportNumber: 'This report number is already in use' })
          }
          
          // Navigate back to step 2 where the report number is
          setCurrentStep(2)
        } else {
          errorMessage = error.message
        }
      }
      
      // Show error message
      setToast({
        message: errorMessage,
        type: 'error'
      })
      setTimeout(() => setToast(null), 8000) // Longer timeout for duplicate error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto space-y-8 luxury-form">
      {/* Background Jobs Indicator */}
      {backgroundJobs.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Processing Gems ({backgroundJobs.length} active)
            </h3>
          </div>
          <div className="space-y-2">
            {backgroundJobs.map((job) => (
              <div key={job.jobId} className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    job.progress.status === 'completed' ? 'bg-green-500' :
                    job.progress.status === 'failed' ? 'bg-red-500' :
                    'bg-blue-500 animate-pulse'
                  )}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {job.gemType} ({job.reportNumber})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.progress.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{job.progress.progress}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
        <div className="flex items-center justify-between mb-4">
          {/* Async/Sync Toggle (for admin/development) */}
          {isAdmin && (
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={useAsyncSubmission}
                  onChange={(e) => setUseAsyncSubmission(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-muted-foreground">Use Async Processing</span>
              </label>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                  currentStep === step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep > step.id
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              
              <div className="ml-4 hidden sm:block">
                <div className="font-medium text-foreground">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 ml-4 transition-all duration-300',
                    currentStep > step.id ? 'bg-green-500' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-2xl shadow-lg border border-border/50">
        {/* Step 1: Lab Certificate */}
        {currentStep === 1 && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Step 1: Upload Lab Certificate
              </h2>
              <p className="text-muted-foreground">
                Upload your official lab certificate to verify your gemstone&apos;s authenticity.
              </p>
            </div>

            <UploadLabReport
              labReport={formData.labReport}
              onLabReportChange={(file) => {
                updateFormData({ labReport: file })
                if (!file) {
                  // Clear extracted data when file is removed
                  setExtractedData(null)
                  setExtractionSuccess(false)
                  setExtractionError(null)
                  // Clear stored lab report from localStorage
                  clearLabReport()
                  setHasAutoTriggeredOCR(false)
                }
              }}
              onNewFileSelected={deletePreviousLabReport}
              isLoadingStoredReport={isLoadingStoredReport}
              storedReportInfo={storedLabReport}
            />

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              {/* Button Container */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Skip Lab Report Button (Edit Mode Only) */}
                {isEditMode && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <MoveRight className="w-4 h-4" />
                    Skip Lab Report
                  </button>
                )}

                {/* Continue Without Extraction Button - Only show if lab report is uploaded or in edit mode */}
                {(formData.labReport || isEditMode) && (
                  <button
                    onClick={handleContinueWithoutExtraction}
                    disabled={isExtracting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MoveRight className="w-4 h-4" />
                    Continue Without Extraction
                  </button>
                )}

                {/* Extract & Continue Button - Only show if lab report is uploaded */}
                {formData.labReport && (
                  <button
                    onClick={handleExtractAndContinue}
                    disabled={isExtracting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Extracting details...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract & Continue
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isExtracting 
                    ? "Processing your lab certificate. This may take a few moments..."
                    : isEditMode
                    ? "Choose to skip, manually enter details, or extract them automatically from a new certificate"
                    : "Choose to manually enter details or let us extract them automatically from your certificate"
                  }
                </p>
              </div>
            </div>

            {/* Lab Report Extraction Status */}
            {formData.labReport && (
              <div className="mt-6 space-y-4">
                {isExtracting && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          Extracting data from lab report...
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This may take a few moments. Please wait.
                        </p>
                      </div>
                    </div>
                    {extractionProgress > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${extractionProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{extractionProgress}% uploaded</p>
                      </div>
                    )}
                  </div>
                )}

                {extractionError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          Failed to extract data from lab report
                        </p>
                        <p className="text-xs text-red-600 mt-1">{extractionError}</p>
                      </div>
                      <button
                        onClick={() => extractLabReportData(formData.labReport!)}
                        disabled={isExtracting}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {extractionSuccess && extractedData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Data extracted successfully!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Form fields have been pre-filled with extracted data. You can review and modify them in the next step.
                        </p>
                      </div>
                    </div>
                    
                    {/* Preview of extracted data */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {extractedData.reportNumber && (
                        <div>
                          <span className="font-medium text-green-800">Report Number:</span>
                          <span className="text-green-600 ml-2">{extractedData.reportNumber}</span>
                        </div>
                      )}
                      {extractedData.labName && (
                        <div>
                          <span className="font-medium text-green-800">Lab:</span>
                          <span className="text-green-600 ml-2">{extractedData.labName}</span>
                        </div>
                      )}
                      {extractedData.gemType && (
                        <div>
                          <span className="font-medium text-green-800">Gem Type:</span>
                          <span className="text-green-600 ml-2">{extractedData.gemType}</span>
                        </div>
                      )}
                      {extractedData.weight && (
                        <div>
                          <span className="font-medium text-green-800">Weight:</span>
                          <span className="text-green-600 ml-2">{extractedData.weight.value} {extractedData.weight.unit}</span>
                        </div>
                      )}
                      {extractedData.color && (
                        <div>
                          <span className="font-medium text-green-800">Color:</span>
                          <span className="text-green-600 ml-2">{extractedData.color}</span>
                        </div>
                      )}
                      {extractedData.origin && (
                        <div>
                          <span className="font-medium text-green-800">Origin:</span>
                          <span className="text-green-600 ml-2">{extractedData.origin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.labReport && (
              <div className="mt-4 flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.labReport}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Gem Information */}
        {currentStep === 2 && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Step 2: Enter Gemstone Details
              </h2>
              <p className="text-muted-foreground">
                Provide detailed information about your gemstone.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Report Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reportNumber}
                  onChange={(e) => updateFormData({ reportNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter report number"
                />
                {errors.reportNumber && (
                  <span className="text-red-500 text-sm mt-1">{errors.reportNumber}</span>
                )}
              </div>

              {/* Lab Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lab Name <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={LAB_NAMES}
                  value={formData.labName}
                  onChange={(value) => updateFormData({ labName: value })}
                  placeholder="Select lab name"
                  allowCustomValue={true}
                  searchPlaceholder="Search labs..."
                />
                {errors.labName && (
                  <span className="text-red-500 text-sm mt-1">{errors.labName}</span>
                )}
              </div>

              {/* Gem Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gem Type <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={GEM_TYPES}
                  value={formData.gemType}
                  onChange={(value) => updateFormData({ gemType: value })}
                  placeholder="Select gem type"
                  searchPlaceholder="Search gem types..."
                />
                {errors.gemType && (
                  <span className="text-red-500 text-sm mt-1">{errors.gemType}</span>
                )}
              </div>

              {/* Variety */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Variety
                </label>
                <SearchableSelect
                  options={GEM_VARIETIES}
                  value={formData.variety}
                  onChange={(value) => updateFormData({ variety: value })}
                  placeholder="Select variety (optional)"
                  allowCustomValue={true}
                  searchPlaceholder="Search varieties..."
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight.value}
                    onChange={(e) => updateFormData({ 
                      weight: { ...formData.weight, value: parseFloat(e.target.value) || 0 }
                    })}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="0.00"
                  />
                  <select
                    title="Weight Unit"
                    value={formData.weight.unit}
                    onChange={(e) => updateFormData({ 
                      weight: { ...formData.weight, unit: e.target.value }
                    })}
                    className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNSA1TDkgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K')] bg-no-repeat bg-right-3 bg-center pr-8"
                  >
                    <option value="ct">ct</option>
                    <option value="g">g</option>
                  </select>
                </div>
                {errors.weight && (
                  <span className="text-red-500 text-sm mt-1">{errors.weight}</span>
                )}
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dimensions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={formData.dimensions.length}
                    onChange={(e) => updateFormData({ 
                      dimensions: { ...formData.dimensions, length: e.target.value }
                    })}
                    className="px-3 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 text-center text-sm"
                    placeholder="Length"
                  />
                  <input
                    type="text"
                    value={formData.dimensions.width}
                    onChange={(e) => updateFormData({ 
                      dimensions: { ...formData.dimensions, width: e.target.value }
                    })}
                    className="px-3 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 text-center text-sm"
                    placeholder="Width"
                  />
                  <input
                    type="text"
                    value={formData.dimensions.height}
                    onChange={(e) => updateFormData({ 
                      dimensions: { ...formData.dimensions, height: e.target.value }
                    })}
                    className="px-3 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 text-center text-sm"
                    placeholder="Height"
                  />
                  <select
                    title="Dimensions Unit"
                    value={formData.dimensions.unit}
                    onChange={(e) => updateFormData({ 
                      dimensions: { ...formData.dimensions, unit: e.target.value }
                    })}
                    className="px-3 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNSA1TDkgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K')] bg-no-repeat bg-right-3 bg-center pr-8"
                  >
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>L</span>
                  <span>W</span>
                  <span>H</span>
                  <span>Unit</span>
                </div>
              </div>

              {/* Shape/Cut */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Shape/Cut
                </label>
                <SearchableSelect
                  options={SHAPE_CUT_OPTIONS}
                  value={formData.shapeCut}
                  onChange={(value) => updateFormData({ shapeCut: value })}
                  placeholder="Select shape/cut (optional)"
                  allowCustomValue={true}
                  searchPlaceholder="Search shapes..."
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Color <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={COLOR_OPTIONS}
                  value={formData.color}
                  onChange={(value) => updateFormData({ color: value })}
                  placeholder="Select color"
                  allowCustomValue={true}
                  searchPlaceholder="Search colors..."
                />
                {errors.color && (
                  <span className="text-red-500 text-sm mt-1">{errors.color}</span>
                )}
              </div>

              {/* Clarity */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Clarity <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={CLARITY_GRADES}
                  value={formData.clarity}
                  onChange={(value) => updateFormData({ clarity: value })}
                  placeholder="Select clarity grade"
                  searchPlaceholder="Search clarity grades..."
                />
                {errors.clarity && (
                  <span className="text-red-500 text-sm mt-1">{errors.clarity}</span>
                )}
              </div>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Origin <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={ORIGIN_OPTIONS}
                  value={formData.origin}
                  onChange={(value) => updateFormData({ origin: value })}
                  placeholder="Select origin"
                  allowCustomValue={true}
                  searchPlaceholder="Search origins..."
                />
                {errors.origin && (
                  <span className="text-red-500 text-sm mt-1">{errors.origin}</span>
                )}
              </div>

              {/* Treatments */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Treatments
                </label>
                <SearchableSelect
                  options={TREATMENT_OPTIONS}
                  value={formData.treatments}
                  onChange={(value) => updateFormData({ treatments: value })}
                  placeholder="Select treatment (optional)"
                  allowCustomValue={true}
                  searchPlaceholder="Search treatments..."
                />
              </div>

              {/* Certificate Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Certificate Date
                </label>
                <input
                  title="Certificate Date"
                  type="date"
                  value={formData.certificateDate}
                  onChange={(e) => updateFormData({ certificateDate: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Listing Type <span className="text-red-500">*</span>
                </label>
                <select
                  title="Listing Type"
                  value={formData.listingType}
                  onChange={(e) => updateFormData({ listingType: e.target.value as 'direct-sale' | 'auction' | '' })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNSA1TDkgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K')] bg-no-repeat bg-right-4 bg-center pr-10"
                >
                  <option value="">Select listing type</option>
                  <option value="direct-sale">Direct Sale</option>
                  <option value="auction">Auction</option>
                </select>
                {errors.listingType && (
                  <span className="text-red-500 text-sm mt-1">{errors.listingType}</span>
                )}
              </div>

              {/* Price/Starting Bid */}
              {formData.listingType === 'direct-sale' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData({ price: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <span className="text-red-500 text-sm mt-1">{errors.price}</span>
                  )}
                </div>
              )}
              {formData.listingType === 'auction' && (
                <div className="col-span-2 p-6 bg-amber-50/30 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-600" />
                    Auction Details
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Starting Bid <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.startingBid}
                        onChange={(e) => updateFormData({ startingBid: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="0.00"
                      />
                      {errors.startingBid && (
                        <span className="text-red-500 text-sm mt-1">{errors.startingBid}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Reserve Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.reservePrice}
                        onChange={(e) => updateFormData({ reservePrice: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Minimum acceptable price"
                      />
                      {errors.reservePrice && (
                        <span className="text-red-500 text-sm mt-1">{errors.reservePrice}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Auction Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        title="Auction Duration"
                        value={formData.auctionDuration}
                        onChange={(e) => updateFormData({ auctionDuration: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNSA1TDkgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K')] bg-no-repeat bg-right-4 bg-center pr-10"
                      >
                        <option value="">Select duration</option>
                        {auctionDurations.map(duration => (
                          <option key={duration} value={duration}>{duration}</option>
                        ))}
                      </select>
                      {errors.auctionDuration && (
                        <span className="text-red-500 text-sm mt-1">{errors.auctionDuration}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Method */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Shipping Method <span className="text-red-500">*</span>
                </label>
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="font-medium">Seller Fulfilled</div>
                        <div className="text-xs text-gray-300">You ship directly to the buyer.</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Ishq Gems Logistics</div>
                        <div className="text-xs text-gray-300">Ishq handles trusted shipping.</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">In-Person</div>
                        <div className="text-xs text-gray-300">Meet the buyer via Ishq Gems.</div>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <a 
                          href="/dashboard/help#shipping-methods" 
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn more about shipping options
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  }
                  maxWidth={280}
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                </Tooltip>
              </div>
              <select
                title="Shipping Method"
                value={formData.shippingMethod}
                onChange={(e) => updateFormData({ shippingMethod: e.target.value as 'seller-fulfilled' | 'ishq-gems-logistics' | 'in-person-via-ishq-gems' })}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNSA1TDkgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K')] bg-no-repeat bg-right-4 bg-center pr-10"
              >
                {shippingMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              {errors.shippingMethod && (
                <span className="text-red-500 text-sm mt-1">{errors.shippingMethod}</span>
              )}
            </div>

            {/* Additional Comments */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Comments
              </label>
              <textarea
                value={formData.additionalComments}
                onChange={(e) => updateFormData({ additionalComments: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Any additional information about your gemstone..."
              />
            </div>

            {/* Advanced Fields Toggle */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => updateFormData({ showAdvanced: !formData.showAdvanced })}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Star className="w-4 h-4" />
                {formData.showAdvanced ? 'Hide' : 'Show'} Advanced Details
              </button>
            </div>

            {/* Advanced Fields */}
            {formData.showAdvanced && (
              <div className="mt-6 space-y-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Professional Gem Specifications</h3>
                
                {/* Certificate Details Section */}
                <div>
                  <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-primary/20">
                    Certificate Details
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Fluorescence Intensity
                      </label>
                      <SearchableSelect
                        options={FLUORESCENCE_INTENSITIES}
                        value={formData.fluorescence}
                        onChange={(value) => updateFormData({ fluorescence: value })}
                        placeholder="Select intensity"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Fluorescence Color
                      </label>
                      <SearchableSelect
                        options={FLUORESCENCE_COLORS}
                        value={formData.fluorescenceColor}
                        onChange={(value) => updateFormData({ fluorescenceColor: value })}
                        placeholder="Select color"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Polish Grade
                      </label>
                      <SearchableSelect
                        options={POLISH_SYMMETRY_GRADES}
                        value={formData.polish}
                        onChange={(value) => updateFormData({ polish: value })}
                        placeholder="Select grade"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Symmetry Grade
                      </label>
                      <SearchableSelect
                        options={POLISH_SYMMETRY_GRADES}
                        value={formData.symmetry}
                        onChange={(value) => updateFormData({ symmetry: value })}
                        placeholder="Select grade"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Girdle Description
                      </label>
                      <input
                        type="text"
                        value={formData.girdle}
                        onChange={(e) => updateFormData({ girdle: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="e.g., Thin to Medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Culet Description
                      </label>
                      <input
                        type="text"
                        value={formData.culet}
                        onChange={(e) => updateFormData({ culet: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="e.g., None, Small"
                      />
                    </div>
                  </div>
                </div>

                {/* Proportions Section */}
                <div>
                  <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-primary/20">
                    Proportions & Measurements
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Depth (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.depth}
                        onChange={(e) => updateFormData({ depth: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="60.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Table (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.table}
                        onChange={(e) => updateFormData({ table: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="58.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Crown Angle (°)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.crownAngle}
                        onChange={(e) => updateFormData({ crownAngle: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="34.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pavilion Angle (°)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.pavilionAngle}
                        onChange={(e) => updateFormData({ pavilionAngle: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="40.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Crown Height (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.crownHeight}
                        onChange={(e) => updateFormData({ crownHeight: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="15.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pavilion Depth (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.pavilionDepth}
                        onChange={(e) => updateFormData({ pavilionDepth: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="43.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Star Length (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.starLength}
                        onChange={(e) => updateFormData({ starLength: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="50.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Lower Half (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lowerHalf}
                        onChange={(e) => updateFormData({ lowerHalf: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="75.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Market Information Section */}
                <div>
                  <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-primary/20">
                    Market Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Price per Carat ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.pricePerCarat}
                        onChange={(e) => updateFormData({ pricePerCarat: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Market Trend
                      </label>
                      <SearchableSelect
                        options={MARKET_TRENDS}
                        value={formData.marketTrend}
                        onChange={(value) => updateFormData({ marketTrend: value })}
                        placeholder="Select trend"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Investment Grade
                      </label>
                      <SearchableSelect
                        options={INVESTMENT_GRADES}
                        value={formData.investmentGrade}
                        onChange={(value) => updateFormData({ investmentGrade: value })}
                        placeholder="Select grade"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        RapNet Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rapnetPrice}
                        onChange={(e) => updateFormData({ rapnetPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.discount}
                        onChange={(e) => updateFormData({ discount: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div>
                  <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-primary/20">
                    Additional Details
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Stock Number
                      </label>
                      <input
                        type="text"
                        value={formData.stockNumber}
                        onChange={(e) => updateFormData({ stockNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="e.g., RUB-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Laser Inscription
                      </label>
                      <input
                        type="text"
                        value={formData.laserInscription}
                        onChange={(e) => updateFormData({ laserInscription: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="Certificate number if inscribed"
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.memo}
                          onChange={(e) => updateFormData({ memo: e.target.checked })}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-foreground">Available on Memo</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.consignment}
                          onChange={(e) => updateFormData({ consignment: e.target.checked })}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-foreground">Consignment</span>
                      </label>
                    </div>
                  </div>
                </div>


              </div>
            )}
          </div>
        )}

        {/* Step 3: Media Upload */}
        {currentStep === 3 && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Step 3: Upload Gem Media
              </h2>
              <p className="text-muted-foreground">
                Add high-quality photos and videos to showcase your gemstone.
              </p>
            </div>

            {isEditMode ? (
              <EditMediaGallery
                existingImages={existingImages}
                existingVideos={existingVideos}
                existingLabReport={existingLabReport}
                newImages={formData.images}
                newVideos={formData.videos}
                onNewImagesChange={(images) => updateFormData({ images })}
                onNewVideosChange={(videos) => updateFormData({ videos })}
                onExistingMediaDelete={handleExistingMediaDelete}
              />
            ) : (
              <UploadGallery
                images={formData.images}
                videos={formData.videos}
                onImagesChange={(images) => updateFormData({ images })}
                onVideosChange={(videos) => updateFormData({ videos })}
              />
            )}

            {errors.images && (
              <div className="mt-4 flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.images}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Step 4: Review & Submit
              </h2>
              <p className="text-muted-foreground">
                Review your information and submit your gemstone listing.
              </p>
            </div>

            <div className="space-y-6">
              {/* Lab Report Summary */}
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-4">Lab Certificate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Report Number:</span>
                    <p className="font-medium">{formData.reportNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Lab:</span>
                    <p className="font-medium">{formData.labName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">File:</span>
                    <p className="font-medium">
                      {storedLabReport ? 
                        `${storedLabReport.filename} (${(storedLabReport.fileSize / (1024 * 1024)).toFixed(1)}MB)` : 
                        formData.labReport?.name || 'Not provided'
                      }
                    </p>
                  </div>
                  {storedLabReport && (
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <p className="font-medium text-green-600">✓ Uploaded & Processed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gem Summary */}
              <div className="bg-secondary/20 rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Gemstone Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <p className="font-medium">{formData.gemType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <p className="font-medium">{formData.weight.value} {formData.weight.unit}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Color:</span>
                    <p className="font-medium">{formData.color}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Clarity:</span>
                    <p className="font-medium">{formData.clarity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Origin:</span>
                    <p className="font-medium">{formData.origin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Treatment:</span>
                    <p className="font-medium">{formData.treatments || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Listing Information Summary */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-6 border border-amber-200 dark:border-amber-900/30">
                <h3 className="font-semibold text-foreground mb-4">Listing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Listing Type:</span>
                    <p className="font-medium capitalize">
                      {formData.listingType === 'direct-sale' ? 'Direct Sale' : 
                       formData.listingType === 'auction' ? 'Auction' : 'Not specified'}
                    </p>
                  </div>
                  {formData.listingType === 'direct-sale' && formData.price && (
                    <div>
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <p className="font-medium">${formData.price}</p>
                    </div>
                  )}
                  {formData.listingType === 'auction' && formData.startingBid && (
                    <div>
                      <span className="text-sm text-muted-foreground">Starting Bid:</span>
                      <p className="font-medium">${formData.startingBid}</p>
                    </div>
                  )}
                  {formData.listingType === 'auction' && formData.reservePrice && (
                    <div>
                      <span className="text-sm text-muted-foreground">Reserve Price:</span>
                      <p className="font-medium">${formData.reservePrice}</p>
                    </div>
                  )}
                  {formData.listingType === 'auction' && formData.auctionDuration && (
                    <div>
                      <span className="text-sm text-muted-foreground">Auction Duration:</span>
                      <p className="font-medium">{formData.auctionDuration}</p>
                    </div>
                  )}
                  {formData.shippingMethod && (
                    <div>
                      <span className="text-sm text-muted-foreground">Shipping Method:</span>
                      <p className="font-medium">
                        {shippingMethods.find(m => m.value === formData.shippingMethod)?.label || formData.shippingMethod}
                      </p>
                    </div>
                  )}
                  {formData.pricePerCarat && (
                    <div>
                      <span className="text-sm text-muted-foreground">Price per Carat:</span>
                      <p className="font-medium">${formData.pricePerCarat}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Media Summary */}
              <div className="bg-accent/5 rounded-lg p-6 border border-accent/20">
                <h3 className="font-semibold text-foreground mb-4">Media Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Images:</span>
                    <p className="font-medium">{formData.images.length} files</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Videos:</span>
                    <p className="font-medium">{formData.videos.length} files</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Lab Report:</span>
                    <p className="font-medium">{storedLabReport ? '1 file' : 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={formData.confirmAccuracy}
                  onChange={(e) => updateFormData({ confirmAccuracy: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="confirm" className="text-sm font-medium text-green-800">
                  I confirm that all the information provided is accurate and complete.
                </label>
              </div>

              {errors.confirmAccuracy && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.confirmAccuracy}</span>
                </div>
              )}

              {/* Show error if no images */}
              {(() => {
                const hasImages = isEditMode 
                  ? (existingImages.length > 0 || formData.images?.length > 0)
                  : (formData.images?.length > 0);
                                 return !hasImages && (
                   <div className="flex items-center gap-2 text-red-500">
                     <AlertCircle className="w-4 h-4" />
                     <span className="text-sm">
                       {isEditMode 
                         ? 'At least one image is required. You can keep existing images or upload new ones.'
                         : 'At least one image is required before submission'
                       }
                     </span>
                   </div>
                 );
              })()}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t border-border">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg transition-colors',
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep === 4 ? (
            <button
              onClick={handleSubmit}
              disabled={(() => {
                const hasImages = isEditMode 
                  ? (existingImages.length > 0 || formData.images?.length > 0)
                  : (formData.images?.length > 0);
                return isSubmitting || !isStepValid(4) || !hasImages;
              })()}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEditMode ? 'Update Gem' : 'Submit Gem'}
                </>
              )}
            </button>
          ) : currentStep !== 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg transition-colors',
                !isStepValid(currentStep)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
                  Next
                  <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Upload Progress Indicator */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Uploading Files...</h3>
            <UploadProgress progress={
              Object.keys(uploadProgress).length > 0 
                ? Math.round(Object.values(uploadProgress).reduce((sum, val) => sum + val, 0) / Object.keys(uploadProgress).length)
                : 0
            } />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm transition-all duration-300',
          toast.type === 'success' && 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-300',
          toast.type === 'error' && 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300',
          toast.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300'
        )}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
            {toast.type === 'info' && <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 