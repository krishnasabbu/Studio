package com.template.service;

import com.template.dao.FunctionalityRepository;
import com.template.model.Functionality;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing Functionality objects.
 * It uses the FunctionalityRepository to interact with the database.
 */
@Service
public class FunctionalityService {

    private final FunctionalityRepository functionalityRepository;

    @Autowired
    public FunctionalityService(FunctionalityRepository functionalityRepository) {
        this.functionalityRepository = functionalityRepository;
    }

    /**
     * Saves a new Functionality.
     * @param functionality The Functionality object to save.
     * @return The saved Functionality object.
     */
    public Functionality save(Functionality functionality) {
        functionalityRepository.save(functionality);
        return functionality;
    }

    /**
     * Finds a Functionality by its ID.
     * @param id The ID of the functionality.
     * @return An Optional containing the Functionality if found.
     */
    public Optional<Functionality> findById(Long id) {
        return functionalityRepository.findById(id);
    }

    /**
     * Retrieves all Functionality objects.
     * @return A list of all Functionality objects.
     */
    public List<Functionality> findAll() {
        return functionalityRepository.findAll();
    }

    /**
     * Updates an existing Functionality.
     * @param functionality The Functionality object with updated data.
     * @return The updated Functionality object.
     */
    public Optional<Functionality> update(Functionality functionality) {
        int rowsAffected = functionalityRepository.update(functionality);
        if (rowsAffected > 0) {
            return Optional.of(functionality);
        } else {
            return Optional.empty();
        }
    }

    /**
     * Deletes a Functionality by its ID.
     * @param id The ID of the functionality to delete.
     * @return true if the functionality was deleted, false otherwise.
     */
    public boolean deleteById(Long id) {
        int rowsAffected = functionalityRepository.deleteById(id);
        return rowsAffected > 0;
    }
}
