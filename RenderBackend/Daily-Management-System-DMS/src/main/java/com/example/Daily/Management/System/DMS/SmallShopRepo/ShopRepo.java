package com.example.Daily.Management.System.DMS.SmallShopRepo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.Daily.Management.System.DMS.SmallShopEntity.SmallShop;

@Repository
public interface ShopRepo extends JpaRepository<SmallShop, Long> {
    Optional<SmallShop> findByMobile(String mobile);
    SmallShop findByMobileAndPassword(String mobile, String password);
}