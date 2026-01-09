'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { CSVImportResult } from '@/types'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<CSVImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setError(null)

    try {
      const result = await apiClient.importBookingsCSV(file)
      setResult(result)

      if (result.success > 0) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import bookings')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setError(null)
    onClose()
  }

  const downloadTemplate = () => {
    const csvContent = `passengerName,passengerPhone,numberOfPassengers,pickupLocation,pickupDateTime,dropoffLocation,flightNumber
John Doe,+1234567890,2,Airport Terminal 1,2026-01-25T14:30:00,Hotel Plaza,BA123
Jane Smith,+9876543210,1,Hotel Central,2026-01-26T09:00:00,Airport Terminal 2,EK456
Michael Brown,+447700900123,4,Heathrow Airport T5,2026-01-27T16:00:00,Hilton London Paddington,LH789`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bookings_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-light border-b px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="h5 mb-0 font-semibold text-gray-900">Import Bookings from CSV</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a CSV file to import multiple bookings at once
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1 text-sm">Need a template?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Download our CSV template with example data to get started
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Download CSV Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors"
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1 text-sm">Import Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`bg-white p-2 rounded-lg shadow-sm ${
                  result.failed === 0 ? 'border border-green-100' : 'border border-yellow-100'
                }`}>
                  <CheckCircle className={`h-4 w-4 ${
                    result.failed === 0 ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 text-sm ${
                    result.failed === 0 ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    Import Results
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-700">
                      ✓ {result.success} booking{result.success !== 1 ? 's' : ''} imported successfully
                    </p>
                    {result.failed > 0 && (
                      <p className="text-red-700">
                        ✗ {result.failed} booking{result.failed !== 1 ? 's' : ''} failed
                      </p>
                    )}
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">Errors:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <div key={index} className="text-xs text-gray-700 bg-white rounded p-2">
                            <span className="font-medium">Row {error.row}:</span> {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {importing && (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {importing ? 'Importing...' : 'Import Bookings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
