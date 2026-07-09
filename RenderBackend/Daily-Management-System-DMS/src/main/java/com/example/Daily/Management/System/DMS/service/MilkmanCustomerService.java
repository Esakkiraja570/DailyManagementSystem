package com.example.Daily.Management.System.DMS.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.entity.MilkEntry;
import com.example.Daily.Management.System.DMS.entity.MilkmanCustomers;
import com.example.Daily.Management.System.DMS.entity.MilkmanEntity;
import com.example.Daily.Management.System.DMS.repositary.MilkEntryRepo;
import com.example.Daily.Management.System.DMS.repositary.MilkmanCustomerRepo;
import com.example.Daily.Management.System.DMS.repositary.MilkmanRepo;

@Service
public class MilkmanCustomerService {

    @Autowired
    private MilkmanCustomerRepo customerRepo;

    @Autowired
    private MilkmanRepo milkmanRepo;

    @Autowired
    private MilkEntryRepo milkEntryRepo; // ✅ ADD THIS

    // ✅ ADD CUSTOMER
    public MilkmanCustomers addCustomer(MilkmanCustomers customer, String mobile) {

        MilkmanEntity milkman = milkmanRepo.findByMobile(mobile)
            .orElseThrow(() -> new RuntimeException("Milkman not found ❌"));

        customer.setMilkman(milkman);

        return customerRepo.save(customer);
    }

    // ✅ GET ALL CUSTOMERS OF MILKMAN
    public List<MilkmanCustomers> getMyCustomers(String mobile) {

        MilkmanEntity milkman = milkmanRepo.findByMobile(mobile)
            .orElseThrow(() -> new RuntimeException("Milkman not found ❌"));

        return customerRepo.findByMilkmanId(milkman.getId());
    }

    // ✅ CUSTOMER LOGIN (IMPORTANT)
   

    // ✅ ADD MILK ENTRY
    public MilkEntry addEntry(Long customerId, MilkEntry entry) {

        MilkmanCustomers customer = customerRepo.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Customer not found"));

        double total = entry.getMorning() + entry.getEvening();
        entry.setTotal(total);

        entry.setCustomer(customer);

        return milkEntryRepo.save(entry); // ✅ FIXED
    }
  
    public MilkmanCustomers getCustomerByMobile(String mobile) {

        MilkmanCustomers customer = customerRepo.findByMobile(mobile);

        if (customer == null) {
            throw new RuntimeException("Customer not found ❌");
        }

        return customer;
    }
    public MilkmanEntity getMilkmanByCustomerMobile(String mobile) {

        MilkmanCustomers customer = customerRepo.findByMobile(mobile);

        if (customer == null) {
            throw new RuntimeException("Customer not found ❌");
        }

        return customer.getMilkman(); // 🔥 MAIN LOGIC
    }
	
}