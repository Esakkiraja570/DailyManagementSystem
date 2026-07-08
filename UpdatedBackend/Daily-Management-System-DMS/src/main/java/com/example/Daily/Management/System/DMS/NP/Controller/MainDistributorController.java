package com.example.Daily.Management.System.DMS.NP.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.NP.Entity.EntryEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpWorkerEntity;
import com.example.Daily.Management.System.DMS.NP.Service.NpDistributorService;
import com.example.Daily.Management.System.DMS.NP.Service.NpPayment;

@RestController
@RequestMapping("/api/distributor")
@CrossOrigin("*")
public class MainDistributorController {

    @Autowired
    private NpDistributorService service;

    // ADD CUSTOMER
    @PostMapping("/customer/add")
    public NpCustomerEntity addCustomer(
            @RequestBody NpCustomerEntity c
    ) {

        return service.addCustomer(c);
    }

    // GET CUSTOMERS
    @GetMapping("/customers/{mobile}")
    public List<NpCustomerEntity> getCustomers(
            @PathVariable String mobile
    ) {

        return service.getCustomers(mobile);
    }

    // ADD NEWSPAPER
    @PostMapping("/newspaper/add")
    public NewspaperEntity addNewspaper(
            @RequestBody NewspaperEntity n
    ) {

        return service.addNewspaper(n);
    }

    // GET NEWSPAPERS
    @GetMapping("/newspapers/{mobile}")
    public List<NewspaperEntity> getNewspapers(
            @PathVariable String mobile
    ) {

        return service.getNewspapers(mobile);
    }

    // ADD WORKER
    @PostMapping("/worker/add")
    public NpWorkerEntity addWorker(
            @RequestBody NpWorkerEntity w
    ) {

        return service.addWorker(w);
    }

    // GET WORKERS
    @GetMapping("/workers/{mobile}")
    public List<NpWorkerEntity> getWorkers(
            @PathVariable String mobile
    ) {

        return service.getWorkers(mobile);
    }

    // ADD ENTRY
    @PostMapping("/entry/add")
    public EntryEntity addEntry(
            @RequestBody EntryEntity e
    ) {

        return service.addEntry(e);
    }

    // BILLING
    @GetMapping("/billing/{customerId}")
    public Map<String, Object> billing(
            @PathVariable Long customerId
    ) {

        return service.billing(customerId);
    }

    // PAUSE CUSTOMER
    @PutMapping("/customer/pause/{id}")
    public NpCustomerEntity pauseCustomer(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {

        return service.pauseCustomer(
                id,
                body.get("startDate"),
                body.get("endDate")
        );
    }

    // RESUME CUSTOMER
    @PutMapping("/customer/resume/{id}")
    public NpCustomerEntity resumeCustomer(
            @PathVariable Long id
    ) {

        return service.resumeCustomer(id);
    }

    // PAYMENT
    @PostMapping("/payment/pay")
    public NpPayment pay(
            @RequestBody NpPayment p
    ) {

        return service.makePayment(p);
    }

    // PAYMENT HISTORY
    @GetMapping("/payment/history/{customerId}")
    public List<NpPayment> history(
            @PathVariable Long customerId
    ) {

        return service.paymentHistory(customerId);
    }
}