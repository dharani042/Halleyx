package com.custdash.controller;

import com.custdash.entity.DashboardWidgetConfig;
import com.custdash.service.DashboardWidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard/widgets")
@CrossOrigin(origins = "*")
public class DashboardConfigController {

    @Autowired
    private DashboardWidgetService service;

    @GetMapping
    public List<DashboardWidgetConfig> getAllWidgets() {
        return service.getAllWidgets();
    }

    @PostMapping
    public DashboardWidgetConfig saveWidget(@RequestBody DashboardWidgetConfig widget) {
        return service.saveWidget(widget);
    }

    @PostMapping("/batch")
    public void saveAllWidgets(@RequestBody List<DashboardWidgetConfig> widgets) {
        service.saveAllWidgets(widgets);
    }

    @DeleteMapping("/{id}")
    public void deleteWidget(@PathVariable Long id) {
        service.deleteWidget(id);
    }

    @DeleteMapping("/clear")
    public void clearConfig() {
        service.deleteAllWidgets();
    }
}
