import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '../types'
import { createTask, deleteTask, listTasks, updateTask } from '../lib/tasksApi'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'in_progress', title: 'In progress' },
  { id: 'done', title: 'Done' },
]

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    listTasks()
      .then(setTasks)
      .catch(e => setError(e.message ?? 'Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  const sensors = useSensors(
    // small distance so clicking the edit/delete buttons doesn't start a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // group tasks by column, preserving their array order
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] }
    for (const t of tasks) map[t.status].push(t)
    return map
  }, [tasks])

  const activeTask = activeId ? tasks.find(t => t.id === activeId) ?? null : null
  const reload = () => listTasks().then(setTasks).catch(() => {})

  // which column does this id belong to? (id is either a task id or a column id)
  const columnOf = (id: string): TaskStatus | null => {
    if (id === 'todo' || id === 'in_progress' || id === 'done') return id
    return tasks.find(t => t.id === id)?.status ?? null
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  // moves a card into another column live, as you drag across the boundary
  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const activeCol = columnOf(active.id as string)
    const overCol = columnOf(over.id as string)
    if (!activeCol || !overCol || activeCol === overCol) return

    setTasks(prev => {
      const moving = prev.find(t => t.id === active.id)
      if (!moving) return prev
      const without = prev.filter(t => t.id !== active.id)
      const overIndex = without.findIndex(t => t.id === over.id)
      const updated = { ...moving, status: overCol }
      // dropped over the empty column area → append; else insert at the hovered card
      if (overIndex === -1) return [...without, updated]
      return [...without.slice(0, overIndex), updated, ...without.slice(overIndex)]
    })
  }

  // finalizes order within the destination column and persists the moved card
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return
    const overCol = columnOf(over.id as string)
    if (!overCol) return

    setTasks(prev => {
      const activeIndex = prev.findIndex(t => t.id === active.id)
      if (activeIndex === -1) return prev

      let next = prev
      const overIndex = prev.findIndex(t => t.id === over.id)
      if (overIndex !== -1 && activeIndex !== overIndex) {
        next = arrayMove(prev, activeIndex, overIndex)
      }
      next = next.map(t => (t.id === active.id ? { ...t, status: overCol } : t))

      // fractional position between the new neighbours — one DB write
      const colTasks = next.filter(t => t.status === overCol)
      const idx = colTasks.findIndex(t => t.id === active.id)
      const before = colTasks[idx - 1]?.position
      const after = colTasks[idx + 1]?.position
      const position =
        before !== undefined && after !== undefined ? (before + after) / 2
        : after !== undefined ? after - 1
        : before !== undefined ? before + 1
        : 0

      next = next.map(t => (t.id === active.id ? { ...t, position } : t))
      updateTask(active.id as string, { status: overCol, position }).catch(reload)
      return next
    })
  }

  async function handleAdd(status: TaskStatus, title: string) {
    const colTasks = grouped[status]
    const position = (colTasks[colTasks.length - 1]?.position ?? 0) + 1
    try {
      const created = await createTask({ title, status, position })
      setTasks(prev => [...prev, created])
    } catch (e) {
      setError((e as Error).message)
    }
  }

  // status dropdown on a card → move it to the end of the chosen column
  async function handleStatusChange(id: string, status: TaskStatus) {
    const moving = tasks.find(t => t.id === id)
    if (!moving || moving.status === status) return
    const destTasks = tasks.filter(t => t.status === status)
    const position = (destTasks[destTasks.length - 1]?.position ?? 0) + 1
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status, position } : t))) // optimistic
    try { await updateTask(id, { status, position }) } catch { reload() }
  }

  async function handleEdit(id: string, patch: { title?: string; priority?: Task['priority'] }) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t))) // optimistic
    try { await updateTask(id, patch) } catch { reload() }
  }

  async function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id)) // optimistic
    try { await deleteTask(id) } catch { reload() }
  }

  if (loading) return <p className="text-slate-400">Loading tasks…</p>
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={grouped[col.id]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onChangeStatus={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}
