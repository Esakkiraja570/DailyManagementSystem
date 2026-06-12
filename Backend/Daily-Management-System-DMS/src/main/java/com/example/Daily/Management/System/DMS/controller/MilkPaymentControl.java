package com.example.Daily.Management.System.DMS.controller;

import org.json.JSONObject;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.DTO.PaymentRequest;
import com.razorpay.RazorpayClient;




@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class MilkPaymentControl {


	    private static final String KEY = "rzp_test_SiUZm0fwjT39g4";
	    private static final String SECRET = "wYEakifVOdWorUtfNTS68FFd";

	    @PostMapping("/create-order")
	    public String createOrder(@RequestBody PaymentRequest request) {
	        try {

	            RazorpayClient client = new RazorpayClient(KEY, SECRET);

	            int amount = (int) Math.round(request.getAmount() * 100); // ✅ paise

	            JSONObject options = new JSONObject();
	            options.put("amount", amount);
	            options.put("currency", "INR");
	            options.put("receipt", "txn_" + System.currentTimeMillis());

	            com.razorpay.Order order = client.orders.create(options);

	            return order.toString();

	        } catch (Exception e) {
	            e.printStackTrace();
	            return "ERROR";
	        }
	    }
	}
