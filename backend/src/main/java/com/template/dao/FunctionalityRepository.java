package com.template.dao;

import com.template.model.Functionality;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository class for performing CRUD operations on the 'functionalities' table.
 * It uses Spring's JdbcTemplate for database interaction.
 */
@Repository
public class FunctionalityRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public FunctionalityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Inserts a new Functionality into the database.
     * @param functionality The Functionality object to save.
     * @return The number of rows affected.
     */
    public int save(Functionality functionality) {
        String sql = "INSERT INTO functionalities (id, name, type) VALUES (?, ?, ?)";
        return jdbcTemplate.update(sql,
                functionality.getId(),
                functionality.getName(),
                functionality.getType());
    }

    /**
     * Finds a Functionality by its ID.
     * @param id The ID of the functionality to find.
     * @return An Optional containing the found Functionality, or empty if not found.
     */
    public Optional<Functionality> findById(Long id) {
        String sql = "SELECT id, name, type FROM functionalities WHERE id = ?";
        try {
            Functionality functionality = jdbcTemplate.queryForObject(sql,
                    new BeanPropertyRowMapper<>(Functionality.class),
                    id);
            return Optional.ofNullable(functionality);
        } catch (Exception e) {
            // Log the exception if needed
            return Optional.empty();
        }
    }

    /**
     * Retrieves all Functionality records from the database.
     * @return A list of all Functionality objects.
     */
    public List<Functionality> findAll() {
        String sql = "SELECT id, name, type FROM functionalities";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Functionality.class));
    }

    /**
     * Updates an existing Functionality record.
     * @param functionality The Functionality object with updated data.
     * @return The number of rows affected.
     */
    public int update(Functionality functionality) {
        String sql = "UPDATE functionalities SET name = ?, type = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                functionality.getName(),
                functionality.getType(),
                functionality.getId());
    }

    /**
     * Deletes a Functionality record by its ID.
     * @param id The ID of the functionality to delete.
     * @return The number of rows affected.
     */
    public int deleteById(Long id) {
        String sql = "DELETE FROM functionalities WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
