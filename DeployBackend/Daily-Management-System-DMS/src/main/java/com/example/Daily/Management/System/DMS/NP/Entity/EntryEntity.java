package com.example.Daily.Management.System.DMS.NP.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_entries")
public class EntryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deliveryDate;

    private Long customerId;

    private Long newspaperId;

    private String customerName;

    private String newspaperName;

    private Integer quantity;

    private Double amount;

    private Boolean delivered = false;

    private String deliveredTime;

    private String distributorMobile;

    // ================= GETTERS SETTERS =================

    public Long getId() {
        return id;
    }

    public String getDeliveryDate() {
        return deliveryDate;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public Long getNewspaperId() {
        return newspaperId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getNewspaperName() {
        return newspaperName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Double getAmount() {
        return amount;
    }

    public Boolean getDelivered() {
        return delivered;
    }

    public String getDeliveredTime() {
        return deliveredTime;
    }

    public String getDistributorMobile() {
        return distributorMobile;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDeliveryDate(String deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setNewspaperId(Long newspaperId) {
        this.newspaperId = newspaperId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setNewspaperName(String newspaperName) {
        this.newspaperName = newspaperName;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public void setDelivered(Boolean delivered) {
        this.delivered = delivered;
    }

    public void setDeliveredTime(String deliveredTime) {
        this.deliveredTime = deliveredTime;
    }

    public void setDistributorMobile(String distributorMobile) {
        this.distributorMobile = distributorMobile;
    }

	public void setDate(String string) {
		// TODO Auto-generated method stub
		
	}

	public void setStatus(String string) {
		// TODO Auto-generated method stub
		
	}
}