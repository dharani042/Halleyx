package com.custdash.controller;

import com.custdash.entity.CustomerOrder;
import com.custdash.service.CustomerOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // In production, limit this to the frontend URL
public class CustomerOrderController {

    @Autowired
    private CustomerOrderService service;

    @GetMapping
    public List<CustomerOrder> getAllOrders() {
        return service.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerOrder> getOrderById(@PathVariable Long id) {
        return service.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CustomerOrder createOrder(@RequestBody CustomerOrder order) {
        return service.createOrder(order);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerOrder> updateOrder(@PathVariable Long id, @RequestBody CustomerOrder orderDetails) {
        try {
            return ResponseEntity.ok(service.updateOrder(id, orderDetails));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        service.deleteOrder(id);
        return ResponseEntity.ok().build();
    }
}
