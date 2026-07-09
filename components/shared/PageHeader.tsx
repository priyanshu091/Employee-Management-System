interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 flex items-center justify-between mb-4">
      <div>
        <h1 className="text-[15px] font-semibold text-[#111827]">{title}</h1>
        {subtitle && (
          <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
