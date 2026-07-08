package com.example.Daily.Management.System.DMS.EmiService;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    private final Map<String, String> otpMap = new HashMap<>();
    private final Map<String, Long> expiryMap = new HashMap<>();

    private static final long EXPIRY_TIME = 2 * 60 * 1000; // 2 mins

    public String generateOtp(String mobile) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        otpMap.put(mobile, otp);
        expiryMap.put(mobile, System.currentTimeMillis() + EXPIRY_TIME);

        System.out.println("OTP for " + mobile + " = " + otp); // 🔥 test only

        return otp;
    }

    public boolean verifyOtp(String mobile, String otp) {
        if (!otpMap.containsKey(mobile)) return false;

        String storedOtp = otpMap.get(mobile);
        Long expiry = expiryMap.get(mobile);

        if (expiry == null || System.currentTimeMillis() > expiry) {
            otpMap.remove(mobile);
            expiryMap.remove(mobile);
            return false;
        }

        if (storedOtp.equals(otp)) {
            otpMap.remove(mobile);
            expiryMap.remove(mobile);
            return true;
        }

        return false;
    }
}