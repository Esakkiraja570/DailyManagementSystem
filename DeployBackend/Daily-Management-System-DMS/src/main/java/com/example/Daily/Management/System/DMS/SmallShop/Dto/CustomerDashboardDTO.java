package com.example.Daily.Management.System.DMS.SmallShop.Dto;



import java.util.List;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;

public class CustomerDashboardDTO {

    private String customerName;
    private String phone;
    private String purchaseLevel;
    private double totalPurchase;
    private int visitCount;

    private String shopName;

    private List<Bill> orders;

    // GETTERS & SETTERS

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPurchaseLevel() { return purchaseLevel; }
    public void setPurchaseLevel(String purchaseLevel) { this.purchaseLevel = purchaseLevel; }

    public double getTotalPurchase() { return totalPurchase; }
    public void setTotalPurchase(double totalPurchase) { this.totalPurchase = totalPurchase; }

    public int getVisitCount() { return visitCount; }
    public void setVisitCount(int visitCount) { this.visitCount = visitCount; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public List<Bill> getOrders() { return orders; }
    public void setOrders(List<Bill> orders) { this.orders = orders; }
}