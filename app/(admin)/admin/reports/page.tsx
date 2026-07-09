'use client'

import { useState } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import ReportTypeSelector from '@/components/admin/ReportTypeSelector'
import ReportFilters, { type ReportFilterValues } from '@/components/admin/ReportFilters'
import ReportPreview from '@/components/admin/ReportPreview'
import { REPORT_OPTIONS, type ReportType } from '@/lib/mock/reports'
import { useToast } from '@/components/shared/Toast'

// ── Dynamic month/year generator — no hardcoded dates ────────────────────────
export function generateMonthOptions() {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    })
  }
  return options
}

const now = new Date()

const DEFAULT_FILTERS: ReportFilterValues = {
  date:       '',
  month:      now.getMonth() + 1,
  year:       now.getFullYear(),
  department: 'All Departments',
  employee:   'all',
  startDate:  '',
  endDate:    '',
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
      return `${name} — ${MONTHS[filters.month - 1]} ${filters.year}`
  }
}

function buildQueryParams(type: ReportType, filters: ReportFilterValues): URLSearchParams {
  const p = new URLSearchParams()
  switch (type) {
    case 'daily':
      if (filters.date) p.set('date', filters.date)
      break
    case 'monthly':
    case 'late':
      p.set('month', String(filters.month))
      p.set('year', String(filters.year))
      if (filters.department !== 'All Departments') p.set('department', filters.department)
      break
    case 'employee':
      if (filters.employee !== 'all') p.set('employee_id', filters.employee)
      if (filters.startDate) p.set('start_date', filters.startDate)
      if (filters.endDate) p.set('end_date', filters.endDate)
      break
    case 'leave':
    case 'wfh':
      if (filters.employee !== 'all') p.set('employee_id', filters.employee)
      if (filters.startDate) p.set('start_date', filters.startDate)
      if (filters.endDate) p.set('end_date', filters.endDate)
      break
  }
  return p
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function AdminReportsPage() {
  const { showToast } = useToast()
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [filters, setFilters]           = useState<ReportFilterValues>(DEFAULT_FILTERS)
  const [generated, setGenerated]       = useState(false)
  const [generating, setGenerating]     = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportRows, setReportRows]     = useState<any[]>([])
  const [reportLabel, setReportLabel]   = useState('')

  const handleTypeChange = (type: ReportType) => {
    setSelectedType(type)
    setGenerated(false)
    setReportRows([])
  }

  const handleFilterChange = (key: keyof ReportFilterValues, value: string | number) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setGenerated(false)
  }

  const handleGenerate = async () => {
    if (!selectedType) return

    // Validate required fields
    if (selectedType === 'daily' && !filters.date) {
      showToast('Please select a date.', 'error')
      return
    }
    if ((selectedType === 'employee' || selectedType === 'leave' || selectedType === 'wfh') && (!filters.startDate || !filters.endDate)) {
      showToast('Please select a start date and end date.', 'error')
      return
    }

    setGenerating(true)
    try {
      const params = buildQueryParams(selectedType, filters)
      const res = await fetch(`/api/reports/${selectedType}?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        showToast(json.error ?? 'Failed to generate report.', 'error')
        return
      }

      setReportRows(json.data ?? [])
      setReportLabel(buildLabel(selectedType, filters))
      setGenerated(true)
    } catch {
      showToast('Failed to generate report.', 'error')
    } finally {
      setGenerating(false)
    }
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
