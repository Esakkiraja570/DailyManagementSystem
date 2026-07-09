package com.example.Daily.Management.System.DMS.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.DTO.LoginRequest;
import com.example.Daily.Management.System.DMS.DTO.OtpRequest;
import com.example.Daily.Management.System.DMS.DTO.ResetPasswordRequest;
import com.example.Daily.Management.System.DMS.entity.MilkmanEntity;
import com.example.Daily.Management.System.DMS.service.MilkmanService;

@RestController
@RequestMapping("/api/milkman")
@CrossOrigin(origins = "http://localhost:3000")
public class MilkmanController {

    @Autowired
    private MilkmanService service;

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody MilkmanEntity milkman) {
        try {
            service.registerMilkman(milkman);
            return ResponseEntity.ok("Registered successfully ✅");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            MilkmanEntity user = service.loginMilkman(request);
            user.setPassword(null); // 🔒 hide password
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ✅ GET DATA
    @GetMapping("/me/{mobile}")
    public ResponseEntity<?> getMyData(@PathVariable String mobile) {
        try {
            MilkmanEntity user = service.getMyData(mobile);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // ✅ UPDATE PRICE
    @PutMapping("/update-price/{mobile}")
    public ResponseEntity<?> updatePrice(
            @PathVariable String mobile,
            @RequestParam double price
    ) {
        try {
            return ResponseEntity.ok(service.updatePrice(mobile, price));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // ✅ SEND OTP
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        try {
            return ResponseEntity.ok(service.sendOtp(request.getMobile()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // ✅ RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            return ResponseEntity.ok(service.resetPassword(
                    request.getMobile(),
                    request.getOtp(),
                    request.getNewPassword()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}