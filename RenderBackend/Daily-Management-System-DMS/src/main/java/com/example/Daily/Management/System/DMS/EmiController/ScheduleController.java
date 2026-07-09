package com.example.Daily.Management.System.DMS.EmiController;

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
@RequestMapping("/schedule")
@CrossOrigin("*")
public class ScheduleController {

    @Autowired
    private EmiScheduleRepo repo;

    @GetMapping("/customer/{id}")
    public List<EmiSchedule> getSchedule(@PathVariable Long id) {
        return repo.findByCustomerId(id);
    }
}