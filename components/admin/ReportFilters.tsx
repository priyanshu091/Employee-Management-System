'use client'

import { INPUT_CLASS } from '@/components/shared/FormField'
import { EMPLOYEE_OPTIONS, type ReportType } from '@/lib/mock/reports'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS  = [2025, 2026]
const DEPTS  = ['All Departments', 'Engineering', 'Design', 'Sales', 'Marketing', 'HR']

export interface ReportFilterValues {
  date: string
  month: number
  year: number
  department: string
  employee: string
  startDate: string
  endDate: string
}

interface ReportFiltersProps {
  type: ReportType
  values: ReportFilterValues
  onChange: (key: keyof ReportFilterValues, value: string | number) => void
}

export default function ReportFilters({ type, values, onChange }: ReportFiltersProps) {
  const labelClass = 'block text-[11px] font-medium text-[#6B7280] mb-1 uppercase tracking-wide'

  if (type === 'daily') {
    return (
      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          value={values.date}
          onChange={(e) => onChange('date', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
    )
  }

  if (type === 'employee') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelClass}>Employee</label>
          <select
            value={values.employee}
            onChange={(e) => onChange('employee', e.target.value)}
            className={INPUT_CLASS}
          >
            {EMPLOYEE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            value={values.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input
            type="date"
            value={values.endDate}
            min={values.startDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    )
  }

  // monthly | leave | wfh | late
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelClass}>Month</label>
        <select
          value={values.month}
          onChange={(e) => onChange('month', Number(e.target.value))}
          className={INPUT_CLASS}
        >
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Year</label>
        <select
          value={values.year}
          onChange={(e) => onChange('year', Number(e.target.value))}
          className={INPUT_CLASS}
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Department</label>
        <select
          value={values.department}
          onChange={(e) => onChange('department', e.target.value)}
          className={INPUT_CLASS}
        >
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}
