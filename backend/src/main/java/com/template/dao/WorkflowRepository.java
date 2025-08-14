package com.template.dao;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.template.model.Edge;
import com.template.model.Node;
import com.template.model.Workflow;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.*;
import java.time.Instant;
import java.util.*;

@Repository
public class WorkflowRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public WorkflowRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Saves a new workflow, including all its nodes and edges, within a single transaction.
     * Uses batch updates for efficient insertion of nodes and edges.
     *
     * @param workflow The workflow object to be saved.
     * @throws JsonProcessingException if there's an error processing JSON data.
     */
    @Transactional
    public void save(Workflow workflow) throws JsonProcessingException {
        // Assign a new ID to the workflow if it doesn't have one
        if (workflow.getId() == null) {
            workflow.setId(UUID.randomUUID().toString());
        }

        // Insert the main workflow record
        jdbcTemplate.update(
                "INSERT INTO workflows (id, name, description, version, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                workflow.getId(),
                workflow.getName(),
                workflow.getDescription(),
                workflow.getVersion(),
                workflow.getStatus(),
                workflow.getCreatedBy(),
                Timestamp.from(workflow.getCreatedAt()),
                Timestamp.from(workflow.getUpdatedAt())
        );

        // Use a batch update for inserting all nodes at once
        if (workflow.getNodes() != null && !workflow.getNodes().isEmpty()) {
            String nodeSql = "INSERT INTO nodes (id, workflow_id, type, position_x, position_y, width, height, selected, dragging, stage_name, environment, parameters, status, label, position_abs_x, position_abs_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            List<Node> nodesToInsert = workflow.getNodes();
            jdbcTemplate.batchUpdate(nodeSql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    Node node = nodesToInsert.get(i);
                    String parametersJson;
                    try {
                        parametersJson = objectMapper.writeValueAsString(node.getData().getParameters());
                    } catch (JsonProcessingException e) {
                        throw new SQLException("Failed to serialize node parameters to JSON", e);
                    }
                    ps.setString(1, node.getId());
                    ps.setString(2, workflow.getId());
                    ps.setString(3, node.getType());
                    ps.setDouble(4, node.getPosition().getX());
                    ps.setDouble(5, node.getPosition().getY());
                    ps.setDouble(6, node.getWidth());
                    ps.setDouble(7, node.getHeight());
                    ps.setBoolean(8, node.isSelected());
                    ps.setBoolean(9, node.isDragging());
                    ps.setString(10, node.getData().getStageName());
                    ps.setString(11, node.getData().getEnvironment());
                    ps.setString(12, parametersJson);
                    ps.setString(13, node.getData().getStatus());
                    ps.setString(14, node.getData().getLabel());
                    if(Objects.nonNull(node.getPositionAbsolute()) && Objects.nonNull(node.getPositionAbsolute().getX())) {
                        ps.setDouble(15, node.getPositionAbsolute().getX());
                    }else {
                        ps.setNull(15, Types.DOUBLE);
                    }
                    if(Objects.nonNull(node.getPositionAbsolute()) && Objects.nonNull(node.getPositionAbsolute().getY())) {
                        ps.setDouble(16, node.getPositionAbsolute().getY());
                    }else {
                        ps.setNull(16, Types.DOUBLE);
                    }


                }

                @Override
                public int getBatchSize() {
                    return nodesToInsert.size();
                }
            });
        }

        // Use a batch update for inserting all edges at once
        if (workflow.getEdges() != null && !workflow.getEdges().isEmpty()) {
            String edgeSql = "INSERT INTO edges (id, workflow_id, source, source_handle, target, target_handle, type, requires_approval, approver_role, status, approval_timeout, auto_approve) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            List<Edge> edgesToInsert = workflow.getEdges();
            jdbcTemplate.batchUpdate(edgeSql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    Edge edge = edgesToInsert.get(i);
                    Edge.Data data = edge.getData();
                    ps.setString(1, edge.getId());
                    ps.setString(2, workflow.getId());
                    ps.setString(3, edge.getSource());
                    ps.setString(4, edge.getSourceHandle());
                    ps.setString(5, edge.getTarget());
                    ps.setString(6, edge.getTargetHandle());
                    ps.setString(7, edge.getType());
                    ps.setBoolean(8, data.isRequiresApproval());
                    ps.setString(9, data.getApproverRole());
                    ps.setString(10, data.getStatus());
                    ps.setLong(11, 1);
                    ps.setBoolean(12, data.isAutoApprove());
                }

                @Override
                public int getBatchSize() {
                    return edgesToInsert.size();
                }
            });
        }
    }

    /**
     * Retrieves a workflow by its ID, including its associated nodes and edges.
     *
     * @param id The ID of the workflow.
     * @return The complete workflow object.
     */
    public Workflow findById(String id) {
        String sql = "SELECT * FROM workflows WHERE id = ?";
        Workflow workflow = jdbcTemplate.queryForObject(sql, new WorkflowRowMapper(), id);
        if (workflow != null) {
            workflow.setNodes(findNodesByWorkflowId(id));
            workflow.setEdges(findEdgesByWorkflowId(id));
        }
        return workflow;
    }

    // New helper method to find nodes for a given workflow
    private List<Node> findNodesByWorkflowId(String workflowId) {
        String sql = "SELECT * FROM nodes WHERE workflow_id = ?";
        return jdbcTemplate.query(sql, new NodeRowMapper(objectMapper), workflowId);
    }

    // New helper method to find edges for a given workflow
    private List<Edge> findEdgesByWorkflowId(String workflowId) {
        String sql = "SELECT * FROM edges WHERE workflow_id = ?";
        return jdbcTemplate.query(sql, new EdgeRowMapper(), workflowId);
    }

    // Find all workflows (without nodes and edges for performance)
    public List<Workflow> findAll() {
        String sql = "SELECT * FROM workflows";

        return jdbcTemplate.query(sql, new WorkflowRowMapper());
    }

    public int countAll() {
        String sql = "SELECT COUNT(*) FROM workflows";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    // Update workflow
    public void update(String id, Workflow workflow) {
        String sql = "UPDATE workflows SET name = ?, description = ?, version = ?, status = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                workflow.getName(),
                workflow.getDescription(),
                workflow.getVersion(),
                workflow.getStatus(),
                Timestamp.from(Instant.now()),
                id
        );
    }

    /**
     * Deletes a workflow and all its associated nodes and edges in a single transaction.
     *
     * @param id The ID of the workflow to delete.
     */
    @Transactional
    public void deleteById(String id) {
        // Corrected table names to be consistent with the `save` method
        jdbcTemplate.update("DELETE FROM edges WHERE workflow_id = ?", id);
        jdbcTemplate.update("DELETE FROM nodes WHERE workflow_id = ?", id);
        jdbcTemplate.update("DELETE FROM workflows WHERE id = ?", id);
    }

    // RowMapper for the Workflow object
    private class WorkflowRowMapper implements RowMapper<Workflow> {
        @Override
        public Workflow mapRow(ResultSet rs, int rowNum) throws SQLException {
            Workflow wf = new Workflow();
            wf.setId(rs.getString("id"));
            wf.setName(rs.getString("name"));
            wf.setDescription(rs.getString("description"));
            wf.setVersion(rs.getString("version"));
            wf.setStatus(rs.getString("status"));
            wf.setCreatedBy(rs.getString("created_by"));
            wf.setCreatedAt(rs.getTimestamp("created_at").toInstant());
            wf.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
            return wf;
        }
    }

    // RowMapper for the Node object
    private class NodeRowMapper implements RowMapper<Node> {
        private final ObjectMapper objectMapper;

        public NodeRowMapper(ObjectMapper objectMapper) {
            this.objectMapper = objectMapper;
        }

        @Override
        public Node mapRow(ResultSet rs, int rowNum) throws SQLException {
            Node node = new Node();
            Node.Position position = new Node.Position(rs.getDouble("position_x"), rs.getDouble("position_y"));
            Node.Position positionAbs = new Node.Position(rs.getDouble("position_abs_x"), rs.getDouble("position_abs_y"));
            Node.Data data = new Node.Data();
            data.setStageName(rs.getString("stage_name"));
            data.setEnvironment(rs.getString("environment"));
            data.setStatus(rs.getString("status"));
            data.setLabel(rs.getString("label"));

            String parametersJson = rs.getString("parameters");
            if (parametersJson != null) {
                try {
                    data.setParameters(objectMapper.readValue(parametersJson, new TypeReference<Map<String, String>>() {}));
                } catch (JsonProcessingException e) {
                    throw new SQLException("Failed to deserialize node parameters from JSON", e);
                }
            }

            node.setId(rs.getString("id"));
            node.setType(rs.getString("type"));
            node.setWidth(rs.getDouble("width"));
            node.setHeight(rs.getDouble("height"));
            node.setSelected(rs.getBoolean("selected"));
            node.setDragging(rs.getBoolean("dragging"));
            node.setPosition(position);
            node.setPositionAbsolute(positionAbs);
            node.setData(data);

            return node;
        }
    }

    // RowMapper for the Edge object
    private class EdgeRowMapper implements RowMapper<Edge> {
        @Override
        public Edge mapRow(ResultSet rs, int rowNum) throws SQLException {
            Edge edge = new Edge();
            Edge.Data data = new Edge.Data();
            data.setRequiresApproval(rs.getBoolean("requires_approval"));
            data.setApproverRole(rs.getString("approver_role"));
            data.setStatus(rs.getString("status"));
            data.setApprovalTimeout(String.valueOf(1));
            data.setAutoApprove(rs.getBoolean("auto_approve"));

            edge.setId(rs.getString("id"));
            edge.setSource(rs.getString("source"));
            edge.setSourceHandle(rs.getString("source_handle"));
            edge.setTarget(rs.getString("target"));
            edge.setTargetHandle(rs.getString("target_handle"));
            edge.setType(rs.getString("type"));
            edge.setData(data);

            return edge;
        }
    }
}