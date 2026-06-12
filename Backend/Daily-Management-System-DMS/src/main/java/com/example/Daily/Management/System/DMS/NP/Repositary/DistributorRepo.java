package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperDistributer;

public interface DistributorRepo
        extends JpaRepository<NewspaperDistributer, Long> {

    Optional<NewspaperDistributer> findByMobile(String mobile);

    Optional<NewspaperDistributer> findByEmail(String email);

    Optional<NewspaperDistributer> findByMobileOrEmail(
            String mobile,
            String email
    );
}