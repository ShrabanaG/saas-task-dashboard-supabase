import { supabase } from './supabase'
import type { Task, TaskPriority, TaskStatus } from '../types'

/** List the signed-in user's tasks, ordered for board rendering. */
export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw error
  return data as Task[]
}

/** Create a task in a given column. `position` controls its order in that column. */
export async function createTask(input: {
  title: string
  status: TaskStatus
  priority?: TaskPriority
  position: number
}): Promise<Task> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      status: input.status,
      priority: input.priority ?? 'medium',
      position: input.position,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data as Task
}

/** Patch any editable field — used for inline title edits, priority, and drag moves. */
export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'position'>>,
): Promise<void> {
  const { error } = await supabase.from('tasks').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
