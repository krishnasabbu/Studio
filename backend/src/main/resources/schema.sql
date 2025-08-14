CREATE TABLE IF NOT EXISTS workflows (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  description VARCHAR(1000),
  version VARCHAR(20),
  status VARCHAR(50),
  created_by VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodes (
  id VARCHAR(50) PRIMARY KEY,
  workflow_id VARCHAR(50),
  type VARCHAR(50),
  position_x DOUBLE,
  position_y DOUBLE,
  width DOUBLE,
  height DOUBLE,
  selected BOOLEAN,
  dragging BOOLEAN,
  stage_name VARCHAR(255),
  environment VARCHAR(255),
  parameters CLOB,
  status VARCHAR(50),
  label VARCHAR(255),
  position_abs_x DOUBLE,
  position_abs_y DOUBLE,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS edges (
  id VARCHAR(50) PRIMARY KEY,
  workflow_id VARCHAR(50),
  source VARCHAR(50),
  source_handle VARCHAR(50),
  target VARCHAR(50),
  target_handle VARCHAR(50),
  type VARCHAR(50),
  requires_approval BOOLEAN,
  approver_role VARCHAR(255),
  status VARCHAR(50),
  approval_timeout VARCHAR(50),
  auto_approve BOOLEAN,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS functionalities (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL
);

-- Create the new workflow_mappings table
-- This table links a workflow to a specific functionality.
CREATE TABLE IF NOT EXISTS workflow_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    functionality_id BIGINT NOT NULL,
    functionality_name VARCHAR(255) NOT NULL,
    functionality_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

-- Table to store custom tasks
-- The 'id' is a string generated client-side to ensure uniqueness.
-- 'created_at' and 'updated_at' are timestamps managed by the application.
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    release_number VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sql_query TEXT NOT NULL,
    assigned_workflow VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_executors (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255),
    name VARCHAR(255),
    service_id VARCHAR(255),
    type VARCHAR(50),
    children_id VARCHAR(255),
    status VARCHAR(50),
    error_code VARCHAR(255),
    error_message TEXT,
    error_stack_trace TEXT,
    approved_by VARCHAR(255),
    approval_comments TEXT,
    assigned_approver VARCHAR(255),
    approval_deadline TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS execution_log (
    id VARCHAR(255) PRIMARY KEY,
    timestamp TIMESTAMP,
    step_id VARCHAR(255),
    step_name VARCHAR(255),
    level VARCHAR(50),
    message TEXT,
    details TEXT,
    performed_by VARCHAR(255),
    executor_id VARCHAR(255),
    service_id VARCHAR(255)
);

