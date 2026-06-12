package com.example.Daily.Management.System.DMS.EmiService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentCustomer;
import com.example.Daily.Management.System.DMS.EMI.Entity.EmiSchedule;
import com.example.Daily.Management.System.DMS.EmiRepositary.EmiScheduleRepo;

@Service
public class ScheduleService {

    @Autowired
    private EmiScheduleRepo repo;

    public void generateSchedule(EmiAgentCustomer c) {

        List<EmiSchedule> list = new ArrayList<>();

        for (int i = 1; i <= c.getMonths(); i++) {

            EmiSchedule e = new EmiSchedule();

            e.setCustomer(c);
            e.setInstallmentNo(i);
            e.setEmiAmount(c.getEmiAmount());

            LocalDate due = LocalDate.now().plusMonths(i);

            int dueDay = c.getDueDate() != null ? c.getDueDate() : due.getDayOfMonth();

            due = due.withDayOfMonth(Math.min(dueDay, due.lengthOfMonth()));

            e.setDueDate(due);
            e.setStatus("PENDING");

            list.add(e);
        }

        repo.saveAll(list);
    }
}