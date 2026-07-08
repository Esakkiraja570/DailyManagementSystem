package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // Change this import
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.DTO.LoginRequest;
import com.example.Daily.Management.System.DMS.SmallShopEntity.SmallShop;
import com.example.Daily.Management.System.DMS.SmallShopRepo.ShopRepo;

@Service
public class SmallShopService {

    @Autowired
    private ShopRepo repo;

    @Autowired
    private PasswordEncoder encoder; // Changed from BCryptPasswordEncoder to PasswordEncoder

    public SmallShop register(SmallShop shop) {
        if (repo.findByMobile(shop.getMobile()).isPresent()) {
            throw new RuntimeException("Mobile already registered ❌");
        }
        shop.setPassword(encoder.encode(shop.getPassword()));
        return repo.save(shop);
    }

    public SmallShop login(LoginRequest request) {
        Optional<SmallShop> optionalShop = repo.findByMobile(request.getMobile());
        if (optionalShop.isEmpty()) {
            throw new RuntimeException("USER_NOT_FOUND");
        }
        SmallShop shop = optionalShop.get();
        if (!encoder.matches(request.getPassword(), shop.getPassword())) {
            throw new RuntimeException("INVALID_PASSWORD");
        }
        return shop;
    }

    public Optional<SmallShop> getProfile(String mobile) {
        return repo.findByMobile(mobile);
    }
}