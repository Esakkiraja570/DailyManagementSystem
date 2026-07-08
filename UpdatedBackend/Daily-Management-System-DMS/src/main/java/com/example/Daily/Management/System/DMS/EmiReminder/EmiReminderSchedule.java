package com.example.Daily.Management.System.DMS.EmiReminder;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentCustomer;
import com.example.Daily.Management.System.DMS.EmiRepositary.EmiCustomerRepo;
import com.example.Daily.Management.System.DMS.EmiService.EmiCustomerService;
import com.example.Daily.Management.System.DMS.EmiService.EmiServicesms;

@Component
public class EmiReminderSchedule {

    @Autowired
    private EmiCustomerRepo repo;

    @Autowired
    private EmiCustomerService service;

    @Autowired
    private EmiServicesms smsService;

    // 🔥 Run daily at 9 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendReminders() {

        List<EmiAgentCustomer> customers = repo.findAll();
        LocalDate today = LocalDate.now();

        for (EmiAgentCustomer c : customers) {

            if (!"ACTIVE".equalsIgnoreCase(c.getStatus())) continue;
            if (c.getBalance() != null && c.getBalance() <= 0) continue;
            if (c.getAgent() == null) continue;
            if (c.getEmiAmount() == null) continue;

            LocalDate dueDate = getSafeDueDate(today, c.getDueDate());
            if (dueDate == null) continue;

            long diff = ChronoUnit.DAYS.between(today, dueDate);

            String msg = null;

            // 🔔 2 DAYS BEFORE
            if (diff == 2) {
                msg = buildMessage(c, "Reminder",
                        "Your EMI is due on " + dueDate);
            }

            // 🔥 DUE TODAY
            else if (diff == 0) {
                msg = buildMessage(c, "Due Today",
                        "Please pay your EMI today to avoid late fee");
            }

            // 🚨 OVERDUE
            else if (diff < 0) {

         
                service.applyLateFee(c);

                // ✅ Save only if changed
                Double oldLateFee1 = c.getLateFee();

                service.applyLateFee(c);

                if (oldLateFee1 == null || !oldLateFee1.equals(c.getLateFee())) {
                    repo.save(c);
                }
                double total = c.getEmiAmount() + c.getLateFee();

                msg = "⚠️ EMI Overdue\n"
                        + "Customer: " + c.getName()
                        + "\nDays Late: " + Math.abs(diff)
                        + "\nEMI: ₹" + c.getEmiAmount()
                        + "\nLate Fee: ₹" + c.getLateFee()
                        + "\nTotal: ₹" + total;
            }

            // ✅ SEND SMS
            if (msg != null) {
                smsService.sendReminder(c.getMobile(), msg);
            }
        }
    }

    // ✅ SAFE DATE (no crash on Feb 30 etc.)
    private LocalDate getSafeDueDate(LocalDate today, Integer dueDay) {
        if (dueDay == null) return null;

        int lastDay = today.lengthOfMonth();
        return today.withDayOfMonth(Math.min(dueDay, lastDay));
    }

    // ✅ COMMON MESSAGE FORMAT
    private String buildMessage(EmiAgentCustomer c, String title, String body) {

        return title + ":\n"
                + "Hi " + c.getName() + ",\n"
                + body
                + "\nAmount: ₹" + c.getEmiAmount()
                + "\n- EMI Service";
    }
}