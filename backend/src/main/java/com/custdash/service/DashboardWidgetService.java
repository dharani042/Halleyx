package com.custdash.service;

import com.custdash.entity.DashboardWidgetConfig;
import com.custdash.repository.DashboardWidgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DashboardWidgetService {

    @Autowired
    private DashboardWidgetRepository repository;

    public List<DashboardWidgetConfig> getAllWidgets() {
        return repository.findAll();
    }

    public DashboardWidgetConfig saveWidget(DashboardWidgetConfig widget) {
        return repository.save(widget);
    }

    public void saveAllWidgets(List<DashboardWidgetConfig> widgets) {
        repository.saveAll(widgets);
    }

    public void deleteWidget(Long id) {
        repository.deleteById(id);
    }

    public void deleteAllWidgets() {
        repository.deleteAll();
    }
}
