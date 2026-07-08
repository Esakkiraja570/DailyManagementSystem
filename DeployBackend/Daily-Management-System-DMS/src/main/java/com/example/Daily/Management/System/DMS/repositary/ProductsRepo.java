package com.example.Daily.Management.System.DMS.repositary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Daily.Management.System.DMS.entity.ProductEntity;

public interface ProductsRepo
        extends JpaRepository<ProductEntity, Long> {

    List<ProductEntity> findByPromotedTrue();

    List<ProductEntity> findByStockLessThan(int stock);
}