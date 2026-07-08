package com.example.Daily.Management.System.DMS.repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Daily.Management.System.DMS.entity.MilkmanCustomers;
@Repository
public interface MilkmanCustomerRepo extends JpaRepository<MilkmanCustomers, Long> {

	List<MilkmanCustomers> findByMilkmanId(Long id);

    // 🔥 GET ONLY THIS MILKMAN'S CUSTOMERSpublic interface MilkmanCustomerRepo extends JpaRepository<MilkmanCustomers, Long> {

	MilkmanCustomers findFirstByMilkmanId(Long milkmanId);

	List<MilkmanCustomers> findAllByMobile(String mobile);

	MilkmanCustomers findByMobile(String customerMobile);
	
	
	 
}