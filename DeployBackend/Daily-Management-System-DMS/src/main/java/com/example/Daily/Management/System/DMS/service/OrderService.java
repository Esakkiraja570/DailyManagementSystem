package com.example.Daily.Management.System.DMS.service;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.entity.OrderEntity;
import com.example.Daily.Management.System.DMS.entity.ProductEntity;
import com.example.Daily.Management.System.DMS.repositary.OrderRepo;
import com.example.Daily.Management.System.DMS.repositary.ProductsRepo;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private ProductsRepo productRepo;

    // ✅ PLACE ORDER (REDUCE STOCK HERE)
    public OrderEntity placeOrder(OrderEntity order) {

        ProductEntity product = productRepo.findById(order.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found ❌"));

        int availableStock = product.getStock();

        // ❌ prevent over order
        if (availableStock < order.getQuantity()) {
            throw new RuntimeException("Out of stock ❌");
        }

        // 🔥 reduce stock immediately (RESERVE)
        int newStock = availableStock - order.getQuantity();
        product.setStock(newStock);

        // 🔥 auto hide if stock 0
        if (newStock == 0) {
            product.setPromoted(false);
        }

        productRepo.save(product);

        order.setStatus("PENDING");
        order.setCustomerCanCancel(true);

        return orderRepo.save(order);
    }

    // ✅ ACCEPT ORDER
    public OrderEntity accept(Long id) {
        OrderEntity order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found ❌"));

        order.setStatus("ACCEPTED");
        order.setCustomerCanCancel(false);

        return orderRepo.save(order);
    }

    // ✅ REJECT ORDER (RETURN STOCK)
    public OrderEntity reject(Long id) {
        OrderEntity order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found ❌"));

        ProductEntity product = productRepo.findById(order.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found ❌"));

        // 🔥 return stock
        product.setStock(product.getStock() + order.getQuantity());

        // 🔥 re-promote if stock back
        if (product.getStock() > 0) {
            product.setPromoted(true);
        }

        productRepo.save(product);

        order.setStatus("REJECTED");
        return orderRepo.save(order);
    }

    // ✅ DELIVER ORDER (NO STOCK CHANGE HERE)
    public OrderEntity deliver(Long id) {
        OrderEntity order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found ❌"));

        order.setStatus("DELIVERED");
        return orderRepo.save(order);
    }
    public List<OrderEntity> getByCustomerMobile(String mobile) {
        return orderRepo.findByCustomerMobile(mobile);
    }
	
}