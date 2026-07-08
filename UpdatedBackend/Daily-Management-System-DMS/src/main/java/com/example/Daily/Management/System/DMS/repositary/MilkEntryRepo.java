package com.example.Daily.Management.System.DMS.repositary;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Daily.Management.System.DMS.entity.MilkEntry;
@Repository
public interface MilkEntryRepo extends JpaRepository<MilkEntry, Long> {

    List<MilkEntry> findByCustomer_Id(Long customerId);

    boolean existsByCustomer_IdAndDate(Long customerId, LocalDate date);

	MilkEntry findByCustomerIdAndDate(Long customerId, LocalDate today);
}