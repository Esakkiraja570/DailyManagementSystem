package com.example.Daily.Management.System.DMS.SmallShopRepo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;

public interface CustomersRepo extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByPhoneAndShopId(String phone, Long shopId);

	List<Customer> findByShopId(Long shopId);
}