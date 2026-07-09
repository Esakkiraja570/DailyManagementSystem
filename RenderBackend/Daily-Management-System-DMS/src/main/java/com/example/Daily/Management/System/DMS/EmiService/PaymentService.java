package com.example.Daily.Management.System.DMS.EmiService;

import java.util.UUID;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class PaymentService {

    private static final String KEY = "rzp_test_SiUZm0fwjT39g4";
    private static final String SECRET = "wYEakifVOdWorUtfNTS68FFd";

    // ================= CREATE ORDER =================
    public Order createOrder(int amount) throws Exception {

        RazorpayClient client = new RazorpayClient(KEY, SECRET);

        JSONObject options = new JSONObject();
        options.put("amount", amount); // in paise
        options.put("currency", "INR");

        // ✅ unique receipt id
        options.put("receipt", "txn_" + UUID.randomUUID());

        return client.orders.create(options);
    }

    // ================= VERIFY SIGNATURE =================
    public boolean verifyPayment(String orderId,
                                 String paymentId,
                                 String signature) {
        try {
            String payload = orderId + "|" + paymentId;

            return Utils.verifySignature(payload, signature, SECRET);

        } catch (Exception e) {
            return false;
        }
    }
}