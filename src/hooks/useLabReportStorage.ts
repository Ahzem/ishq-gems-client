import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import type { StoredLabReport, UseLabReportStorageReturn } from '@/types'

export function useLabReportStorage(): UseLabReportStorageReturn {
  const [storedLabReport, setStoredLabReport] = useLocalStorage<StoredLabReport | null>('labReportUrl', null)

  const saveLabReport = useCallback((report: StoredLabReport) => {
    setStoredLabReport(report)
  }, [setStoredLabReport])

  const clearLabReport = useCallback(() => {
    setStoredLabReport(null)
  }, [setStoredLabReport])

  const isExpired = useCallback((report: StoredLabReport) => {
    const EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    return Date.now() - report.uploadedAt > EXPIRY_TIME
  }, [])

  const replaceLabReport = useCallback(async (
    newReport: StoredLabReport, 
    deleteOldCallback?: (oldS3Key: string) => Promise<void>
  ) => {
    // If there's an existing report and a delete callback, delete the old one first
    if (storedLabReport?.s3Key && deleteOldCallback) {
      try {
        await deleteOldCallback(storedLabReport.s3Key)
      } catch (error) {
        console.warn('Failed to delete old lab report:', error)
        // Continue with saving new report even if deletion fails
      }
    }
    
    // Save the new report
    setStoredLabReport(newReport)
  }, [storedLabReport, setStoredLabReport])

  return {
    storedLabReport,
    saveLabReport,
    clearLabReport,
    isExpired,
    replaceLabReport
  }
}

export default useLabReportStorage 