package com.example.Daily.Management.System.DMS.NP.Repositary;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.OtpEntity;

public interface OtpRepo
        extends JpaRepository<OtpEntity, Long> {

    OtpEntity findTopByMobileOrderByIdDesc(
            String mobile
    );
}