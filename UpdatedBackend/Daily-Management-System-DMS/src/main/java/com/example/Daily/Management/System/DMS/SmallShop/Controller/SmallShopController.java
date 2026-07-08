package com.example.Daily.Management.System.DMS.SmallShop.Controller;



import java.util.HashMap;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.DTO.LoginRequest;
import com.example.Daily.Management.System.DMS.SmallShop.Service.SmallShopService;
import com.example.Daily.Management.System.DMS.SmallShopEntity.SmallShop;


@RestController
@RequestMapping("/api/smallshop")
@CrossOrigin("*")
public class SmallShopController {

    @Autowired
    private SmallShopService service;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody SmallShop shop) {

        SmallShop saved = service.register(shop);

        // ✅ response format (matches your frontend)
        Map<String, Object> response = new HashMap<>();
        response.put("shopId", saved.getShopId());
        response.put("token", "dummy-token"); // 🔥 later replace with JWT

        return response;
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {
            SmallShop shop = service.login(request);

            Map<String, Object> response = new HashMap<>();
            response.put("shopId", shop.getShopId());
            response.put("shopName", shop.getShopName());
            response.put("token", "dummy-token");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            if (e.getMessage().equals("USER_NOT_FOUND")) {
                return ResponseEntity.status(404).body("Shop account not found");
            }

            if (e.getMessage().equals("INVALID_PASSWORD")) {
                return ResponseEntity.status(401).body("Invalid mobile or password");
            }

            return ResponseEntity.status(500).body("Login failed");
        }
    }
    @GetMapping("/profile/{mobile}")
    public Optional<SmallShop> getProfile(@PathVariable String mobile) {
        return service.getProfile(mobile);
    }
  
}
