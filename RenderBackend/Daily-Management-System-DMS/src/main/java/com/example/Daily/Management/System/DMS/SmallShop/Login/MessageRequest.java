package com.example.Daily.Management.System.DMS.SmallShop.Login;

public class MessageRequest {
    private String phone;
    private String message;
    private String shopId;

    // Getters and Setters
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getShopId() { return shopId; }
    public void setShopId(String shopId) { this.shopId = shopId; }
}