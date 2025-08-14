package com.template.dao;

import com.template.model.WorkflowMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repository class for WorkflowMapping using JdbcTemplate.
 * Provides data access methods using direct SQL queries and BeanPropertyRowMapper.
 */
@Repository
public class WorkflowMappingRepository {

    private final JdbcTemplate jdbcTemplate;
    private final SimpleJdbcInsert simpleJdbcInsert;

    @Autowired
    public WorkflowMappingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.simpleJdbcInsert = new SimpleJdbcInsert(jdbcTemplate)
                .withTableName("workflow_mappings")
                .usingGeneratedKeyColumns("id");
    }

    /**
     * Inserts a new WorkflowMapping into the database and returns the created object with its new ID.
     * @param workflowMapping The mapping object to save.
     * @return The saved mapping with the auto-generated ID.
     */
    public WorkflowMapping save(WorkflowMapping workflowMapping) {
        // Use SimpleJdbcInsert to handle auto-generated keys,
        // which is the standard approach for insert statements.
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("workflow_id", workflowMapping.getWorkflowId());
        parameters.put("functionality_id", workflowMapping.getFunctionalityId());
        parameters.put("functionality_name", workflowMapping.getFunctionalityName());
        parameters.put("functionality_type", workflowMapping.getFunctionalityType());
        // createdAt is handled by the database timestamp default.

        Number newId = simpleJdbcInsert.executeAndReturnKey(parameters);
        workflowMapping.setId(newId.longValue());
        return workflowMapping;
    }

    /**
     * Finds a WorkflowMapping by its ID.
     * @param id The ID of the mapping to find.
     * @return An Optional containing the found WorkflowMapping, or empty if not found.
     */
    public Optional<WorkflowMapping> findById(Long id) {
        String sql = "SELECT id, workflow_id, functionality_id, functionality_name, functionality_type, created_at FROM workflow_mappings WHERE id = ?";
        try {
            WorkflowMapping mapping = jdbcTemplate.queryForObject(
                    sql,
                    new BeanPropertyRowMapper<>(WorkflowMapping.class),
                    id
            );
            return Optional.ofNullable(mapping);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Finds a WorkflowMapping by its ID.
     * @param workflowId The ID of the mapping to find.
     * @return An Optional containing the found WorkflowMapping, or empty if not found.
     */
    public Optional<WorkflowMapping> findByWorkflowId(String workflowId) {
        String sql = "SELECT id, workflow_id, functionality_id, functionality_name, functionality_type, created_at FROM workflow_mappings WHERE workflow_id = ?";
        try {
            WorkflowMapping mapping = jdbcTemplate.queryForObject(
                    sql,
                    new BeanPropertyRowMapper<>(WorkflowMapping.class),
                    workflowId
            );
            return Optional.ofNullable(mapping);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Retrieves all WorkflowMapping records from the database.
     * @return A list of all WorkflowMapping objects.
     */
    public List<WorkflowMapping> findAll() {
        String sql = "SELECT id, workflow_id, functionality_id, functionality_name, functionality_type, created_at FROM workflow_mappings";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(WorkflowMapping.class));
    }

    /**
     * Deletes a WorkflowMapping record by its ID.
     * @param id The ID of the mapping to delete.
     * @return The number of rows affected.
     */
    public int deleteById(Long id) {
        String sql = "DELETE FROM workflow_mappings WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
