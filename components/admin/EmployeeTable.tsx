'use client'

import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/components/shared/Toast'
import type { Profile } from '@/types'

const PAGE_SIZE = 10

interface EmployeeTableProps {
  employees: Profile[]
  onStatusToggle: (id: string, newStatus: 'active' | 'inactive') => void
  onEdit: (employee: Profile) => void
}

function formatJoiningDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EmployeeTable({ employees, onStatusToggle, onEdit }: EmployeeTableProps) {
  const { showToast } = useToast()
  const [page, setPage] = useState(1)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Profile | null>(null)

  const totalPages = Math.ceil(employees.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const pageRows = employees.slice(start, start + PAGE_SIZE)

  const handleDeactivateConfirm = () => {
    if (!deactivateTarget) return
    const newStatus = deactivateTarget.status === 'active' ? 'inactive' : 'active'
    onStatusToggle(deactivateTarget.id, newStatus)
    showToast(
      `${deactivateTarget.full_name} ${newStatus === 'inactive' ? 'deactivated' : 'activated'}.`,
      newStatus === 'inactive' ? 'error' : 'success'
    )
    setDeactivateTarget(null)
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl py-16 text-center">
        <p className="text-[14px] font-medium text-[#374151]">No employees found</p>
        <p className="text-[13px] text-[#6B7280] mt-1">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Employee', 'ID', 'Department', 'Designation', 'Joining Date', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors duration-150"
                >
                  {/* Employee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#111827] truncate">{emp.full_name}</p>
                        <p className="text-[11px] text-[#6B7280] truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[#6B7280] font-mono">{emp.employee_id}</span>
                  </td>
                  {/* Department */}
                  <td className="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap">{emp.department ?? '—'}</td>
                  {/* Designation */}
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">{emp.designation ?? '—'}</td>
                  {/* Joining Date */}
                  <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{formatJoiningDate(emp.joining_date)}</td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      emp.status === 'active'
                        ? 'bg-[#F0FDF4] text-[#16A34A]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === emp.id ? null : emp.id)}
                          className="p-1 text-[#9CA3AF] hover:text-[#6B7280] rounded transition-colors duration-150"
                          aria-label="More options"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpenId === emp.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-lg py-1 min-w-[140px] z-20">
                              <button
                                onClick={() => {
                                  setMenuOpenId(null)
                                  onEdit(emp)
                                }}
                                className="w-full text-left px-3 py-2 text-[13px] text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setMenuOpenId(null)
                                  setDeactivateTarget(emp)
                                }}
                                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#F3F4F6] transition-colors ${
                                  emp.status === 'active' ? 'text-[#DC2626]' : 'text-[#16A34A]'
                                }`}
                              >
                                {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#F3F4F6]">
          <p className="text-[12px] text-[#6B7280]">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, employees.length)} of {employees.length} employees
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Deactivate confirm dialog */}
      <ConfirmDialog
        open={!!deactivateTarget}
        title={deactivateTarget?.status === 'active' ? 'Deactivate employee?' : 'Activate employee?'}
        message={`${deactivateTarget?.full_name} will ${deactivateTarget?.status === 'active' ? 'lose access to the system' : 'regain access to the system'}.`}
        confirmLabel={deactivateTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        confirmDanger={deactivateTarget?.status === 'active'}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />
    </>
  )
}
