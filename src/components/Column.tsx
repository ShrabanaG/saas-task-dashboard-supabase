import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-amber-400',
  done: 'bg-brand',
}

interface Props {
  id: TaskStatus
  title: string
  tasks: Task[]
  onAdd: (status: TaskStatus, title: string) => void
  onEdit: (id: string, patch: { title?: string; priority?: Task['priority'] }) => void
  onDelete: (id: string) => void
}

export function Column({ id, title, tasks, onAdd, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')

  const submit = () => {
    const value = text.trim()
    if (value) onAdd(id, value)
    setText('')
    setAdding(false)
  }

  return (
    <section className="flex flex-col rounded-2xl bg-slate-50 p-3">
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${COLUMN_ACCENT[id]}`} />
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-1 flex-col gap-2 rounded-xl p-1 transition ${isOver ? 'bg-brand-light/60' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <p className="px-2 py-6 text-center text-xs text-slate-400">Drop tasks here</p>
        )}
      </div>

      {adding ? (
        <div className="mt-2">
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
              if (e.key === 'Escape') { setText(''); setAdding(false) }
            }}
            placeholder="What needs doing?"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            rows={2}
          />
          <div className="mt-1 flex gap-2">
            <button onClick={submit} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
              Add
            </button>
            <button onClick={() => { setText(''); setAdding(false) }} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <span className="text-base leading-none">+</span> Add task
        </button>
      )}
    </section>
  )
}
