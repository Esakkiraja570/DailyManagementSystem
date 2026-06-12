package com.example.Daily.Management.System.DMS.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.Daily.Management.System.DMS.service.ProductService;

@RestController
@RequestMapping("/product")
@CrossOrigin("*")
public class ProductsController {

    @Autowired
    private ProductService service;

    // ✅ ADD PRODUCT
    @PostMapping("/add")
    public ResponseEntity<?> add(
            @RequestParam String name,
            @RequestParam Double price,
            @RequestParam Integer stock,
            @RequestParam String description,
            @RequestParam Boolean promoted,
            @RequestParam(required = false) String specialMessage,
            @RequestParam(required = false) String milkmanMobile,
            @RequestParam(required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                service.add(name, price, stock, description,
                        promoted, specialMessage, milkmanMobile, file)
        );
    }
    // ✅ GET PROMOTED PRODUCTS (CUSTOMER)
    @GetMapping("/list")
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    // ✅ PROMOTE / UNPROMOTE
    @PutMapping("/promote/{id}")
    public ResponseEntity<?> promote(@PathVariable Long id,
                                     @RequestParam boolean status) {
        return ResponseEntity.ok(service.promote(id, status));
    }

    @GetMapping("/customer/list")
    public ResponseEntity<?> customerList() {
        return ResponseEntity.ok(service.getPromotedProducts());
    }
    // ✅ DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);
        if (!deleted) {
            return ResponseEntity.badRequest().body("Product not found ❌");
        }
        return ResponseEntity.ok("Deleted ✅");
    }
}