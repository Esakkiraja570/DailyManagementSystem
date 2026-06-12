package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.SmallShop.Service.ProductsServices;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;



@RestController
@RequestMapping("/api/smallshop")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductsServices service;

    // =========================
    // GET PRODUCTS
    // =========================
    @GetMapping("/{shopId}/products")
    public List<Products> getProducts(
            @PathVariable Long shopId
    ) {

        return service.getProducts(shopId);
    }

    // =========================
    // ADD PRODUCT
    // =========================
    @PostMapping("/{shopId}/products")
    public Products addProduct(
            @PathVariable Long shopId,
            @RequestBody Products product
    ) {

        return service.addProduct(shopId, product);
    }

    // =========================
    // UPDATE PRODUCT
    // =========================
    @PutMapping("/{shopId}/products/{productId}")
    public Products updateProduct(
            @PathVariable Long productId,
            @RequestBody Products req
    ) {

        return service.updateProduct(productId, req);
    }

    // =========================
    // DELETE PRODUCT
    // =========================
    @DeleteMapping("/{shopId}/products/{productId}")
    public String deleteProduct(
            @PathVariable Long productId
    ) {

        service.deleteProduct(productId);

        return "Deleted Successfully";
    }

    // =========================
    // LOW STOCK PRODUCTS
    // =========================
    @GetMapping("/{shopId}/products/low-stock")
    public List<Products> getLowStock(
            @PathVariable Long shopId
    ) {

        return service.getLowStockProducts(shopId);
    }
}