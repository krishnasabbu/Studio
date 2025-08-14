package com.template.controller;


import com.template.model.Workflow;
import com.template.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/workflows")
@Tag(name = "Workflow API", description = "CRUD operations for workflow definitions including nodes and edges")
public class WorkflowController {

    @Autowired
    private WorkflowService service;

    @Operation(
            summary = "Get all workflows",
            description = "Returns a list of all stored workflows.",
            responses = @ApiResponse(
                    description = "Successful retrieval",
                    responseCode = "200",
                    content = @Content(schema = @Schema(implementation = Workflow.class))
            )
    )
    @GetMapping
    public List<Workflow> getAll() {
        return service.getAllWorkflows();
    }

    @Operation(
            summary = "Get workflow by ID",
            description = "Retrieve a specific workflow by its unique ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getById(
            @Parameter(description = "ID of the workflow to retrieve", required = true)
            @PathVariable String id) {
        Workflow wf = service.getWorkflowById(id);
        return wf != null ? ResponseEntity.ok(wf) : ResponseEntity.notFound().build();
    }

    @Operation(
            summary = "Create a new workflow",
            description = "Save a new workflow with nodes and edges."
    )
    @PostMapping
    public ResponseEntity<String> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Workflow object to be created",
                    required = true,
                    content = @Content(schema = @Schema(implementation = Workflow.class))
            )
            @RequestBody Workflow workflow) {
        service.createWorkflow(workflow);
        return ResponseEntity.ok("Workflow saved successfully");
    }

    @Operation(
            summary = "Update an existing workflow",
            description = "Update a workflow by ID. Only name, description, version, and status are updated."
    )
    @PutMapping("/{id}")
    public ResponseEntity<String> update(
            @Parameter(description = "ID of the workflow to update", required = true)
            @PathVariable String id,
            @RequestBody Workflow workflow) {
        service.updateWorkflow(id, workflow);
        return ResponseEntity.ok("Workflow updated");
    }

    @Operation(
            summary = "Delete a workflow",
            description = "Remove a workflow and all its related nodes and edges by ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @Parameter(description = "ID of the workflow to delete", required = true)
            @PathVariable String id) {
        service.deleteWorkflow(id);
        return ResponseEntity.ok("Deleted workflow with ID: " + id);
    }
}
