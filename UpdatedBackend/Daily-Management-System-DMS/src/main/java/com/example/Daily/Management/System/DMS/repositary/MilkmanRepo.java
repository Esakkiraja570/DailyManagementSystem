package com.example.Daily.Management.System.DMS.repositary;




import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Daily.Management.System.DMS.entity.MilkmanEntity;
@Repository
public interface MilkmanRepo extends JpaRepository<MilkmanEntity, Long> {

    boolean existsByMobile(String mobile);

    Optional<MilkmanEntity> findByMobile(String mobile);

	
}