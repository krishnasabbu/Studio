package com.template.model;

import lombok.Data;

/**
 * Data Transfer Object for handling approval and rejection requests.
 */
@Data
public class ApprovalRequest {

    private String type;
    private String approvedBy;
    private String comments;

}

