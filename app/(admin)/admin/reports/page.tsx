'use client'

import { useState } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import ReportTypeSelector from '@/components/admin/ReportTypeSelector'
import ReportFilters, { type ReportFilterValues } from '@/components/admin/ReportFilters'
import ReportPreview from '@/components/admin/ReportPreview'
import { getMockRows, REPORT_OPTIONS, type ReportType, type ReportRow } from '@/lib/mock/reports'

const DEFAULT_FILTERS: ReportFilterValues = {
  date:        '',
  month:       6,   // July (0-indexed)
  year:        2026,
  department:  'All Departments',
  employee:    'all',
  startDate:   '',
  endDate:     '',
}

function buildLabel(type: ReportType, filters: ReportFilterValues): string {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const name = REPORT_OPTIONS.find((o) => o.type === type)?.label ?? ''

  switch (type) {
    case 'daily':
      return `${name} — ${filters.date || 'Selected date'}`
    case 'employee':
      return `${name} — ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`
    default:
      return `${name} — ${MONTHS[filters.month]} ${filters.year}`
  }
}

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [filters, setFilters]           = useState<ReportFilterValues>(DEFAULT_FILTERS)
  const [generated, setGenerated]       = useState(false)
  const [generating, setGenerating]     = useState(false)
  const [reportRows, setReportRows]     = useState<ReportRow[]>([])
  const [reportLabel, setReportLabel]   = useState('')

  const handleTypeChange = (type: ReportType) => {
    setSelectedType(type)
    setGenerated(false)
  }

  const handleFilterChange = (key: keyof ReportFilterValues, value: string | number) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setGenerated(false)
  }

  const handleGenerate = async () => {
    if (!selectedType) return
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 800))
    setReportRows(getMockRows(selectedType))
    setReportLabel(buildLabel(selectedType, filters))
    setGenerated(true)
    setGenerating(false)
  }

  function Spinner() {
    return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  }

  return (
    <>
      <AdminTopbar title="Reports" />

      <main className="flex-1 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

          {/* Left: Config panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#111827] mb-4">Configure report</h2>

            <ReportTypeSelector
              selected={selectedType}
              onChange={handleTypeChange}
            />

            {selectedType && (
              <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                <ReportFilters
                  type={selectedType}
                  values={filters}
                  onChange={handleFilterChange}
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedType || generating}
              className="w-full mt-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? <Spinner /> : 'Generate report'}
            </button>
          </div>

          {/* Right: Preview */}
          <ReportPreview
            type={selectedType}
            rows={reportRows}
            label={reportLabel}
            generated={generated}
          />
        </div>
      </main>
    </>
  )
}
