package com.example.Daily.Management.System.DMS.NP.Service;




import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.NP.Entity.EntryEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpWorkerEntity;
import com.example.Daily.Management.System.DMS.NP.Repositary.CustomerRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.EntryRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.NewsPaperRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.WorkerRepo;

@Service
public class NpDistributorService {

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private NewsPaperRepo newspaperRepo;

    @Autowired
    private WorkerRepo workerRepo;

    @Autowired
    private EntryRepo entryRepo;

    @Autowired
    private NpPayment paymentRepo;

    // ADD CUSTOMER
    public NpCustomerEntity addCustomer(NpCustomerEntity c) {
        return customerRepo.save(c);
    }

    // GET CUSTOMERS
    public List<NpCustomerEntity> getCustomers(String mobile) {
        return customerRepo.findByDistributorMobile(mobile);
    }

    // ADD NEWSPAPER
    public NewspaperEntity addNewspaper(NewspaperEntity n) {
        return newspaperRepo.save(n);
    }

    // GET NEWSPAPERS
    public List<NewspaperEntity> getNewspapers(String mobile) {
        return newspaperRepo.findByDistributorMobile(mobile);
    }

    // ADD WORKER
    public NpWorkerEntity addWorker(NpWorkerEntity w) {
        return workerRepo.save(w);
    }

    // GET WORKERS
    public List<NpWorkerEntity> getWorkers(String mobile) {
        return workerRepo.findByDistributorMobile(mobile);
    }

    // ADD ENTRY
    public EntryEntity addEntry(EntryEntity e) {

        NpCustomerEntity customer = customerRepo.findById(e.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (customer.isPaperPaused()) {
            throw new RuntimeException("PAPER_PAUSED");
        }

        NewspaperEntity paper = newspaperRepo.findById(e.getNewspaperId())
                .orElseThrow(() -> new RuntimeException("Newspaper not found"));

        e.setCustomerName(customer.getName());
        e.setNewspaperName(paper.getName());
        e.setAmount(paper.getPrice() * e.getQuantity());
        e.setDate(LocalDate.now().toString());
        e.setStatus("DELIVERED");

        return entryRepo.save(e);
    }

    // BILLING
    public Map<String, Object> billing(Long customerId) {

        NpCustomerEntity customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        int monthDays = LocalDate.now().lengthOfMonth();

        long breakDays = 0;

        if (customer.isPaperPaused()
                && customer.getPauseStartDate() != null
                && customer.getPauseEndDate() != null) {

            LocalDate start = LocalDate.parse(customer.getPauseStartDate());
            LocalDate end = LocalDate.parse(customer.getPauseEndDate());

            breakDays = ChronoUnit.DAYS.between(start, end) + 1;
        }

        long activeDays = monthDays - breakDays;

        double total = activeDays
                * customer.getPaperRate()
                * customer.getQuantity();

        Map<String, Object> map = new HashMap<>();

        map.put("customerName", customer.getName());
        map.put("monthDays", monthDays);
        map.put("breakDays", breakDays);
        map.put("activeDays", activeDays);
        map.put("monthlyAmount", total);

        return map;
    }

    // PAUSE CUSTOMER
    public NpCustomerEntity pauseCustomer(Long id, String start, String end) {

        NpCustomerEntity customer = customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setPaperPaused(true);
        customer.setPauseStartDate(start);
        customer.setPauseEndDate(end);

        return customerRepo.save(customer);
    }

    // RESUME CUSTOMER
    public NpCustomerEntity resumeCustomer(Long id) {

        NpCustomerEntity customer = customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setPaperPaused(false);
        customer.setPauseStartDate(null);
        customer.setPauseEndDate(null);

        return customerRepo.save(customer);
    }

    // PAYMENT
    public NpPayment makePayment(NpPayment p) {

        p.setPaymentDate(LocalDate.now().toString());
        p.setStatus("PAID");

        return paymentRepo.save(p);
    }

    // PAYMENT HISTORY
    public List<NpPayment> paymentHistory(Long customerId) {
        return paymentRepo.findByCustomerId(customerId);
    }
}