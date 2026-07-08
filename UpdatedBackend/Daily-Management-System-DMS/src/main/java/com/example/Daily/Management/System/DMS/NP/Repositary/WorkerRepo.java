package com.example.Daily.Management.System.DMS.NP.Repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.NP.Entity.NpWorkerEntity;

public interface WorkerRepo
        extends JpaRepository<NpWorkerEntity, Long> {

    List<NpWorkerEntity> findByDistributorMobile(String mobile);

    // FIXED
    List<NpWorkerEntity> findByAssignedRoute(String assignedRoute);
}