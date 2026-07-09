package com.example.Daily.Management.System.DMS.NP.Service;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.NP.Entity.CustomerSubscription;
import com.example.Daily.Management.System.DMS.NP.Entity.EntryEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;
import com.example.Daily.Management.System.DMS.NP.Repositary.CustomerRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.EntryRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.NewsPaperRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.SubscriptionRepo;

@Service
public class NpCustomerService  {

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private SubscriptionRepo subscriptionRepo;

    @Autowired
    private NewsPaperRepo newspaperRepo;

    @Autowired
    private EntryRepo entryRepo;

    // CREATE CUSTOMER
    public NpCustomerEntity createCustomer(
            NpCustomerEntity customer
    ) {

        if (customerRepo
                .findByMobile(customer.getMobile())
                .isPresent()) {

            throw new RuntimeException(
                    "Customer mobile already exists"
            );
        }

        customer.setActive(true);

        customer.setPaused(false);

        customer.setPaymentStatus("PENDING");

        customer.setMonthPending(0.0);

        return customerRepo.save(customer);
    }

    // ADD SUBSCRIPTION
    public CustomerSubscription addSubscription(
            CustomerSubscription sub
    ) {

        return subscriptionRepo.save(sub);
    }

    // AUTO GENERATE DAILY ENTRY
    public void generateTodayEntries(
            String distributorMobile
    ) {

        List<NpCustomerEntity> customers =
                customerRepo.findByDistributorMobile(
                        distributorMobile
                );

        for (NpCustomerEntity customer : customers) {

            if (!customer.getActive()) {
                continue;
            }

            if (customer.getPaused()) {
                continue;
            }

            List<CustomerSubscription> subscriptions =
                    SubscriptionRepo.findByCustomerId(
                            customer.getId()
                    );

            for (CustomerSubscription sub : subscriptions) {

                NewspaperEntity paper =
                        newspaperRepo.findById(
                                sub.getNewspaperId()
                        ).orElseThrow(() ->
                                new RuntimeException(
                                        "Paper not found"
                                )
                        );

                EntryEntity entry =
                        new EntryEntity();

                entry.setDeliveryDate(
                        LocalDate.now().toString()
                );

                entry.setCustomerId(customer.getId());

                entry.setNewspaperId(paper.getId());

                entry.setCustomerName(customer.getName());

                entry.setNewspaperName(paper.getName());

                entry.setQuantity(sub.getQuantity());

                entry.setAmount(
                        paper.getPrice()
                                * sub.getQuantity()
                );

                entry.setDelivered(false);

                entry.setDistributorMobile(
                        distributorMobile
                );

                entryRepo.save(entry);
            }
        }
    }

    // MARK DELIVERED
    public EntryEntity markDelivered(
            Long entryId
    ) {

        EntryEntity entry =
                entryRepo.findById(entryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Entry not found"
                                )
                        );

        entry.setDelivered(true);

        entry.setDeliveredTime(
                LocalTime.now().toString()
        );

        return entryRepo.save(entry);
    }

    // MONTH BILL
    public Double calculateBill(
            Long customerId
    ) {

        List<EntryEntity> entries =
                entryRepo.findByCustomerId(customerId);

        return entries.stream()
                .mapToDouble(EntryEntity::getAmount)
                .sum();
    }

	public @Nullable Object sendCustomerOtp(String string) {
		// TODO Auto-generated method stub
		return null;
	}

	public @Nullable Object verifyCustomerLogin(String string, String string2) {
		// TODO Auto-generated method stub
		return null;
	}

	public @Nullable Object pauseCustomer(Long customerId, String string, String string2) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<EntryEntity> getEntries(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}

	public @Nullable Object resumeCustomer(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}

	public @Nullable Object getCustomer(Long id) {
		// TODO Auto-generated method stub
		return null;
	}

	public @Nullable Object getSubscriptions(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}

	public @Nullable Object updateCustomer(Long id, NpCustomerEntity customer) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<NpCustomerEntity> getAllCustomers(String mobile) {
		// TODO Auto-generated method stub
		return null;
	}

	public void deleteCustomer(Long id) {
		// TODO Auto-generated method stub
		
	}
}