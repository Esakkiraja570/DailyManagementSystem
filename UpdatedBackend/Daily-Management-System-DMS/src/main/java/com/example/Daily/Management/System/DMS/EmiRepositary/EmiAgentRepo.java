package com.example.Daily.Management.System.DMS.EmiRepositary;




import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentEntity;


@Repository


public interface EmiAgentRepo extends   JpaRepository<EmiAgentEntity, Long> {

	EmiAgentEntity findByMobileAndPassword(String mobile, String password);

	List<EmiAgentEntity> findByMobile(String mobile);
}