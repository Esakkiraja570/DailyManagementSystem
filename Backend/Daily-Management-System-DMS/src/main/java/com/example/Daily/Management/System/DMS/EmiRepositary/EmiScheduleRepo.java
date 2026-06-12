package com.example.Daily.Management.System.DMS.EmiRepositary;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiSchedule;

public interface EmiScheduleRepo extends JpaRepository<EmiSchedule, Long> {

    List<EmiSchedule> findByCustomerId(Long customerId);

    EmiSchedule findTopByCustomerIdAndStatusOrderByInstallmentNoAsc(
            Long customerId, String status
    );

    @Query("SELECT e FROM EmiSchedule e WHERE e.customer.agent.id = :agentId AND e.dueDate = :date AND e.status != 'PAID'")
    List<EmiSchedule> findTodayDue(Long agentId, LocalDate date);

    @Query("SELECT e FROM EmiSchedule e WHERE e.customer.agent.id = :agentId AND e.dueDate < :date AND e.status != 'PAID'")
    List<EmiSchedule> findOverdue(Long agentId, LocalDate date);

	List<EmiSchedule> findByCustomerAgentIdAndDueDateAndStatus(Long agentId, LocalDate now, String string);

	List<EmiSchedule> findByCustomerAgentIdAndDueDateBeforeAndStatus(Long agentId, LocalDate now, String string);
}
