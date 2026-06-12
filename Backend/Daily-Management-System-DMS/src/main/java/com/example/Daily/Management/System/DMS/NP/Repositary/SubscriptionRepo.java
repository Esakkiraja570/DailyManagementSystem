package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.CustomerSubscription;

public interface SubscriptionRepo
        extends JpaRepository<CustomerSubscription, Long> {

    static List<CustomerSubscription> findByCustomerId(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}
}
