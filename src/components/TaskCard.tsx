import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskPriority } from '../types'

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-500',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-600',
}
const PRIORITY_ORDER: TaskPriority[] = ['low', 'medium', 'high']

interface Props {
  task: Task
  /** true when rendered inside the DragOverlay (the card that follows the cursor) */
  overlay?: boolean
  onEdit?: (id: string, patch: { title?: string; priority?: TaskPriority }) => void
  onDelete?: (id: string) => void
}

export function TaskCard({ task, overlay, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  const style = { transform: CSS.Transform.toString(transform), transition }

  const saveTitle = () => {
    const next = title.trim()
    if (next && next !== task.title) onEdit?.(task.id, { title: next })
    else setTitle(task.title)
    setEditing(false)
  }

  const cyclePriority = () => {
    const i = PRIORITY_ORDER.indexOf(task.priority)
    onEdit?.(task.id, { priority: PRIORITY_ORDER[(i + 1) % PRIORITY_ORDER.length] })
  }

  // Only the card body carries the drag listeners — and not while editing,
  // so the edit/delete/priority controls and the textarea stay clickable.
  const dragProps = editing ? {} : { ...attributes, ...listeners }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition
        ${isDragging ? 'opacity-40' : ''} ${overlay ? 'rotate-3 shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div {...dragProps} className={editing ? 'flex-1' : 'flex-1 cursor-grab active:cursor-grabbing'}>
          {editing ? (
            <textarea
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveTitle() }
                if (e.key === 'Escape') { setTitle(task.title); setEditing(false) }
              }}
              className="w-full resize-none rounded-md border border-brand bg-white p-1 text-sm text-slate-800 outline-none"
              rows={2}
            />
          ) : (
            <p className="text-sm leading-snug text-slate-800">{task.title}</p>
          )}
        </div>

        {!overlay && !editing && (
          <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit task"
              className="rounded p-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(task.id)}
              aria-label="Delete task"
              className="rounded p-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              Del
            </button>
          </div>
        )}
      </div>

      <button
        onClick={cyclePriority}
        disabled={overlay}
        title="Click to change priority"
        className={`mt-2 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLE[task.priority]}`}
      >
        {task.priority}
      </button>
    </div>
  )
}
