
package com.example.Daily.Management.System.DMS.NP.Controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.NP.Service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class NpDashboardController {

    @Autowired
    private DashboardService service;


    @GetMapping("/dashboard/{mobile}")
    public ResponseEntity<?> dashboard(
            @PathVariable String mobile
    ) {

        return ResponseEntity.ok(
                service.customerDashboard(mobile)
        );
    }
}
