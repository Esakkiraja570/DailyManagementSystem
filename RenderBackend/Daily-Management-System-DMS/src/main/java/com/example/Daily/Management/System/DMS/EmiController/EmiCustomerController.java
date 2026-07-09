package com.example.Daily.Management.System.DMS.EmiController;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.EMI.Entity.*;
import com.example.Daily.Management.System.DMS.EmiRepositary.*;
import com.example.Daily.Management.System.DMS.EmiService.*;

@RestController
@RequestMapping("/customer")
@CrossOrigin("*")
public class EmiCustomerController {

    @Autowired
    private EmiCustomerRepo customerRepo;

    @Autowired
    private EmiAgentRepo agentRepo;

    @Autowired
    private EmiCustomerService service;

    @Autowired
    private ScheduleService scheduleService; // ✅ NEW

    // =========================================
    // ✅ ADD CUSTOMER (WITH EMI SCHEDULE)
    // =========================================
    @PostMapping("/add/{agentId}")
    public ResponseEntity<?> addCustomer(@PathVariable Long agentId,
                                         @RequestBody EmiAgentCustomer customer) {

        if (customer.getMobile() == null || customer.getMobile().isEmpty()) {
            return ResponseEntity.badRequest().body("Mobile required ❌");
        }

        if (customerRepo.findFirstByMobile(customer.getMobile()).isPresent()) {
            return ResponseEntity.status(409).body("Mobile already exists ❌");
        }

        EmiAgentEntity agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found ❌"));

        customer.setAgent(agent);
        customer.setId(null);

        // DEFAULTS
        customer.setTotalPaid(Optional.ofNullable(customer.getTotalPaid()).orElse(0.0));
        customer.setStatus("ACTIVE");
        customer.setPaymentType(
                Optional.ofNullable(customer.getPaymentType()).orElse("MONTHLY")
        );
        customer.setLateFee(0.0);

        // EMI CALCULATION
        if (customer.getTotalAmount() != null && customer.getMonths() != null && customer.getMonths() > 0) {
            customer.setEmiAmount(customer.getTotalAmount() / customer.getMonths());
        }

        // BALANCE
        if (customer.getTotalAmount() != null) {
            customer.setBalance(customer.getTotalAmount() - customer.getTotalPaid());
        }

        // SAVE
        EmiAgentCustomer saved = customerRepo.save(customer);

        // 🔥 AUTO CREATE EMI SCHEDULE
        scheduleService.generateSchedule(saved);

        return ResponseEntity.ok(saved);
    }

    // =========================================
    // ✅ GET CUSTOMER (WITH LATE FEE)
    // =========================================
 // ✅ ADD THIS MISSING METHOD TO FIX THE 404 ERROR
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {

        Optional<EmiAgentCustomer> optional = customerRepo.findById(id);

        if (optional.isPresent()) {
            EmiAgentCustomer customer = optional.get();
            service.applyLateFee(customer);
            return ResponseEntity.ok(customer);
        } else {
            return ResponseEntity.status(404)
                    .body("Customer not found with ID: " + id);
        }
    }
    // =========================================
    // ✅ GET ALL CUSTOMERS BY AGENT
    // =========================================
    @GetMapping("/all/{agentId}")
    public ResponseEntity<?> getCustomers(@PathVariable Long agentId) {

        if (!agentRepo.existsById(agentId)) {
            return ResponseEntity.status(404).body("Agent not found ❌");
        }

        List<EmiAgentCustomer> customers = customerRepo.findByAgentId(agentId);

        return ResponseEntity.ok(service.processCustomers(customers));
    }

    // =========================================
    // ✅ SEARCH (NAME OR MOBILE)
    // =========================================
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String mobile) {

        if (mobile != null) {
            return ResponseEntity.ok(
                    customerRepo.findFirstByMobile(mobile)
            );
        }

        if (name != null) {
            return ResponseEntity.ok(
                    customerRepo.findAll().stream()
                            .filter(c -> c.getName() != null &&
                                    c.getName().toLowerCase().contains(name.toLowerCase()))
                            .toList()
            );
        }

        return ResponseEntity.badRequest().body("Provide name or mobile ❌");
    }

    // =========================================
    // ✅ CUSTOMER SUMMARY (VERY IMPORTANT API)
    // =========================================
    @GetMapping("/summary/{id}")
    public ResponseEntity<?> getSummary(@PathVariable Long id) {

        EmiAgentCustomer c = customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found ❌"));

        int pending = service.countPendingEmis(c);

        Map<String, Object> data = new HashMap<>();
        data.put("name", c.getName());
        data.put("totalPaid", c.getTotalPaid());
        data.put("balance", c.getBalance());
        data.put("emiAmount", c.getEmiAmount());
        data.put("pendingEmis", pending);
        data.put("status", c.getStatus());

        return ResponseEntity.ok(data);
    }

    // =========================================
    // ✅ FILTER BY STATUS (ACTIVE / COMPLETED)
    // =========================================
    @GetMapping("/status/{agentId}")
    public ResponseEntity<?> filterByStatus(
            @PathVariable Long agentId,
            @RequestParam String status) {

        List<EmiAgentCustomer> list = customerRepo.findByAgentId(agentId);

        return ResponseEntity.ok(
                list.stream()
                        .filter(c -> status.equalsIgnoreCase(c.getStatus()))
                        .toList()
        );
    }

    // =========================================
    // ✅ UPDATE CUSTOMER
    // =========================================
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id,
                                            @RequestBody EmiAgentCustomer updated) {

        EmiAgentCustomer c = customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found ❌"));

        if (updated.getName() != null) c.setName(updated.getName());
        if (updated.getAddress() != null) c.setAddress(updated.getAddress());
        if (updated.getProductName() != null) c.setProductName(updated.getProductName());
        if (updated.getTotalAmount() != null) c.setTotalAmount(updated.getTotalAmount());
        if (updated.getMonths() != null) c.setMonths(updated.getMonths());

        // RECALCULATE EMI
        if (c.getTotalAmount() != null && c.getMonths() != null && c.getMonths() > 0) {
            c.setEmiAmount(c.getTotalAmount() / c.getMonths());
        }

        // RECALCULATE BALANCE
        if (c.getTotalAmount() != null && c.getTotalPaid() != null) {
            c.setBalance(c.getTotalAmount() - c.getTotalPaid());
        }

        return ResponseEntity.ok(customerRepo.save(c));
    }

    // =========================================
    // ✅ DELETE CUSTOMER
    // =========================================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {

        if (!customerRepo.existsById(id)) {
            return ResponseEntity.status(404).body("Customer not found ❌");
        }

        customerRepo.deleteById(id);

        return ResponseEntity.ok("Deleted successfully ✅");
    }
}