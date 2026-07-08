package com.example.Daily.Management.System.DMS.SmallShopEntity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private Long shopId;

    private double totalPurchase = 0.0;
    private int visitCount = 0;

    private String purchaseLevel = "bronze";
    private String lastVisitDate;

    // ✅ IMPORTANT FIX (for your DB error)
    @Column(nullable = false)
    private Boolean verified = false;

    // ❌ OPTIONAL: REMOVE OTP if not used
    @JsonIgnore
    private String otp;

    // =========================================
    // ✅ JSON SUPPORT (_id for frontend)
    // =========================================
    @JsonProperty("_id")
    public Long get_id() {
        return id;
    }

    // =========================================
    // GETTERS & SETTERS
    // =========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getShopId() {
        return shopId;
    }

    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }

    public double getTotalPurchase() {
        return totalPurchase;
    }

    public void setTotalPurchase(double totalPurchase) {
        this.totalPurchase = totalPurchase;
    }

    public int getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
    }

    public String getPurchaseLevel() {
        return purchaseLevel;
    }

    public void setPurchaseLevel(String purchaseLevel) {
        this.purchaseLevel = purchaseLevel;
    }

    public String getLastVisitDate() {
        return lastVisitDate;
    }

    public void setLastVisitDate(String lastVisitDate) {
        this.lastVisitDate = lastVisitDate;
    }

    // =========================================
    // ✅ VERIFIED (FIXED PROPERLY)
    // =========================================

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    // =========================================
    // ✅ OTP (OPTIONAL)
    // =========================================

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}