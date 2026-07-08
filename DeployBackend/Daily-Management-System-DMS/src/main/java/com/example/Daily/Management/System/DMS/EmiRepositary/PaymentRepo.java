package com.example.Daily.Management.System.DMS.EmiRepositary;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.EMI.Entity.PaymentEntity;
import com.example.Daily.Management.System.DMS.EmiEnum.PaymentStatus;


public interface PaymentRepo extends JpaRepository<PaymentEntity, Long> {

    List<PaymentEntity> findByCustomerId(Long customerId);

    List<PaymentEntity> findByDueDate(LocalDate date);

    List<PaymentEntity> findByStatus(PaymentStatus status);

}