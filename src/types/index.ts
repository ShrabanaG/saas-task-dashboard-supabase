export type Role = 'admin' | 'member'

export type Profile = {
  id: string
  email: string
  role: Role
  full_name: string | null
  created_at: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  position: number
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}