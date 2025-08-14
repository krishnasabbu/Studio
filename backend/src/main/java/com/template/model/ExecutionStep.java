package com.template.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExecutionStep {
    private String id;
    private String name;
    private String type;
    private String status;
}
