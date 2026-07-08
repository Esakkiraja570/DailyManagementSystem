package com.example.Daily.Management.System.DMS.SmallShop.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class RazorpayService {
    
    public Order createOrder(double amount) throws Exception {
        // Replace with your actual credentials
        RazorpayClient client = new RazorpayClient("rzp_test_your_id", "your_secret");

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100)); // amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        return client.orders.create(orderRequest);
    }
}