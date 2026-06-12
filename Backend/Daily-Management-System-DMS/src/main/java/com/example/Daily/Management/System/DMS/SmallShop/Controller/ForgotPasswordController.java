package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.SmallShopEntity.SmallShop;
import com.example.Daily.Management.System.DMS.SmallShopRepo.ShopRepo;

@RestController
@RequestMapping("/api/smallshop")
@CrossOrigin("*")
public class ForgotPasswordController {

    @Autowired
    private ShopRepo repo;

    @PostMapping("/forgot-password")
    public Object forgotPassword(
            @RequestBody Map<String, String> req
    ) {

        String mobile = req.get("mobile");

        Optional<SmallShop> optional =
                repo.findByMobile(mobile);

        if (optional.isEmpty()) {
            return "Account not found";
        }

        SmallShop shop = optional.get();

        String otp =
                String.valueOf(
                        1000 + new Random().nextInt(9000)
                );

        shop.setOtp(otp);

        repo.save(shop);

        System.out.println("SHOP OTP = " + otp);

        return Map.of(
                "success", true,
                "message", "OTP sent"
        );
    }

    @PostMapping("/reset-password")
    public Object resetPassword(
            @RequestBody Map<String, String> req
    ) {

        String mobile = req.get("mobile");
        String otp = req.get("otp");
        String newPassword = req.get("newPassword");

        Optional<SmallShop> optional =
                repo.findByMobile(mobile);

        if (optional.isEmpty()) {
            return "User not found";
        }

        SmallShop shop = optional.get();

        if (!otp.equals(shop.getOtp())) {
            return "Invalid OTP";
        }

        shop.setPassword(newPassword);

        repo.save(shop);

        return Map.of(
                "success", true,
                "message", "Password reset success"
        );
    }
}