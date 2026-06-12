package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;

public interface CustomerRepo
        extends JpaRepository<NpCustomerEntity, Long> {

    // Get all customers of distributor
    List<NpCustomerEntity> findByDistributorMobile(String mobile);

    // Customer login
    Optional<NpCustomerEntity> findByMobile(String mobile);

    // Search customer by name
    List<NpCustomerEntity> findByNameContainingIgnoreCase(String name);

    // Route customers
    List<NpCustomerEntity> findByRouteName(String routeName);

    // Pending bill customers
    List<NpCustomerEntity> findByPaymentStatus(String paymentStatus);
  
}