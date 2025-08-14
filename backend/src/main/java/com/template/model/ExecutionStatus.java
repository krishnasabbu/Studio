package com.template.model;

public enum ExecutionStatus {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED,
    WAITING_FOR_APPROVAL,
    REJECTED;

    /**
     * @return true if the status is a final, non-changeable state.
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == REJECTED;
    }
}