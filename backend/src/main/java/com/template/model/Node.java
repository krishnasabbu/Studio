package com.template.model;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Data
public class Node {
    private String id;
    private String type;
    private Position position;
    private Position positionAbsolute;
    private double width;
    private double height;
    private boolean selected;
    private boolean dragging;
    private Data data;

    @lombok.Data
    public static class Position {
        private double x;
        private double y;

        public Position(double positionX, double positionY) {
            this.x = positionX;
            this.y = positionY;
        }
        // getters/setters
    }

    @lombok.Data
    public static class Data {
        private String stageName;
        private String environment;
        private Map<String, String> parameters;
        private String status;
        private String label;
        // getters/setters
    }

    // getters and setters
}
