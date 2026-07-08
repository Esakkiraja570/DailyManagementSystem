package com.example.Daily.Management.System.DMS.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.service.SmsService;



@RestController
@RequestMapping("/api/sms")
@CrossOrigin(origins = "http://localhost:3000")
public class SmsController {

    @Autowired
    private SmsService smsService;

    // ✅ SEND SMS API
    @PostMapping("/send")
    public String sendSms(
            @RequestParam String mobile,
            @RequestParam String message
    ) {
        return smsService.sendSms(mobile, message);
    }
}