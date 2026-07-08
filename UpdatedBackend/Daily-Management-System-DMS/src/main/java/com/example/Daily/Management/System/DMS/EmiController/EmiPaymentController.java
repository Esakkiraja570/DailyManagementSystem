package com.example.Daily.Management.System.DMS.EmiController;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentCustomer;
import com.example.Daily.Management.System.DMS.EMI.Entity.PaymentEntity;
import com.example.Daily.Management.System.DMS.EmiEnum.PaymentMode;
import com.example.Daily.Management.System.DMS.EmiRepositary.EmiCustomerRepo;
import com.example.Daily.Management.System.DMS.EmiRepositary.PaymentRepo;
import com.example.Daily.Management.System.DMS.EmiService.EmiPaymentService;
import com.example.Daily.Management.System.DMS.EmiService.PaymentService;
import com.razorpay.Order;

@RestController
@RequestMapping("/payment")
@CrossOrigin("*")
public class EmiPaymentController {

    @Autowired
    private PaymentService razorpayService;

    @Autowired
    private EmiCustomerRepo customerRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private EmiPaymentService paymentService;

    @PostMapping("/create-order/{id}")
    public ResponseEntity<?> createOrder(@PathVariable Long id) {
        try {
            EmiAgentCustomer customer = customerRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Customer not found ❌"));

            if (customer.getEmiAmount() == null) {
                throw new RuntimeException("EMI amount not set ❌");
            }

            double lateFee = customer.getLateFee() != null ? customer.getLateFee() : 0.0;
            double total = customer.getEmiAmount() + lateFee;

            int amount = (int) (total * 100);

            Order order = razorpayService.createOrder(amount);

            // ✅ IMPORTANT: return proper JSON
            return ResponseEntity.ok(Map.of(
                    "id", order.get("id"),
                    "amount", order.get("amount")
            ));

        } catch (Exception e) {
            e.printStackTrace(); // 👈 see error in console
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // ✅ VERIFY PAYMENT
    @PostMapping("/verify/{id}")
    public ResponseEntity<?> verify(@PathVariable Long id,
                                   @RequestBody Map<String, Object> req) {
        try {
            Double amount = Double.valueOf(req.get("amount").toString());
            PaymentMode mode = PaymentMode.valueOf(req.get("mode").toString());

            String orderId = req.get("razorpayOrderId").toString();
            String paymentId = req.get("razorpayPaymentId").toString();
            String signature = req.get("razorpaySignature").toString();

            // ✅ VERIFY SIGNATURE
            boolean isValid = razorpayService.verifyPayment(orderId, paymentId, signature);

            if (!isValid) {
                return ResponseEntity.badRequest().body("Invalid payment signature ❌");
            }

            // ✅ PROCESS EMI
            PaymentEntity payment = paymentService.payEmi(id, amount, mode);

            return ResponseEntity.ok(payment);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ TOTAL PAYABLE (EMI + LATE FEE)
    @GetMapping("/total/{id}")
    public ResponseEntity<?> getTotal(@PathVariable Long id) {
        try {
            EmiAgentCustomer c = customerRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Customer not found ❌"));

            double emi = c.getEmiAmount() != null ? c.getEmiAmount() : 0.0;
            double late = c.getLateFee() != null ? c.getLateFee() : 0.0;

            return ResponseEntity.ok(Map.of(
                    "emiAmount", emi,
                    "lateFee", late,
                    "total", emi + late
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ PAYMENT HISTORY
    @GetMapping("/history/{customerId}")
    public ResponseEntity<?> getHistory(@PathVariable Long customerId) {
        try {
            List<PaymentEntity> payments = paymentRepo.findByCustomerId(customerId);
            return ResponseEntity.ok(payments);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}