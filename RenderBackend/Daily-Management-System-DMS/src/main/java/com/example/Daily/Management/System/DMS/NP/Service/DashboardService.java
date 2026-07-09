package com.example.Daily.Management.System.DMS.NP.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.NP.Entity.CustomerSubscription;
import com.example.Daily.Management.System.DMS.NP.Entity.EntryEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpPayemntEntity;
import com.example.Daily.Management.System.DMS.NP.Repositary.CustomerRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.EntryRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.NewsPaperRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.NpPaymentRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.SubscriptionRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.WorkerRepo;

@Service
public class DashboardService {

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private WorkerRepo workerRepo;

    @Autowired
    private NewsPaperRepo newspaperRepo;

    @Autowired
    private EntryRepo entryRepo;

    @Autowired
    private NpPaymentRepo paymentRepo;

    public Map<String, Object> dashboard(
            String mobile
    ) {

        Map<String, Object> map =
                new HashMap<>();

        map.put(
                "totalCustomers",
                customerRepo.findByDistributorMobile(mobile).size()
        );

        map.put(
                "totalWorkers",
                workerRepo.findByDistributorMobile(mobile).size()
        );

        map.put(
                "totalNewspapers",
                newspaperRepo.findByDistributorMobile(mobile).size()
        );

        map.put(
                "todayEntries",
                entryRepo
                        .findByDeliveryDateAndDistributorMobile(
                                LocalDate.now().toString(),
                                mobile
                        ).size()
        );

        map.put(
                "payments",
                paymentRepo.findByDistributorMobile(mobile).size()
        );

        return map;
    }
    public Map<String,Object> customerDashboard(
            String mobile
    ) {

        NpCustomerEntity customer =
                customerRepo.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        List<CustomerSubscription> subscriptions =
                SubscriptionRepo.findByCustomerId(customer.getId());

        List<EntryEntity> entries =
                entryRepo.findByCustomerId(customer.getId());

        List<NpPayemntEntity> payments =
                paymentRepo.findByCustomerId(customer.getId());

        Double totalBill =
                entries.stream()
                .mapToDouble(EntryEntity::getAmount)
                .sum();

        Double paid =
                payments.stream()
                .mapToDouble(NpPayemntEntity::getAmount)
                .sum();

        Double pending = totalBill - paid;

        Map<String,Object> map = new HashMap<>();

        map.put("customer", customer);

        map.put("subscriptions", subscriptions);

        map.put("entries", entries);

        map.put("payments", payments);

        map.put("totalBill", totalBill);

        map.put("paidAmount", paid);

        map.put("pendingAmount", pending);

        return map;
    }
}