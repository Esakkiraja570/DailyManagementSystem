package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


import com.example.Daily.Management.System.DMS.NP.Entity.NpPayemntEntity;



public interface NpPaymentRepo
        extends JpaRepository<NpPayemntEntity, Long> {

    List<NpPayemntEntity> findByCustomerId(
            Long customerId
    );

    List<NpPayemntEntity> findByDistributorMobile(
            String mobile
    );
}