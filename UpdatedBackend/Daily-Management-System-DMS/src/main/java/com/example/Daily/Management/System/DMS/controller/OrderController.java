package com.example.Daily.Management.System.DMS.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.entity.OrderEntity;
import com.example.Daily.Management.System.DMS.service.OrderService;

@RestController
@RequestMapping("/order")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService service;

    // ✅ PLACE ORDER
    @PostMapping("/place")
    public ResponseEntity<?> place(@RequestBody OrderEntity order) {
        return ResponseEntity.ok(service.placeOrder(order));
    }

    // ✅ GET ORDERS BY CUSTOMER (ONLY ONE METHOD)
    @GetMapping("/customer/{mobile}")
    public ResponseEntity<Object> getOrdersByCustomer(@PathVariable String mobile) {
        return ResponseEntity.ok(service.getByCustomerMobile(mobile));
    }

    // ✅ ACCEPT ORDER
    @PutMapping("/accept/{id}")
    public ResponseEntity<?> accept(@PathVariable Long id) {
        return ResponseEntity.ok(service.accept(id));
    }

    // ✅ REJECT ORDER
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }

    // ✅ DELIVER ORDER
    @PutMapping("/deliver/{id}")
    public ResponseEntity<?> deliver(@PathVariable Long id) {
        return ResponseEntity.ok(service.deliver(id));
    }
}