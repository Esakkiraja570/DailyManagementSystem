package com.example.Daily.Management.System.DMS.entity;

import jakarta.persistence.*;

@Entity
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;
    private String customerMobile;

    private Integer quantity;

    private String status; 
    // PENDING / ACCEPTED / REJECTED / DELIVERED

    private boolean customerCanCancel = true;

    // GETTERS
    public Long getId() { return id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isCustomerCanCancel() { return customerCanCancel; }
    public void setCustomerCanCancel(boolean customerCanCancel) { this.customerCanCancel = customerCanCancel; }
}