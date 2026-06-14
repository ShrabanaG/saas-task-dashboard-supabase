import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskStatus } from '../types'

const STATUS_PILL: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

interface Props {
  task: Task
  /** true when rendered inside the DragOverlay (the card that follows the cursor) */
  overlay?: boolean
  onEdit?: (id: string, patch: { title?: string }) => void
  onChangeStatus?: (id: string, status: TaskStatus) => void
  onDelete?: (id: string) => void
}

export function TaskCard({ task, overlay, onEdit, onChangeStatus, onDelete }: Props) {
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

  // Only the card body carries the drag listeners — and not while editing,
  // so the edit/delete/status controls and the textarea stay clickable.
  const dragProps = editing ? {} : { ...attributes, ...listeners }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border p-3 transition
        ${task.status === 'done' ? 'border-brand-light bg-brand-surface' : 'border-slate-200 bg-white shadow-sm'}
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
            <p
              className={`text-sm leading-snug ${
                task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'
              }`}
            >
              {task.title}
            </p>
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

      {!overlay && onChangeStatus && (
        <div className="mt-3 flex justify-end">
          <div className={`relative inline-flex items-center rounded-full ${STATUS_PILL[task.status]}`}>
            <select
              value={task.status}
              onChange={e => onChangeStatus(task.id, e.target.value as TaskStatus)}
              onPointerDown={e => e.stopPropagation()}
              aria-label="Move task to"
              className="cursor-pointer appearance-none bg-transparent py-1 pl-3 pr-7 text-xs font-medium text-inherit outline-none"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
