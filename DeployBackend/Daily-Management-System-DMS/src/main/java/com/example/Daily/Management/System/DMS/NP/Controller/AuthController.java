package com.example.Daily.Management.System.DMS.NP.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperDistributer;
import com.example.Daily.Management.System.DMS.NP.Service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService service;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody NewspaperDistributer distributor
    ) {

        try {

            return ResponseEntity.ok(
                    service.register(distributor)
            );

        } catch (RuntimeException e) {

            if (e.getMessage().equals("MOBILE_EXISTS")) {

                return ResponseEntity.badRequest()
                        .body("Mobile already exists");
            }

            if (e.getMessage().equals("EMAIL_EXISTS")) {

                return ResponseEntity.badRequest()
                        .body("Email already exists");
            }

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> body
    ) {

        try {

            return ResponseEntity.ok(
                    service.login(
                            body.get("username"),
                            body.get("password")
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // SEND OTP
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestBody Map<String, String> body
    ) {

        String otp =
                service.sendOtp(body.get("mobile"));

        return ResponseEntity.ok(
                Map.of(
                        "message", "OTP Sent",
                        "otp", otp
                )
        );
    }

    // VERIFY OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> body
    ) {

        boolean verified =
                service.verifyOtp(
                        body.get("mobile"),
                        body.get("otp")
                );

        if (verified) {

            return ResponseEntity.ok(
                    "OTP Verified"
            );
        }

        return ResponseEntity.badRequest()
                .body("Invalid OTP");
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> body
    ) {

        service.resetPassword(
                body.get("mobile"),
                body.get("newPassword")
        );

        return ResponseEntity.ok(
                "Password Reset Successful"
        );
    }
}