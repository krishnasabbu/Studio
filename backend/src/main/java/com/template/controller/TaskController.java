package com.template.controller;

import com.template.model.Task;
import com.template.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Task-related operations.
 * Exposes API endpoints for CRUD functionality.
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Task API", description = "API for managing custom tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Creates a new Task.
     * @param task The task object to save.
     * @return The saved task with a CREATED status.
     */
    @PostMapping
    @Operation(summary = "Create a new custom task")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task savedTask = taskService.saveAndInitiateWorkflow(task);
        return new ResponseEntity<>(savedTask, HttpStatus.CREATED);
    }

    /**
     * Retrieves all Task records.
     * @return A list of all tasks with an OK status.
     */
    @GetMapping
    @Operation(summary = "Get all custom tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.findAll();
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    /**
     * Finds a Task by its ID.
     * @param id The ID of the task to find.
     * @return The found task with an OK status, or NOT_FOUND if not found.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a custom task by ID")
    public ResponseEntity<Task> getTaskById(@Parameter(description = "ID of the task to retrieve", required = true) @PathVariable String id) {
        return taskService.findById(id)
                .map(task -> new ResponseEntity<>(task, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Updates an existing Task record.
     * @param id The ID of the task to update.
     * @param task The updated task object.
     * @return The updated task with an OK status, or NOT_FOUND if not found.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing custom task")
    public ResponseEntity<Task> updateTask(@Parameter(description = "ID of the task to update", required = true) @PathVariable String id, @RequestBody Task task) {
        return taskService.update(id, task)
                .map(updatedTask -> new ResponseEntity<>(updatedTask, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Deletes a Task record by its ID.
     * @param id The ID of the task to delete.
     * @return A NO_CONTENT status if successful, or NOT_FOUND otherwise.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a custom task by ID")
    public ResponseEntity<Void> deleteTask(@Parameter(description = "ID of the task to delete", required = true) @PathVariable String id) {
        boolean isDeleted = taskService.deleteById(id);
        return isDeleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
