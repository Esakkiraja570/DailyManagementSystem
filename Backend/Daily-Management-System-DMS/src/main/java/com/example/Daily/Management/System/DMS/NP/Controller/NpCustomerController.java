package com.example.Daily.Management.System.DMS.NP.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.NP.Entity.CustomerSubscription;
import com.example.Daily.Management.System.DMS.NP.Entity.EntryEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;
import com.example.Daily.Management.System.DMS.NP.Service.NpCustomerService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin("*")
public class NpCustomerController {

    @Autowired
    private NpCustomerService service;

    // =========================================
    // CREATE CUSTOMER
    // =========================================
    @PostMapping("/create")
    public ResponseEntity<?> createCustomer(
            @RequestBody NpCustomerEntity customer
    ) {

        try {

            return ResponseEntity.ok(
                    service.createCustomer(customer)
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================
    // UPDATE CUSTOMER
    // =========================================
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long id,
            @RequestBody NpCustomerEntity customer
    ) {

        try {

            return ResponseEntity.ok(
                    service.updateCustomer(id, customer)
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================
    // GET CUSTOMER BY ID
    // =========================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomer(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    service.getCustomer(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================
    // GET ALL CUSTOMERS
    // =========================================
    @GetMapping("/all/{mobile}")
    public ResponseEntity<?> getAllCustomers(
            @PathVariable String mobile
    ) {

        List<NpCustomerEntity> customers =
                service.getAllCustomers(mobile);

        return ResponseEntity.ok(customers);
    }

    // =========================================
    // DELETE CUSTOMER
    // =========================================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCustomer(
            @PathVariable Long id
    ) {

        service.deleteCustomer(id);

        return ResponseEntity.ok(
                "Customer Deleted Successfully"
        );
    }

    // =========================================
    // ADD SUBSCRIPTION
    // =========================================
    @PostMapping("/subscription/add")
    public ResponseEntity<?> addSubscription(
            @RequestBody CustomerSubscription sub
    ) {

        return ResponseEntity.ok(
                service.addSubscription(sub)
        );
    }

    // =========================================
    // GET CUSTOMER SUBSCRIPTIONS
    // =========================================
    @GetMapping("/subscription/{customerId}")
    public ResponseEntity<?> subscriptions(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                service.getSubscriptions(customerId)
        );
    }

    // =========================================
    // GENERATE TODAY ENTRY
    // =========================================
    @PostMapping("/generate-entry")
    public ResponseEntity<?> generateEntry(
            @RequestBody Map<String, String> body
    ) {

        service.generateTodayEntries(
                body.get("distributorMobile")
        );

        return ResponseEntity.ok(
                "Today entries generated successfully"
        );
    }

    // =========================================
    // MARK DELIVERED
    // =========================================
    @PutMapping("/delivered/{entryId}")
    public ResponseEntity<?> delivered(
            @PathVariable Long entryId
    ) {

        return ResponseEntity.ok(
                service.markDelivered(entryId)
        );
    }

    // =========================================
    // CUSTOMER BILL
    // =========================================
    @GetMapping("/bill/{customerId}")
    public ResponseEntity<?> bill(
            @PathVariable Long customerId
    ) {

        Double amount =
                service.calculateBill(customerId);

        return ResponseEntity.ok(
                Map.of(
                        "customerId", customerId,
                        "monthlyBill", amount
                )
        );
    }

    // =========================================
    // CUSTOMER ENTRIES
    // =========================================
    @GetMapping("/entries/{customerId}")
    public ResponseEntity<?> entries(
            @PathVariable Long customerId
    ) {

        List<EntryEntity> entries =
                service.getEntries(customerId);

        return ResponseEntity.ok(entries);
    }

    // =========================================
    // PAUSE CUSTOMER
    // =========================================
    @PutMapping("/pause/{customerId}")
    public ResponseEntity<?> pauseCustomer(
            @PathVariable Long customerId,
            @RequestBody Map<String,String> body
    ) {

        return ResponseEntity.ok(
                service.pauseCustomer(
                        customerId,
                        body.get("startDate"),
                        body.get("endDate")
                )
        );
    }

    // =========================================
    // RESUME CUSTOMER
    // =========================================
    @PutMapping("/resume/{customerId}")
    public ResponseEntity<?> resumeCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                service.resumeCustomer(customerId)
        );
    }

    // =========================================
    // SEND CUSTOMER OTP
    // =========================================
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestBody Map<String,String> body
    ) {

        return ResponseEntity.ok(
                Map.of(
                        "otp",
                        service.sendCustomerOtp(
                                body.get("mobile")
                        )
                )
        );
    }

    // =========================================
    // CUSTOMER LOGIN
    // =========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String,String> body
    ) {

        return ResponseEntity.ok(
                service.verifyCustomerLogin(
                        body.get("mobile"),
                        body.get("otp")
                )
        );
    }
}