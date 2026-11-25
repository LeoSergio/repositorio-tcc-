import { CLASSE_STATUS, ROTULO_STATUS } from '@/lib/status'

export default function StatusBadge({ status }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${CLASSE_STATUS[status] ?? 'bg-gray-200 text-gray-800'}`}
    >
      {ROTULO_STATUS[status] ?? status}
    </span>
  )
}
