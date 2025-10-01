'use client'

import { useEffect } from 'react'

interface PageTitleProps {
  title: string
}

export default function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    // Set the page title in the header
    const headerTitle = document.querySelector('[data-page-title]')
    if (headerTitle) {
      headerTitle.textContent = title
    }
  }, [title])

  return null
} 