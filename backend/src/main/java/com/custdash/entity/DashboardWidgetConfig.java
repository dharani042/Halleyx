package com.custdash.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dashboard_widgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardWidgetConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type; // e.g., BAR_CHART, KPI, TABLE
    private String description;

    // Grid Layout
    private Integer width;
    private Integer height;
    private Integer gridX;
    private Integer gridY;

    // Data and Styling Settings stored as JSON for flexibility
    @Column(columnDefinition = "TEXT")
    private String settingsJson;

    private boolean isActive = true;

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Integer getGridX() { return gridX; }
    public void setGridX(Integer gridX) { this.gridX = gridX; }

    public Integer getGridY() { return gridY; }
    public void setGridY(Integer gridY) { this.gridY = gridY; }

    public String getSettingsJson() { return settingsJson; }
    public void setSettingsJson(String settingsJson) { this.settingsJson = settingsJson; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
