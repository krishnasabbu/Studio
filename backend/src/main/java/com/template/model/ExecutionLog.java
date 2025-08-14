package com.template.model;

import java.sql.Timestamp;

/**
 * A model object representing an execution log entry.
 * This class corresponds to a database table and holds all necessary information for a log record.
 */
public class ExecutionLog {

    private String id;
    private Timestamp timestamp;
    private String stepId;
    private String stepName;
    private String level; // e.g., 'INFO', 'SUCCESS', 'WARNING', 'ERROR'
    private String message;
    private String details;
    private String performedBy;
    private String executorId;
    private String serviceId;

    // Default constructor
    public ExecutionLog() {
    }

    // Getters and Setters for all fields

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public String getStepId() {
        return stepId;
    }

    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    public String getStepName() {
        return stepName;
    }

    public void setStepName(String stepName) {
        this.stepName = stepName;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getExecutorId() {
        return executorId;
    }

    public void setExecutorId(String executorId) {
        this.executorId = executorId;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    /**
     * An enum to represent the log level, providing type safety.
     * This is an alternative to using a String for the level field.
     */
    public enum Level {
        INFO,
        SUCCESS,
        WARNING,
        ERROR
    }
}