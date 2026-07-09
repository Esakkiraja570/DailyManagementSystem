package com.example.Daily.Management.System.DMS.controller;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.entity.MilkEntry;
import com.example.Daily.Management.System.DMS.service.MilkService;




@RestController
@RequestMapping("/api/milk")
@CrossOrigin
public class MilkController {

    @Autowired
    private MilkService service;

    // ✅ ADD ENTRY
    @PostMapping("/add/{customerId}")
    public MilkEntry add(@PathVariable Long customerId,
                         @RequestBody MilkEntry entry) {
        return service.addEntry(customerId, entry);
    }
    @PostMapping("/regular/{customerId}")
    public MilkEntry addRegularEntry(@PathVariable Long customerId) {
        return service.addRegularEntry(customerId);
    }
    @DeleteMapping("/delete/{id}")
    public String deleteEntry(@PathVariable Long id) {
        service.deleteEntry(id);
        return "Entry deleted successfully ✅";
    }
    // ✅ GET ENTRIES
    @GetMapping("/{customerId}")
    public List<MilkEntry> get(@PathVariable Long customerId) {
        return service.getEntries(customerId);
    }
    @GetMapping("/entries/{customerId}")
    public List<MilkEntry> getEntries(@PathVariable Long customerId) {
        return service.getEntriesByCustomer(customerId);
    }
    @PutMapping("/update/{id}")
    public MilkEntry updateEntry(@PathVariable Long id, @RequestBody MilkEntry updatedEntry) {
        return service.updateEntry(id, updatedEntry);
    }
    
    
}