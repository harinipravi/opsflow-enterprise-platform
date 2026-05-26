CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
);

CREATE TABLE IF NOT EXISTS workflows (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  status ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft',
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  owner VARCHAR(120) NULL,
  trigger_type VARCHAR(80) NOT NULL DEFAULT 'manual',
  last_run_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY workflows_status_index (status),
  KEY workflows_priority_index (priority)
);

CREATE TABLE IF NOT EXISTS activities (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  workflow_id INT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  description VARCHAR(500) NULL,
  activity_type ENUM('task', 'sla_alert', 'job', 'workflow', 'report') NOT NULL DEFAULT 'workflow',
  status ENUM('pending', 'completed', 'failed', 'resolved', 'queued') NOT NULL DEFAULT 'completed',
  tone ENUM('success', 'info', 'warning', 'error') NOT NULL DEFAULT 'info',
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY activities_workflow_id_index (workflow_id),
  KEY activities_type_status_index (activity_type, status),
  KEY activities_occurred_at_index (occurred_at),
  CONSTRAINT activities_workflow_id_fk
    FOREIGN KEY (workflow_id)
    REFERENCES workflows (id)
    ON DELETE SET NULL
);

INSERT IGNORE INTO workflows
  (id, name, description, status, priority, owner, trigger_type, last_run_at)
VALUES
  (1, 'Daily inventory sync', 'Sync stock levels between warehouse and storefront systems.', 'active', 'high', 'Operations', 'scheduled', NOW() - INTERVAL 1 HOUR),
  (2, 'Purchase approval routing', 'Route procurement requests to the right approval queue.', 'paused', 'medium', 'Finance', 'event', NOW() - INTERVAL 4 HOUR),
  (3, 'Customer onboarding', 'Create accounts, tasks, and welcome messages for new customers.', 'active', 'medium', 'Customer Success', 'webhook', NOW() - INTERVAL 2 HOUR),
  (4, 'Monthly compliance report', 'Prepare operational compliance reports for review.', 'draft', 'low', 'Compliance', 'manual', NULL),
  (5, 'Payment reconciliation', 'Reconcile payment batches and flag mismatches.', 'active', 'high', 'Finance', 'scheduled', NOW() - INTERVAL 30 MINUTE);

INSERT IGNORE INTO activities
  (id, workflow_id, title, description, activity_type, status, tone, occurred_at)
VALUES
  (1, 1, 'Inventory sync completed', 'Warehouse stock levels were synced successfully.', 'workflow', 'completed', 'success', NOW() - INTERVAL 1 HOUR),
  (2, 2, 'Approval workflow assigned', 'A procurement request was assigned to Finance.', 'task', 'pending', 'info', NOW() - INTERVAL 2 HOUR),
  (3, 4, 'Nightly report generated', 'Operations summary report is ready for review.', 'report', 'completed', 'success', NOW() - INTERVAL 3 HOUR),
  (4, 5, 'Payment reconciliation queued', 'A payment batch is waiting for processing.', 'job', 'queued', 'warning', NOW() - INTERVAL 4 HOUR),
  (5, 3, 'Customer onboarding task pending', 'A welcome email approval is waiting for review.', 'task', 'pending', 'info', NOW() - INTERVAL 5 HOUR),
  (6, 5, 'Payment retry job failed', 'A retry job failed after reaching the maximum attempt count.', 'job', 'failed', 'error', NOW() - INTERVAL 6 HOUR),
  (7, 1, 'Inventory SLA threshold reached', 'Inventory sync latency crossed the configured SLA threshold.', 'sla_alert', 'pending', 'warning', NOW() - INTERVAL 7 HOUR),
  (8, 3, 'Onboarding SLA resolved', 'The onboarding processing delay was resolved.', 'sla_alert', 'resolved', 'success', NOW() - INTERVAL 1 DAY);
