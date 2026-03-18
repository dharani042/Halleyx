package com.custdash.repository;

import com.custdash.entity.DashboardWidgetConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidgetConfig, Long> {
}
