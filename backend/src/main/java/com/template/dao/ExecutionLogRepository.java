package com.template.dao;

import com.template.model.ExecutionLog;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

@Repository
public class ExecutionLogRepository {

    private final JdbcTemplate jdbcTemplate;

    public ExecutionLogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Inserts a new ExecutionLog record into the database.
     *
     * @param log The ExecutionLog object to be inserted.
     */
    public void create(ExecutionLog log) {
        // SQL statement for inserting a new log entry with all fields, including the ID
        log.setId(UUID.randomUUID().toString());
        String sql = "INSERT INTO execution_log (id, timestamp, step_id, step_name, level, message, details, performed_by, executor_id, service_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                log.getId(),
                log.getTimestamp(),
                log.getStepId(),
                log.getStepName(),
                log.getLevel(),
                log.getMessage(),
                log.getDetails(),
                log.getPerformedBy(),
                log.getExecutorId(),
                log.getServiceId()
        );
    }

    /**
     * Finds an ExecutionLog record by its unique ID.
     *
     * @param id The ID of the log record.
     * @return The ExecutionLog object if found, otherwise null.
     */
    public ExecutionLog findById(String id) {
        // SQL statement to select a single log entry by its ID
        String sql = "SELECT id, timestamp, step_id, step_name, level, message, details, performed_by, executor_id, service_id FROM execution_log WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new ExecutionLogRowMapper(), id);
    }

    /**
     * Retrieves all ExecutionLog records from the database.
     *
     * @return A list of all ExecutionLog objects.
     */
    public List<ExecutionLog> findAll() {
        // SQL statement to select all log entries
        String sql = "SELECT id, timestamp, step_id, step_name, level, message, details, performed_by, executor_id, service_id FROM execution_log";
        return jdbcTemplate.query(sql, new ExecutionLogRowMapper());
    }

    /**
     * Updates an existing ExecutionLog record.
     *
     * @param log The ExecutionLog object with updated values.
     * @return The number of rows affected (should be 1).
     */
    public int update(ExecutionLog log) {
        // SQL statement for updating all fields based on the log ID
        String sql = "UPDATE execution_log SET timestamp = ?, step_id = ?, step_name = ?, level = ?, message = ?, details = ?, performed_by = ?, executor_id = ?, service_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                log.getTimestamp(),
                log.getStepId(),
                log.getStepName(),
                log.getLevel(),
                log.getMessage(),
                log.getDetails(),
                log.getPerformedBy(),
                log.getExecutorId(),
                log.getServiceId(),
                log.getId()
        );
    }

    /**
     * Finds all ExecutionLog records associated with a specific service ID.
     *
     * @param serviceId The ID of the service to filter by.
     * @return A list of ExecutionLog objects for the given service ID.
     */
    public List<ExecutionLog> findByServiceId(String serviceId) {
        // SQL query to select all log entries where the service_id matches the provided value.
        String sql = "SELECT id, timestamp, step_id, step_name, level, message, details, performed_by, executor_id, service_id FROM execution_log WHERE service_id = ?";
        // The RowMapper is reused to map the results to ExecutionLog objects.
        return jdbcTemplate.query(sql, new ExecutionLogRowMapper(), serviceId);
    }

    /**
     * Deletes an ExecutionLog record by its unique ID.
     *
     * @param id The ID of the log record to be deleted.
     * @return The number of rows affected (should be 1).
     */
    public int delete(String id) {
        // SQL statement to delete a log entry by its ID
        String sql = "DELETE FROM execution_log WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    /**
     * A private static inner class to map a database row to an ExecutionLog object.
     */
    private static final class ExecutionLogRowMapper implements RowMapper<ExecutionLog> {
        @Override
        public ExecutionLog mapRow(ResultSet rs, int rowNum) throws SQLException {
            ExecutionLog log = new ExecutionLog();
            // Mapping each column from the ResultSet to the ExecutionLog object's properties
            log.setId(rs.getString("id"));
            log.setTimestamp(rs.getTimestamp("timestamp"));
            log.setStepId(rs.getString("step_id"));
            log.setStepName(rs.getString("step_name"));
            log.setLevel(rs.getString("level"));
            log.setMessage(rs.getString("message"));
            log.setDetails(rs.getString("details"));
            log.setPerformedBy(rs.getString("performed_by"));
            log.setExecutorId(rs.getString("executor_id"));
            log.setServiceId(rs.getString("service_id"));
            return log;
        }
    }
}
