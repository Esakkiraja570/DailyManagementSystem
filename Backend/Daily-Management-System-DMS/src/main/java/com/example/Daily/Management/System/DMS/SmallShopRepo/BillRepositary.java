package com.example.Daily.Management.System.DMS.SmallShopRepo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;

public interface BillRepositary extends JpaRepository<Bill, Long> {

    // Recent bills for shop
    List<Bill> findByShopIdOrderByCreatedAtDesc(Long shopId);

    // Bills by customer phone
    List<Bill> findByCustomerPhoneOrderByCreatedAtDesc(String phone);

    // Optional: shop + phone filter
    List<Bill> findByShopIdAndCustomerPhone(Long shopId, String phone);

	List<Bill> findByCustomerPhone(String phone);

	List<Bill> findByShopId(Long shopId);

	List<Bill> findByCustomerId(Long id);
	
}