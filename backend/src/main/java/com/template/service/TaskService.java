package com.template.service;

import com.template.model.Task;
import com.template.dao.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing Task entities.
 * Contains business logic for CRUD operations and data manipulation.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskWorkflowService taskWorkflowService;

    @Autowired
    public TaskService(TaskRepository taskRepository, TaskWorkflowService taskWorkflowService) {
        this.taskRepository = taskRepository;
        this.taskWorkflowService = taskWorkflowService;
    }

    /**
     * Creates and saves a new Task, then initiates the assigned workflow if one exists.
     * @param task The Task object to save.
     * @return The saved Task.
     */
    public Task saveAndInitiateWorkflow(Task task) {
        // 1. Set timestamps and save the task to the database
        LocalDateTime now = LocalDateTime.now();
        task.setCreatedAt(now);
        task.setUpdatedAt(now);
        taskRepository.save(task);

        // 2. Check if a workflow is assigned and initiate it
        if (task.getAssignedWorkflow() != null && !task.getAssignedWorkflow().isEmpty()) {
            try {
                // The WorkflowExecutionService requires a long serviceId.
                // We'll use the hash code of the task's string ID for this example.
                String serviceId = task.getId();
                taskWorkflowService.initiateWorkflow(serviceId, task.getAssignedWorkflow(), task.getTitle());
            } catch (Exception e) {
                // Handle the exception, e.g., log the error and decide how to proceed.
                // For this example, we'll log it and let the task be saved regardless.
                // In a production environment, you might want to mark the task with a special status.
                System.err.println("Failed to initiate workflow for task " + task.getId() + ": " + e.getMessage());
            }
        }
        return task;
    }

    // --- Existing CRUD methods remain the same ---

    public Optional<Task> findById(String id) {
        return taskRepository.findById(id);
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Optional<Task> update(String id, Task updatedTask) {
        return taskRepository.findById(id)
                .map(existingTask -> {
                    updatedTask.setId(existingTask.getId());
                    updatedTask.setCreatedAt(existingTask.getCreatedAt());
                    updatedTask.setUpdatedAt(LocalDateTime.now());
                    taskRepository.update(updatedTask);
                    return updatedTask;
                });
    }

    public boolean deleteById(String id) {
        int deletedRows = taskRepository.deleteById(id);
        return deletedRows > 0;
    }
}
