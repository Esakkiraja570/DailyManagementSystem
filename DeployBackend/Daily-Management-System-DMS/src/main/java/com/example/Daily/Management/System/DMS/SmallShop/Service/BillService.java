package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;
import com.example.Daily.Management.System.DMS.SmallShopEntity.BillIItem;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;
import com.example.Daily.Management.System.DMS.SmallShopRepo.BillRepositary;
import com.example.Daily.Management.System.DMS.SmallShopRepo.SmallshopProductsRepo;

import jakarta.transaction.Transactional;

@Service
public class BillService {

    @Autowired
    private BillRepositary billRepo;

    @Autowired
    private SmallshopProductsRepo productRepo;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private RazorpayService razorpayService;

    // ========================= SAVE BILL =========================
    @Transactional
    public Bill saveBill(Long shopId, Bill bill) {

        if (bill == null) throw new RuntimeException("Bill data missing");
        if (bill.getItems() == null || bill.getItems().isEmpty())
            throw new RuntimeException("Bill items empty");

        bill.setShopId(shopId);
        bill.setDate(LocalDate.now().toString());
        bill.setTime(LocalTime.now().withNano(0).toString());
        bill.setCreatedAt(LocalDateTime.now());
        bill.setBillNumber("BILL-" + System.currentTimeMillis());

        if (bill.getPaymentStatus() == null)
            bill.setPaymentStatus("PENDING");

        double subtotal = 0;

        for (BillIItem item : bill.getItems()) {

            item.setBill(bill);

            Products product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < item.getQuantity())
                throw new RuntimeException("OUT_OF_STOCK: " + product.getProductName());

            product.setStock(product.getStock() - item.getQuantity());
            productRepo.save(product);

            item.setPrice(product.getPrice());

            subtotal += product.getPrice() * item.getQuantity();
        }

        bill.setSubtotal(subtotal);

        double tax = bill.getTax() != null ? bill.getTax() : 0.0;
        double total = subtotal + tax;

        bill.setTotal(total);

        // Razorpay safe
        try {
            var order = razorpayService.createOrder(total);
            if (order != null && order.get("id") != null)
                bill.setRazorpayOrderId(order.get("id").toString());
        } catch (Exception e) {
            System.out.println("Razorpay error: " + e.getMessage());
        }

        // Customer safe
        try {
            Customer customer = customerService.updateCustomer(
                    bill.getCustomerName(),
                    bill.getCustomerPhone(),
                    shopId,
                    total
            );

            if (customer != null)
                bill.setCustomerId(customer.getId());

        } catch (Exception e) {
            System.out.println("Customer error: " + e.getMessage());
        }

        return billRepo.save(bill);
    }

    // ========================= GET RECENT =========================
    public List<Bill> getRecentBills(Long shopId) {
        return billRepo.findByShopIdOrderByCreatedAtDesc(shopId);
    }

    // ========================= CUSTOMER BILLS =========================
    public List<Bill> getCustomerBills(String phone) {
        return billRepo.findByCustomerPhoneOrderByCreatedAtDesc(phone);
    }

    // ========================= SALES =========================
    public Map<String, Object> getSalesReport(Long shopId) {

        List<Bill> bills = billRepo.findByShopIdOrderByCreatedAtDesc(shopId);

        double revenue = bills.stream()
                .mapToDouble(b -> b.getTotal() != null ? b.getTotal() : 0.0)
                .sum();

        Map<String, Object> map = new HashMap<>();
        map.put("totalSales", bills.size());
        map.put("totalRevenue", revenue);

        return map;
    }
}