package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;
import com.example.Daily.Management.System.DMS.SmallShopEntity.SmallShop;
import com.example.Daily.Management.System.DMS.SmallShopRepo.BillRepositary;
import com.example.Daily.Management.System.DMS.SmallShopRepo.CustomersRepo;
import com.example.Daily.Management.System.DMS.SmallShopRepo.ShopRepo;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin
public class CustomerController {

    @Autowired
    private CustomersRepo customerRepo;

    @Autowired
    private BillRepositary billRepo;

    @Autowired
    private ShopRepo shopRepo;

    // =========================================
    // ✅ LOGIN FETCH (SAFE RESPONSE)
    // =========================================
    @GetMapping("/fetch/{phone}")
    public Map<String, Object> fetchCustomer(@PathVariable String phone) {

        Map<String, Object> res = new HashMap<>();

        try {
            Customer customer = customerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            res.put("success", true);
            res.put("name", customer.getName());
            res.put("customerId", customer.getId());
            res.put("phone", customer.getPhone());

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }

        return res;
    }

    // =========================================
    // ✅ CUSTOMER DASHBOARD (FULL SAFE VERSION)
    // =========================================
    @GetMapping("/dashboard/{phone}")
    public Map<String, Object> getDashboard(@PathVariable String phone) {

        Map<String, Object> res = new HashMap<>();

        try {

            // 🔹 CUSTOMER
            Customer customer = customerRepo.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            // 🔹 BILLS
            List<Bill> bills = billRepo.findByCustomerId(customer.getId());

            // ✅ FIX: prevent lazy loading crash
            bills.forEach(b -> {
                if (b.getItems() != null) {
                    b.getItems().size(); // force load
                }
            });

            // 🔹 TOTAL AMOUNT
            double totalAmount = bills.stream()
                    .mapToDouble(b -> b.getTotal() != null ? b.getTotal() : 0.0)
                    .sum();

            // 🔹 SHOP DETAILS
            String shopName = "Unknown Shop";
            Map<String, Object> shopData = null;

            if (customer.getShopId() != null) {

                Optional<SmallShop> shopOpt =
                        shopRepo.findById(customer.getShopId());

                if (shopOpt.isPresent()) {

                    SmallShop shop = shopOpt.get();

                    shopName = shop.getShopName();

                    shopData = new HashMap<>();
                    shopData.put("shopName", shop.getShopName());
                    shopData.put("ownerName", shop.getOwnerName());
                    shopData.put("mobile", shop.getMobile());
                    shopData.put("address", shop.getShopAddress());
                }
            }

            // 🔹 FINAL RESPONSE
            res.put("success", true);
            res.put("customer", customer);
            res.put("shopName", shopName);
            res.put("shop", shopData);
            res.put("bills", bills);
            res.put("totalAmount", totalAmount);

        } catch (Exception e) {

            res.put("success", false);
            res.put("message", e.getMessage());
        }

        return res;
    }
}