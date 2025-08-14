package com.template.dao;

import com.template.model.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository class for performing CRUD operations on the 'tasks' table.
 * It uses Spring's JdbcTemplate for database interaction.
 */
@Repository
public class TaskRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public TaskRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Inserts a new Task into the database.
     * @param task The Task object to save.
     * @return The number of rows affected.
     */
    public int save(Task task) {
        String sql = "INSERT INTO tasks (id, release_number, title, description, sql_query, assigned_workflow, status, created_by, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        task.setId(UUID.randomUUID().toString());
        return jdbcTemplate.update(sql,
                task.getId(),
                task.getReleaseNumber(),
                task.getTitle(),
                task.getDescription(),
                task.getSqlQuery(),
                task.getAssignedWorkflow(),
                task.getStatus(),
                task.getCreatedBy(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }

    /**
     * Finds a Task by its ID.
     * @param id The ID of the task to find.
     * @return An Optional containing the found Task, or empty if not found.
     */
    public Optional<Task> findById(String id) {
        String sql = "SELECT id, release_number, title, description, sql_query, assigned_workflow, status, created_by, created_at, updated_at FROM tasks WHERE id = ?";
        try {
            Task task = jdbcTemplate.queryForObject(
                    sql,
                    new BeanPropertyRowMapper<>(Task.class),
                    id);
            return Optional.ofNullable(task);
        } catch (EmptyResultDataAccessException e) {
            // This exception is thrown if no row is found, so we return an empty Optional.
            return Optional.empty();
        }
    }

    /**
     * Retrieves all Task records from the database.
     * @return A list of all Task objects.
     */
    public List<Task> findAll() {
        String sql = "SELECT id, release_number, title, description, sql_query, assigned_workflow, status, created_by, created_at, updated_at FROM tasks";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Task.class));
    }

    /**
     * Updates an existing Task record.
     * @param task The Task object with updated data.
     * @return The number of rows affected.
     */
    public int update(Task task) {
        String sql = "UPDATE tasks SET release_number = ?, title = ?, description = ?, sql_query = ?, assigned_workflow = ?, status = ?, updated_at = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                task.getReleaseNumber(),
                task.getTitle(),
                task.getDescription(),
                task.getSqlQuery(),
                task.getAssignedWorkflow(),
                task.getStatus(),
                task.getUpdatedAt(),
                task.getId());
    }

    /**
     * Deletes a Task record by its ID.
     * @param id The ID of the task to delete.
     * @return The number of rows affected.
     */
    public int deleteById(String id) {
        String sql = "DELETE FROM tasks WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
