package com.example.Daily.Management.System.DMS.NP.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.NP.Entity.NpPayemntEntity;

import com.example.Daily.Management.System.DMS.NP.Service.NpPayment;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class NpPaymentController {

    @Autowired
    private NpPayment service;

    // PAY
    @PostMapping("/pay")
    public ResponseEntity<?> pay(
            @RequestBody NpPayemntEntity payment
    ) {

        return ResponseEntity.ok(
                service.pay(payment)
        );
    }

    // HISTORY
    @GetMapping("/history/{customerId}")
    public ResponseEntity<?> history(
            @PathVariable Long customerId
    ) {

        List<NpPayemntEntity> list =
                service.history(customerId);

        return ResponseEntity.ok(list);
    }
}