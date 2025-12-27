-- Project Phases Table
CREATE TABLE IF NOT EXISTS project_phases (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  budget DECIMAL(15, 2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Project Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id VARCHAR REFERENCES project_phases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  assigned_to VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_hours DECIMAL(8, 2),
  actual_hours DECIMAL(8, 2),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Project Time Entries Table
CREATE TABLE IF NOT EXISTS project_time_entries (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id VARCHAR REFERENCES project_tasks(id) ON DELETE SET NULL,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  hours DECIMAL(8, 2) NOT NULL,
  description TEXT,
  billable BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(15, 2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_phase_id ON project_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_project_id ON project_time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_task_id ON project_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_user_id ON project_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_date ON project_time_entries(date);
