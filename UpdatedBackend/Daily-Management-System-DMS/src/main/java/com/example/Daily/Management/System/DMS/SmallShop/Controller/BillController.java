package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.SmallShop.Service.BillService;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;

@RestController
@RequestMapping("/api/smallshop")
@CrossOrigin(origins = "*")
public class BillController {

    @Autowired
    private BillService billService;

    // =====================================
    // CREATE BILL
    // =====================================
    @PostMapping("/{shopId}/bills")
    public ResponseEntity<?> createBill(
            @PathVariable Long shopId,
            @RequestBody Bill bill
    ) {

        try {

            System.out.println("========= BILL REQUEST =========");
            System.out.println("Shop ID : " + shopId);
            System.out.println("Bill    : " + bill);

            if (bill == null) {

                Map<String, Object> error = new HashMap<>();

                error.put("success", false);
                error.put("message", "Bill data is missing");

                return ResponseEntity.badRequest().body(error);
            }

            if (bill.getItems() == null || bill.getItems().isEmpty()) {

                Map<String, Object> error = new HashMap<>();

                error.put("success", false);
                error.put("message", "Bill items cannot be empty");

                return ResponseEntity.badRequest().body(error);
            }

            // SAVE BILL
            Bill savedBill = billService.saveBill(shopId, bill);

            Map<String, Object> response = new HashMap<>();

            response.put("success", true);
            response.put("message", "Bill created successfully");
            response.put("data", savedBill);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            e.printStackTrace();

            // OUT OF STOCK
            if (e.getMessage() != null &&
                    e.getMessage().startsWith("OUT_OF_STOCK")) {

                String[] parts = e.getMessage().split(":");

                String productName =
                        parts.length > 1 ? parts[1] : "Product";

                Map<String, Object> error = new HashMap<>();

                error.put("success", false);
                error.put(
                        "message",
                        "Not enough stock for " + productName
                );

                return ResponseEntity
                        .badRequest()
                        .body(error);
            }

            Map<String, Object> error = new HashMap<>();

            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity
                    .internalServerError()
                    .body(error);

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();

            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity
                    .internalServerError()
                    .body(error);
        }
    }

    // =====================================
    // GET RECENT BILLS
    // =====================================
    @GetMapping("/{shopId}/recent-bills")
    public ResponseEntity<?> getRecentBills(
            @PathVariable Long shopId
    ) {

        try {

            List<Bill> bills =
                    billService.getRecentBills(shopId);

            return ResponseEntity.ok(bills);

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error =
                    new HashMap<>();

            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity
                    .internalServerError()
                    .body(error);
        }
    }

    // =====================================
    // SALES REPORT
    // =====================================
    @GetMapping("/{shopId}/sales-report")
    public ResponseEntity<?> getSalesReport(
            @PathVariable Long shopId
    ) {

        try {

            Map<String, Object> report =
                    billService.getSalesReport(shopId);

            return ResponseEntity.ok(report);

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error =
                    new HashMap<>();

            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity
                    .internalServerError()
                    .body(error);
        }
    }
}