package com.example.Daily.Management.System.DMS.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.entity.MilkmanCustomers;
import com.example.Daily.Management.System.DMS.service.MilkmanCustomerService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:3000")
public class MilkmanCustomerController {

    @Autowired
    private MilkmanCustomerService service;

    @GetMapping("/milkman/{mobile}")
    public ResponseEntity<?> getMilkman(@PathVariable String mobile) {
        try {
            return ResponseEntity.ok(service.getMilkmanByCustomerMobile(mobile));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
    // ✅ Add customer (Milkman side)
    @PostMapping("/add/{milkmanMobile}")
    public MilkmanCustomers addCustomer(
            @RequestBody MilkmanCustomers customer,
            @PathVariable String milkmanMobile) {

        return service.addCustomer(customer, milkmanMobile);
    }

    
    // ✅ Get all customers (Milkman)
    @GetMapping("/my/{milkmanMobile}")
    public List<MilkmanCustomers> getMyCustomers(@PathVariable String milkmanMobile) {
        return service.getMyCustomers(milkmanMobile);
    }

    // ✅ 🔥 CUSTOMER LOGIN (IMPORTANT)
    @GetMapping("/login/{mobile}")
    public ResponseEntity<?> loginCustomer(@PathVariable String mobile) {
        try {
            MilkmanCustomers customer = service.getCustomerByMobile(mobile);
            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
        }
    }
}
