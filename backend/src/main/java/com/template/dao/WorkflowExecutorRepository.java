package com.template.dao;

import com.template.model.ExecutionStatus;
import com.template.model.ExecutorType;
import com.template.model.WorkflowExecutor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class WorkflowExecutorRepository {

    private final JdbcTemplate jdbcTemplate;

    public WorkflowExecutorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Saves a single WorkflowExecutor to the database.
     * If an executor with the same ID already exists, it is updated.
     * Otherwise, a new record is inserted.
     * @param executor The WorkflowExecutor object to save.
     */
    public void save(WorkflowExecutor executor) {
        // SQL statement to check for an existing record
        String checkSql = "SELECT count(*) FROM workflow_executors WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, executor.getId());

        if (count != null && count > 0) {
            // Update existing record
            update(executor);
        } else {
            // Insert new record
            insert(executor);
        }
    }

    /**
     * Inserts a new WorkflowExecutor record into the database.
     * @param executor The WorkflowExecutor object to insert.
     */
    private void insert(WorkflowExecutor executor) {
        jdbcTemplate.update(
                "INSERT INTO workflow_executors (id, workflow_id, service_id, type, children_id, status, error_code, error_message, " +
                        "error_stack_trace, approved_by, approval_comments, assigned_approver, approval_deadline, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                executor.getId(),
                executor.getWorkflowId(),
                executor.getServiceId(),
                executor.getType().name(),
                executor.getChildrenId(),
                executor.getStatus().name(),
                executor.getErrorCode(),
                executor.getErrorMessage(),
                executor.getErrorStackTrace(),
                executor.getApprovedBy(),
                executor.getApprovalComments(),
                executor.getAssignedApprover(),
                executor.getApprovalDeadline() != null ? Timestamp.valueOf(executor.getApprovalDeadline()) : null,
                Timestamp.valueOf(executor.getCreatedAt()),
                Timestamp.valueOf(executor.getUpdatedAt())
        );
    }

    /**
     * Updates an existing WorkflowExecutor record in the database.
     * @param executor The WorkflowExecutor object with updated information.
     */
    private void update(WorkflowExecutor executor) {
        jdbcTemplate.update(
                "UPDATE workflow_executors SET workflow_id = ?, service_id = ?, type = ?, children_id = ?, status = ?, " +
                        "error_code = ?, error_message = ?, error_stack_trace = ?, approved_by = ?, approval_comments = ?, " +
                        "assigned_approver = ?, approval_deadline = ?, updated_at = ? WHERE id = ?",
                executor.getWorkflowId(),
                executor.getServiceId(),
                executor.getType().name(),
                executor.getChildrenId(),
                executor.getStatus().name(),
                executor.getErrorCode(),
                executor.getErrorMessage(),
                executor.getErrorStackTrace(),
                executor.getApprovedBy(),
                executor.getApprovalComments(),
                executor.getAssignedApprover(),
                executor.getApprovalDeadline() != null ? Timestamp.valueOf(executor.getApprovalDeadline()) : null,
                Timestamp.valueOf(executor.getUpdatedAt()),
                executor.getId()
        );
    }

    /**
     * Saves a list of WorkflowExecutor objects.
     * This method can be used for bulk insertions or updates.
     * @param executors The list of WorkflowExecutor objects to save.
     */
    public void saveAll(List<WorkflowExecutor> executors) {
        executors.forEach(this::save);
    }

    /**
     * Finds all WorkflowExecutors.
     * @return A list of all WorkflowExecutor objects. Returns an empty list if none found.
     */
    public List<WorkflowExecutor> findAll() {
        String sql = "SELECT * FROM workflow_executors";
        return jdbcTemplate.query(sql, new WorkflowExecutorRowMapper());
    }

    /**
     * Finds a WorkflowExecutor by its unique identifier.
     * @param id The ID of the executor.
     * @return The WorkflowExecutor object if found, otherwise null.
     */
    public WorkflowExecutor findById(String id) {
        String sql = "SELECT * FROM workflow_executors WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new WorkflowExecutorRowMapper(), id);
    }

    /**
     * Finds all WorkflowExecutor objects associated with a specific workflow instance.
     * @param workflowId The ID of the workflow.
     * @return A list of WorkflowExecutor objects.
     */
    public List<WorkflowExecutor> findByWorkflowId(String workflowId) {
        String sql = "SELECT * FROM workflow_executors WHERE workflow_id = ?";
        return jdbcTemplate.query(sql, new WorkflowExecutorRowMapper(), workflowId);
    }

    /**
     * Finds all WorkflowExecutor objects associated with a specific workflow instance.
     * @param serviceId The ID of the workflow.
     * @return A list of WorkflowExecutor objects.
     */
    public List<WorkflowExecutor> findByServiceId(String serviceId) {
        String sql = "SELECT * FROM workflow_executors WHERE service_id = ?";
        return jdbcTemplate.query(sql, new WorkflowExecutorRowMapper(), serviceId);
    }

    /**
     * Finds all WorkflowExecutor objects for a given workflow and child (node or edge) ID.
     * This is useful for checking if a step is already active in a workflow.
     * @param workflowId The ID of the workflow.
     * @param childrenId The ID of the child (node or edge).
     * @return A list of matching WorkflowExecutor objects.
     */
    public List<WorkflowExecutor> findByWorkflowIdAndChildrenId(String workflowId, String childrenId) {
        String sql = "SELECT * FROM workflow_executors WHERE workflow_id = ? AND children_id = ?";
        return jdbcTemplate.query(sql, new WorkflowExecutorRowMapper(), workflowId, childrenId);
    }

    /**
     * Deletes a WorkflowExecutor by its unique identifier.
     * @param id The ID of the executor to delete.
     */
    public void deleteById(String id) {
        String sql = "DELETE FROM workflow_executors WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    /**
     * Finds all executors that are edges and are in a pending approval state.
     * This method is useful for building a list of items that require a user's action.
     * @return A list of WorkflowExecutor objects matching the criteria.
     */
    public List<WorkflowExecutor> findPendingApprovalEdges() {
        String sql = "SELECT * FROM workflow_executors WHERE type = ? AND status = ?";
        return jdbcTemplate.query(sql, new WorkflowExecutorRowMapper(), ExecutorType.EDGE.name(), ExecutionStatus.WAITING_FOR_APPROVAL.name());
    }

    /**
     * Inner class to map a ResultSet row to a WorkflowExecutor object.
     * This handles the conversion of database columns to the appropriate Java types.
     */
    private static class WorkflowExecutorRowMapper implements RowMapper<WorkflowExecutor> {
        @Override
        public WorkflowExecutor mapRow(ResultSet rs, int rowNum) throws SQLException {
            WorkflowExecutor executor = new WorkflowExecutor();
            executor.setId(rs.getString("id"));
            executor.setWorkflowId(rs.getString("workflow_id"));
            executor.setServiceId(rs.getString("service_id"));
            executor.setType(ExecutorType.valueOf(rs.getString("type")));
            executor.setChildrenId(rs.getString("children_id"));
            executor.setStatus(ExecutionStatus.valueOf(rs.getString("status")));
            executor.setErrorCode(rs.getString("error_code"));
            executor.setErrorMessage(rs.getString("error_message"));
            executor.setErrorStackTrace(rs.getString("error_stack_trace"));
            executor.setApprovedBy(rs.getString("approved_by"));
            executor.setApprovalComments(rs.getString("approval_comments"));
            executor.setAssignedApprover(rs.getString("assigned_approver"));

            Timestamp approvalDeadline = rs.getTimestamp("approval_deadline");
            if (approvalDeadline != null) {
                executor.setApprovalDeadline(approvalDeadline.toLocalDateTime());
            }

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                executor.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                executor.setUpdatedAt(updatedAt.toLocalDateTime());
            }

            return executor;
        }
    }
}