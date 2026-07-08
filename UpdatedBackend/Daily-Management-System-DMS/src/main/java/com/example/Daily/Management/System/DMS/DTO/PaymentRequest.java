package com.example.Daily.Management.System.DMS.DTO;



public class PaymentRequest {
    private Long customerId;
    private double amount; // amount in INR

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}