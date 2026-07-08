package com.example.Daily.Management.System.DMS.EmiRepositary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentCustomer;

public interface EmiCustomerRepo extends JpaRepository<EmiAgentCustomer, Long> {

    // ✅ login
    Optional<EmiAgentCustomer> findFirstByMobile(String mobile);

    // ✅ agent → customers
    List<EmiAgentCustomer> findByAgentId(Long agentId);
}