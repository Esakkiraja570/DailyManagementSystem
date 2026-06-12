package com.example.Daily.Management.System.DMS.SmallShopRepo;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;







@Repository
public interface SmallshopProductsRepo extends JpaRepository<Products, Long> {
 List<Products> findByShopId(Long shopId);

 List<Products> findByShopIdAndStockLessThan(Long shopId, int threshold);
//This is correct because 'stock' exists in ProductsEntity
List<Products> findByStockLessThan(int stock); // For admin alerts
 List<Products> findByShopIdAndProductNameContainingIgnoreCase(Long shopId, String query);
}
