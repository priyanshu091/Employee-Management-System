'use client'

import { useEffect, useState } from 'react'
import { INPUT_CLASS } from '@/components/shared/FormField'
import { type ReportType } from '@/lib/mock/reports'
import type { Profile } from '@/types'

const DEPTS = ['All Departments', 'Engineering', 'Design', 'Sales', 'Marketing', 'HR']

// Dynamic: generates last 12 months
function getMonthOptions() {
  const opts: { label: string; month: number; year: number }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push({
      label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    })
  }
  return opts
}

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
  const monthOptions = getMonthOptions()
  const [employees, setEmployees] = useState<Profile[]>([])

  useEffect(() => {
    if (type === 'employee' || type === 'leave' || type === 'wfh') {
      fetch('/api/employees')
        .then((r) => r.json())
        .then((json) => setEmployees(json.data ?? []))
        .catch(console.error)
    }
  }, [type])

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
            <option value="all">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
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

  if (type === 'leave' || type === 'wfh') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelClass}>Employee</label>
          <select
            value={values.employee}
            onChange={(e) => onChange('employee', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="all">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
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

  // monthly | late — show month picker + department
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelClass}>Month</label>
        <select
          value={`${values.year}-${String(values.month).padStart(2, '0')}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-')
            onChange('year', Number(y))
            onChange('month', Number(m))
          }}
          className={INPUT_CLASS}
        >
          {monthOptions.map((o) => (
            <option
              key={`${o.year}-${o.month}`}
              value={`${o.year}-${String(o.month).padStart(2, '0')}`}
            >
              {o.label}
            </option>
          ))}
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
