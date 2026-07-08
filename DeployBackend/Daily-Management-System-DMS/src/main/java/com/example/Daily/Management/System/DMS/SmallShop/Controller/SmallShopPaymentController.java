package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.Map;

import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.razorpay.RazorpayClient;

@RestController
@RequestMapping("/api/smallshop/payment") // ✅ FIXED PATH
@CrossOrigin("*")
public class SmallShopPaymentController {

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {

        try {

            int amount = Integer.parseInt(data.get("amount").toString());

            RazorpayClient client = new RazorpayClient(
                "rzp_test_SiUZm0fwjT39g4",
                "wYEakifVOdWorUtfNTS68FFd"
            );

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

            com.razorpay.Order order = client.orders.create(orderRequest);

            return ResponseEntity.ok(order.toString());

        } catch (Exception e) {

            return ResponseEntity.status(500)
                .body("Payment failed: " + e.getMessage());
        }
    }
}