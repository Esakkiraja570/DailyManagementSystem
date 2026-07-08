package com.example.Daily.Management.System.DMS.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.entity.MilkEntry;
import com.example.Daily.Management.System.DMS.entity.MilkmanCustomers;
import com.example.Daily.Management.System.DMS.repositary.MilkEntryRepo;
import com.example.Daily.Management.System.DMS.repositary.MilkmanCustomerRepo;


@Service
public class MilkService {

    @Autowired
    private MilkEntryRepo milkRepo;

    @Autowired
    private MilkmanCustomerRepo customerRepo;

    public MilkEntry addRegularEntry(Long customerId) {

        MilkmanCustomers customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found ❌"));

        LocalDate today = LocalDate.now();

        // 🔍 Direct DB fetch
        MilkEntry entry = milkRepo.findByCustomerIdAndDate(customerId, today);

        if (entry == null) {
            entry = new MilkEntry();
            entry.setCustomer(customer);
            entry.setDate(today);
        }

        // ✅ set default values
        entry.setMorning(customer.getDefaultMorning());
        entry.setEvening(customer.getDefaultEvening());
        entry.setTotal(entry.getMorning() + entry.getEvening());

        return milkRepo.save(entry);
    }
    // ✅ Add Entry
    public MilkEntry addEntry(Long customerId, MilkEntry entry) {

        MilkmanCustomers customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        entry.setCustomer(customer);

        // ✅ calculate total
        entry.setTotal(entry.getMorning() + entry.getEvening());

        return milkRepo.save(entry);
    }

    public void deleteEntry(Long id) {

        MilkEntry entry = milkRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found ❌"));

        milkRepo.delete(entry);
    }
    // ✅ Get Entries
    public List<MilkEntry> getEntries(Long customerId) {
        return milkRepo.findByCustomer_Id(customerId);
    }

    // ✅ FIXED
    public List<MilkEntry> getEntriesByCustomer(Long customerId) {
        return milkRepo.findByCustomer_Id(customerId);
    }

    // ✅ UPDATE ENTRY (FIXED)
    public MilkEntry updateEntry(Long id, MilkEntry updatedEntry) {

        MilkEntry existing = milkRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));

        existing.setDate(updatedEntry.getDate());
        existing.setMorning(updatedEntry.getMorning());
        existing.setEvening(updatedEntry.getEvening());

        // ✅ IMPORTANT
        existing.setTotal(updatedEntry.getMorning() + updatedEntry.getEvening());

        return milkRepo.save(existing);
    }
}