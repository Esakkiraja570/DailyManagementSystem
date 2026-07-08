package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.EntryEntity;

public interface EntryRepo
        extends JpaRepository<EntryEntity, Long> {

    List<EntryEntity> findByCustomerId(Long customerId);

    List<EntryEntity> findByDeliveryDateAndDistributorMobile(
            String date,
            String distributorMobile
    );
}