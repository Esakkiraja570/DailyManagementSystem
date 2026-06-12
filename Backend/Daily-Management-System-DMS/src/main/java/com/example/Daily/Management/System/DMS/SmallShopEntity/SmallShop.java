package com.example.Daily.Management.System.DMS.SmallShopEntity;

import jakarta.persistence.*;

@Entity
public class SmallShop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shopId;

    private String ownerName;
    private String shopName;
    private String mobile;
    private String email;
    private String shopAddress;
    private String city;
    private String area;
    private String password;
    private String whatsappNumber;
    private String otp; // Added this field for Forgot Password logic

    // GETTERS & SETTERS
    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getShopAddress() { return shopAddress; }
    public void setShopAddress(String shopAddress) { this.shopAddress = shopAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}