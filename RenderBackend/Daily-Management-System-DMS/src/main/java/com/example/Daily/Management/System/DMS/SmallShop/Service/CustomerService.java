package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;
import com.example.Daily.Management.System.DMS.SmallShopRepo.CustomersRepo;

@Service
public class CustomerService {

    @Autowired
    private CustomersRepo customerRepo;

    // ✅ SEPARATE TRANSACTION (VERY IMPORTANT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Customer updateCustomer(
            String name,
            String phone,
            Long shopId,
            double amount
    ) {

        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        Optional<Customer> existingCustomer =
                customerRepo.findByPhoneAndShopId(phone, shopId);

        Customer customer;

        if (existingCustomer.isPresent()) {
            customer = existingCustomer.get();
        } else {
            customer = new Customer();
            customer.setPhone(phone);
            customer.setShopId(shopId);
            customer.setTotalPurchase(0.0);
            customer.setVisitCount(0);
            customer.setPurchaseLevel("bronze");

            // ✅ IMPORTANT FIX
            customer.setVerified(false);
        }

        customer.setName(name != null ? name : "Customer");
        customer.setLastVisitDate(LocalDate.now().toString());

        customer.setTotalPurchase(customer.getTotalPurchase() + amount);
        customer.setVisitCount(customer.getVisitCount() + 1);

        double total = customer.getTotalPurchase();

        if (total >= 10000) {
            customer.setPurchaseLevel("gold");
        } else if (total >= 5000) {
            customer.setPurchaseLevel("silver");
        } else {
            customer.setPurchaseLevel("bronze");
        }

        return customerRepo.save(customer);
    }
}