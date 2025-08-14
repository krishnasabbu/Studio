package com.template.controller;

import com.template.model.WorkflowMapping;
import com.template.service.WorkflowMappingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for WorkflowMapping-related operations.
 * Exposes API endpoints for CRUD functionality.
 */
@RestController
@RequestMapping("/api/workflow-mappings")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Workflow Mapping API", description = "API for linking workflows to functionalities")
public class WorkflowMappingController {

    private final WorkflowMappingService workflowMappingService;

    @Autowired
    public WorkflowMappingController(WorkflowMappingService workflowMappingService) {
        this.workflowMappingService = workflowMappingService;
    }

    /**
     * Creates a new workflow mapping.
     * @param workflowMapping The mapping object to save.
     * @return The saved mapping with a CREATED status.
     */
    @PostMapping
    @Operation(summary = "Create a new workflow mapping")
    public ResponseEntity<WorkflowMapping> createWorkflowMapping(@RequestBody WorkflowMapping workflowMapping) {
        WorkflowMapping savedMapping = workflowMappingService.save(workflowMapping);
        return new ResponseEntity<>(savedMapping, HttpStatus.CREATED);
    }

    /**
     * Retrieves all workflow mappings.
     * @return A list of all mappings with an OK status.
     */
    @GetMapping
    @Operation(summary = "Get all workflow mappings")
    public ResponseEntity<List<WorkflowMapping>> getAllWorkflowMappings() {
        List<WorkflowMapping> mappings = workflowMappingService.findAll();
        return new ResponseEntity<>(mappings, HttpStatus.OK);
    }

    /**
     * Deletes a workflow mapping by its ID.
     * @param id The ID of the mapping to delete.
     * @return A NO_CONTENT status if successful, or NOT_FOUND otherwise.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a workflow mapping by ID")
    public ResponseEntity<Void> deleteWorkflowMapping(@PathVariable Long id) {
        boolean isDeleted = workflowMappingService.deleteById(id);
        return isDeleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
