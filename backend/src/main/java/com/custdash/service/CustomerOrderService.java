package com.custdash.service;

import com.custdash.entity.CustomerOrder;
import com.custdash.repository.CustomerOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerOrderService {

    @Autowired
    private CustomerOrderRepository repository;

    public List<CustomerOrder> getAllOrders() {
        return repository.findAll();
    }

    public Optional<CustomerOrder> getOrderById(Long id) {
        return repository.findById(id);
    }

    public CustomerOrder createOrder(CustomerOrder order) {
        return repository.save(order);
    }

    public CustomerOrder updateOrder(Long id, CustomerOrder orderDetails) {
        CustomerOrder order = repository.findById(id).orElseThrow();
        // Update fields
        order.setFirstName(orderDetails.getFirstName());
        order.setLastName(orderDetails.getLastName());
        order.setEmailId(orderDetails.getEmailId());
        order.setPhoneNumber(orderDetails.getPhoneNumber());
        order.setStreetAddress(orderDetails.getStreetAddress());
        order.setCity(orderDetails.getCity());
        order.setStateProvince(orderDetails.getStateProvince());
        order.setPostalCode(orderDetails.getPostalCode());
        order.setCountry(orderDetails.getCountry());
        order.setProduct(orderDetails.getProduct());
        order.setQuantity(orderDetails.getQuantity());
        order.setUnitPrice(orderDetails.getUnitPrice());
        order.setTotalAmount(orderDetails.getUnitPrice().multiply(java.math.BigDecimal.valueOf(orderDetails.getQuantity())));
        order.setStatus(orderDetails.getStatus());
        order.setCreatedBy(orderDetails.getCreatedBy());
        
        return repository.save(order);
    }

    public void deleteOrder(Long id) {
        repository.deleteById(id);
    }
}
