package com.template.controller;

import com.template.model.Functionality;
import com.template.service.FunctionalityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Functionality-related operations.
 * Exposes API endpoints for CRUD functionality.
 */
@RestController
@RequestMapping("/api/functionalities")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Functionality API", description = "API for managing system functionalities")
public class FunctionalityController {

    private final FunctionalityService functionalityService;

    @Autowired
    public FunctionalityController(FunctionalityService functionalityService) {
        this.functionalityService = functionalityService;
    }

    /**
     * Endpoint to create a new Functionality.
     * @param functionality The Functionality object from the request body.
     * @return The saved Functionality object.
     */
    @PostMapping
    @Operation(summary = "Create a new functionality")
    @ApiResponse(responseCode = "201", description = "Functionality created successfully")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    public ResponseEntity<Functionality> createFunctionality(@io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Functionality object to be created",
            required = true,
            content = @Content(schema = @Schema(implementation = Functionality.class)))
                                                             @RequestBody Functionality functionality) {
        Functionality savedFunctionality = functionalityService.save(functionality);
        return new ResponseEntity<>(savedFunctionality, HttpStatus.CREATED);
    }

    /**
     * Endpoint to get all Functionality objects.
     * @return A list of all Functionality objects.
     */
    @GetMapping
    @Operation(summary = "Get all functionalities")
    @ApiResponse(responseCode = "200", description = "List of all functionalities retrieved successfully")
    public ResponseEntity<List<Functionality>> getAllFunctionalities() {
        List<Functionality> functionalities = functionalityService.findAll();
        return new ResponseEntity<>(functionalities, HttpStatus.OK);
    }

    /**
     * Endpoint to get a single Functionality by its ID.
     * @param id The ID of the functionality to retrieve.
     * @return The Functionality object if found, or a 404 Not Found status.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a functionality by ID")
    @ApiResponse(responseCode = "200", description = "Functionality found")
    @ApiResponse(responseCode = "404", description = "Functionality not found")
    public ResponseEntity<Functionality> getFunctionalityById(@PathVariable Long id) {
        Optional<Functionality> functionality = functionalityService.findById(id);
        return functionality.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Endpoint to update an existing Functionality.
     * @param id The ID of the functionality to update.
     * @param functionality The Functionality object with updated data.
     * @return The updated Functionality object, or a 404 Not Found status.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing functionality")
    @ApiResponse(responseCode = "200", description = "Functionality updated successfully")
    @ApiResponse(responseCode = "404", description = "Functionality not found")
    public ResponseEntity<Functionality> updateFunctionality(@PathVariable Long id, @RequestBody Functionality functionality) {
        Optional<Functionality> existingFunctionality = functionalityService.findById(id);
        if (existingFunctionality.isPresent()) {
            functionality.setId(id); // Ensure the ID from the path is used
            Optional<Functionality> updatedFunctionality = functionalityService.update(functionality);
            return updatedFunctionality.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Endpoint to delete a Functionality by its ID.
     * @param id The ID of the functionality to delete.
     * @return A 204 No Content status on success, or 404 Not Found if the functionality doesn't exist.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a functionality by ID")
    @ApiResponse(responseCode = "204", description = "Functionality deleted successfully")
    @ApiResponse(responseCode = "404", description = "Functionality not found")
    public ResponseEntity<Void> deleteFunctionality(@PathVariable Long id) {
        boolean isDeleted = functionalityService.deleteById(id);
        return isDeleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
