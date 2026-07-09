package com.example.Daily.Management.System.DMS.EmiController;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiSchedule;
import com.example.Daily.Management.System.DMS.EmiRepositary.EmiScheduleRepo;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin("*")
public class DashboardController {

	  @Autowired
	    private EmiScheduleRepo repo;

	    @GetMapping("/today/{agentId}")
	    public List<EmiSchedule> today(@PathVariable Long agentId) {
	        // Query logic: Get PENDING schedules where agentId matches and date is today
	        return repo.findByCustomerAgentIdAndDueDateAndStatus(agentId, LocalDate.now(), "PENDING");
	    }

	    @GetMapping("/overdue/{agentId}")
	    public List<EmiSchedule> overdue(@PathVariable Long agentId) {
	        // Query logic: Get PENDING schedules where agentId matches and date < today
	        return repo.findByCustomerAgentIdAndDueDateBeforeAndStatus(agentId, LocalDate.now(), "PENDING");
	    }
}
