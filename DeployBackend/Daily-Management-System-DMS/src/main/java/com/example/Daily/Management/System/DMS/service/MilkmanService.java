package com.example.Daily.Management.System.DMS.service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.DTO.LoginRequest;
import com.example.Daily.Management.System.DMS.entity.MilkmanEntity;
import com.example.Daily.Management.System.DMS.repositary.MilkmanRepo;


@Service
public class MilkmanService {

    @Autowired
    private MilkmanRepo repo;

    private Map<String, String> otpStore = new HashMap<>();

    // ✅ REGISTER
    public void registerMilkman(MilkmanEntity milkman) {
        repo.save(milkman);
    }

    // ✅ LOGIN
    public MilkmanEntity loginMilkman(LoginRequest request) {
        MilkmanEntity user = repo.findByMobile(request.getMobile())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    // ✅ GET DATA
    public MilkmanEntity getMyData(String mobile) {
        return repo.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ UPDATE PRICE
    public String updatePrice(String mobile, double price) {
        MilkmanEntity user = getMyData(mobile);
        user.setPrice(price);
        repo.save(user);
        return "Price updated successfully";
    }

    // ✅ SEND OTP
    public String sendOtp(String mobile) {
        String otp = String.valueOf(new Random().nextInt(9000) + 1000);
        otpStore.put(mobile, otp);

        System.out.println("OTP for " + mobile + " : " + otp); // simulate
        return "OTP Sent Successfully";
    }

    // ✅ RESET PASSWORD
    public String resetPassword(String mobile, String otp, String newPassword) {
        if (!otpStore.containsKey(mobile) || !otpStore.get(mobile).equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        MilkmanEntity user = getMyData(mobile);
        user.setPassword(newPassword);
        repo.save(user);

        otpStore.remove(mobile);
        return "Password reset successful";
    }
}