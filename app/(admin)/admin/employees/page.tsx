'use client'

import { useState, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import AdminTopbar from '@/components/admin/AdminTopbar'
import SearchFilterBar from '@/components/admin/SearchFilterBar'
import EmployeeTable from '@/components/admin/EmployeeTable'
import AddEmployeeDrawer from '@/components/admin/AddEmployeeDrawer'
import { useToast } from '@/components/shared/Toast'
import { getAllEmployees, createEmployee, updateEmployee } from '@/lib/api/admin'
import { DEPARTMENTS } from '@/lib/mock/employees'
import type { Profile } from '@/types'

const DEPT_OPTIONS = [
  { value: 'all', label: 'All departments' },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function AdminEmployeesPage() {
  const { showToast } = useToast()
  
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('all')
  const [status, setStatus] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Profile | null>(null)

  const { data, isLoading: loading, mutate } = useSWR('allEmployees', getAllEmployees)
  const employees = data || []
  
  const nextId = `EMP-${String(employees.length + 1).padStart(3, '0')}`

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || e.full_name.toLowerCase().includes(q)
        || e.employee_id.toLowerCase().includes(q)
        || e.email.toLowerCase().includes(q)
      const matchDept = dept === 'all' || e.department === dept
      const matchStatus = status === 'all' || e.status === status
      return matchSearch && matchDept && matchStatus
    })
  }, [employees, search, dept, status])

  const handleAdd = useCallback(async (data: {
    fullName: string
    email: string
    phone: string
    department: string
    designation: string
    joiningDate: string
  }, isEdit: boolean, editId?: string): Promise<boolean> => {
    if (isEdit && editId) {
      const res = await updateEmployee(editId, {
        full_name: data.fullName,
        phone: data.phone || undefined,
        department: data.department,
        designation: data.designation,
        joining_date: data.joiningDate,
      })
      if (res.error) {
        showToast(res.error, 'error')
        return false
      }
      mutate(
        (prev = []) => prev.map((e) => e.id === editId ? { ...e, ...res.data } : e),
        false
      )
      showToast(`${data.fullName} updated successfully.`, 'success')
      return true
    } else {
      const res = await createEmployee({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        department: data.department,
        designation: data.designation,
        joining_date: data.joiningDate,
      })
      if (res.error) {
        showToast(res.error, 'error')
        return false
      }
      mutate((prev = []) => [res.data, ...prev], false)
      showToast(`${data.fullName} added successfully.`, 'success')
      return true
    }
  }, [showToast])

  const handleStatusToggle = useCallback(async (id: string, newStatus: 'active' | 'inactive') => {
    const res = await updateEmployee(id, { status: newStatus })
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    mutate(
      (prev = []) => prev.map((e) => e.id === id ? { ...e, status: newStatus } : e),
      false
    )
  }, [showToast, mutate])

  return (
    <>
      <AdminTopbar
        title="Employees"
        action={
          <button
            onClick={() => {
              setEditTarget(null)
              setDrawerOpen(true)
            }}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
          >
            + Add employee
          </button>
        }
      />

      <main className="flex-1 p-5">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, ID or email..."
          selects={[
            { value: dept, onChange: setDept, options: DEPT_OPTIONS, ariaLabel: 'Department' },
            { value: status, onChange: setStatus, options: STATUS_OPTIONS, ariaLabel: 'Status' },
          ]}
          className="mb-4"
        />

        {loading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-[#F3F4F6] last:border-0 bg-[#F3F4F6] animate-pulse" />
            ))}
          </div>
        ) : (
          <EmployeeTable
            employees={filtered}
            onStatusToggle={handleStatusToggle}
            onEdit={(emp) => {
              setEditTarget(emp)
              setDrawerOpen(true)
            }}
          />
        )}
      </main>

      <AddEmployeeDrawer
        open={drawerOpen}
        nextEmployeeId={nextId}
        editTarget={editTarget}
        onClose={() => {
          setDrawerOpen(false)
          setEditTarget(null)
        }}
        onSubmit={handleAdd}
      />
    </>
  )
}
