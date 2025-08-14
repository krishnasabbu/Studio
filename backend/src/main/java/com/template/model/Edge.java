package com.template.model;

import lombok.Data;

@Data
public class Edge {
    private String id;
    private String source;
    private String sourceHandle;
    private String target;
    private String targetHandle;
    private String type;
    private Data data;
    private boolean selected;

    @lombok.Data
    public static class Data {
        private boolean requiresApproval;
        private String approverRole;
        private String status;
        private String approvalTimeout;
        private boolean autoApprove;
        // getters/setters
    }
    // getters and setters
}
