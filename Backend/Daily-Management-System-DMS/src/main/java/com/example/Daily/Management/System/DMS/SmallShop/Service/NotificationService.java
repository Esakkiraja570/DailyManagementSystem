package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void sendBulkSMS(List<String> mobileNumbers, String message) {
        // In a real app, you would call an API like Twilio or Gupshup here
        System.out.println("--- Sending Notifications ---");
        for (String mobile : mobileNumbers) {
            System.out.println("To: " + mobile + " | Message: " + message);
        }
        System.out.println("--- All Notifications Sent ---");
    }

    public void sendBillNotification(String mobile, double amount) {
        String msg = "Thank you for shopping! Your bill amount is ₹" + amount + ". View details on your dashboard.";
        System.out.println("Sending Bill SMS to: " + mobile + " Message: " + msg);
    }
}