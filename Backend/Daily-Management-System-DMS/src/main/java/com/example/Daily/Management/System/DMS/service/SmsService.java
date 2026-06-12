package com.example.Daily.Management.System.DMS.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SmsService {

    // 🔑 MSG91 CONFIG
	 String authKey = "503962AC1drFZvuxw69c7407dP1";
     String senderId = "MilkApKey"; 

    public String sendSms(String mobile, String message) {

        try {

            String url = "https://api.msg91.com/api/v5/flow/";

            RestTemplate restTemplate = new RestTemplate();

            // ✅ BODY
            Map<String, Object> body = new HashMap<>();
            body.put("flow_id", "MilkAppKey");

            // mobile must be without +91
            body.put("mobiles", "91" + mobile);

            // variables for template
            Map<String, String> variables = new HashMap<>();
            variables.put("message", message); // template variable

            body.put("variables", variables);

            // headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("authkey","503962AC1drFZvuxw69c7407dP1" );
            headers.set("Content-Type", "application/json");

            org.springframework.http.HttpEntity<Map<String, Object>> request =
                    new org.springframework.http.HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(url, request, String.class);

            System.out.println("SMS Response: " + response);

            return "SMS Sent Successfully ✅";

        } catch (Exception e) {
            e.printStackTrace();
            return "SMS Failed ❌";
        }
    }
}