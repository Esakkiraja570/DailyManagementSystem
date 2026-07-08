package com.example.Daily.Management.System.DMS.EmiService;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentCustomer;

@Service
public class EmiCustomerService {

    // =========================================
    // ✅ NEXT DUE DATE (SMART)
    // =========================================
    public LocalDate getNextDueDate(EmiAgentCustomer c) {

        LocalDate today = LocalDate.now();

        String type = c.getPaymentType() != null ? c.getPaymentType() : "MONTHLY";

        if ("WEEKLY".equalsIgnoreCase(type)) {
            return today.plusWeeks(1);
        }

        int day = c.getDueDate() != null ? c.getDueDate() : today.getDayOfMonth();

        LocalDate next = today.plusMonths(1);

        return next.withDayOfMonth(Math.min(day, next.lengthOfMonth()));
    }

    // =========================================
    // ✅ LATE FEE CALCULATION (IMPROVED)
    // =========================================
    public void applyLateFee(EmiAgentCustomer c) {

        if (c.getDueDate() == null || c.getAgent() == null) return;

        LocalDate today = LocalDate.now();

        LocalDate dueDate = today.withDayOfMonth(
                Math.min(c.getDueDate(), today.lengthOfMonth())
        );

        long lateDays = ChronoUnit.DAYS.between(dueDate, today);

        if (lateDays > 0) {

            double feePerDay = c.getAgent().getLateFeePerDay() != null
                    ? c.getAgent().getLateFeePerDay()
                    : 0.0;

            double lateFee = lateDays * feePerDay;

            c.setLateFee(lateFee);

            // 🔥 AUTO STATUS UPDATE
            if (lateDays > 10) {
                c.setStatus("RISK");     // serious delay
            } else if (lateDays > 3) {
                c.setStatus("WARNING");  // moderate delay
            } else {
                c.setStatus("ACTIVE");
            }

        } else {
            c.setLateFee(0.0);

            if (!"COMPLETED".equalsIgnoreCase(c.getStatus())) {
                c.setStatus("ACTIVE");
            }
        }
    }

    // =========================================
    // ✅ APPLY LOGIC TO ALL CUSTOMERS
    // =========================================
    public List<EmiAgentCustomer> processCustomers(List<EmiAgentCustomer> customers) {

        for (EmiAgentCustomer c : customers) {
            applyLateFee(c);
        }

        return customers;
    }

    // =========================================
    // ✅ COUNT PENDING EMI
    // =========================================
    public int countPendingEmis(EmiAgentCustomer c) {

        if (c.getMonths() == null) return 0;

        if (c.getTotalPaid() == null || c.getEmiAmount() == null || c.getEmiAmount() == 0) {
            return c.getMonths();
        }

        int paidEmis = (int) (c.getTotalPaid() / c.getEmiAmount());

        return Math.max(0, c.getMonths() - paidEmis);
    }

    // =========================================
    // ✅ CUSTOMER HEALTH (ADVANCED FEATURE)
    // =========================================
    public String getCustomerHealth(EmiAgentCustomer c) {

        double balance = c.getBalance() != null ? c.getBalance() : 0.0;
        double total = c.getTotalAmount() != null ? c.getTotalAmount() : 1.0;

        double ratio = balance / total;

        if (ratio > 0.7) return "HIGH_RISK";
        if (ratio > 0.3) return "MEDIUM_RISK";

        return "LOW_RISK";
    }
}