package com.example.Daily.Management.System.DMS.SmallShopRepo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Offer;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    
    List<Offer> findByShopId(Long shopId);
    
    List<Offer> findByIsActiveTrue();

    @Query("SELECT DISTINCT b.customerPhone FROM Bill b WHERE b.shopId = :shopId")
    List<String> findDistinctCustomerMobileByShopId(@Param("shopId") Long shopId);
}