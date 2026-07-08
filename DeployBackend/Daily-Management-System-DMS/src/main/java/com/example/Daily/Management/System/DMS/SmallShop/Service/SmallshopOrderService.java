package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;
import com.example.Daily.Management.System.DMS.SmallShopRepo.SmallshopProductsRepo;


import jakarta.transaction.Transactional;

@Service
public class SmallshopOrderService {

    @Autowired
    private SmallshopProductsRepo productRepo;

    @Transactional
    public void processOrder(Long productId, int quantitySold) {
        Products product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product Not Found"));

        if (product.getStock() < quantitySold) {
            throw new RuntimeException("Low stock for " + product.getProductName());
        }

        
        // ✅ Real-world logic: Decrease stock
        product.setStock(product.getStock() - quantitySold);
        productRepo.save(product);
    }
    public List<Products> getLowStockAlerts() {
        // ✅ Change this call as well
        return productRepo.findByStockLessThan(5); 
    }
}
