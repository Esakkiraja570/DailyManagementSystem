package com.example.Daily.Management.System.DMS.repositary;





import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.entity.OrderEntity;

public interface OrderRepo extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByCustomerMobile(String mobile);

}
