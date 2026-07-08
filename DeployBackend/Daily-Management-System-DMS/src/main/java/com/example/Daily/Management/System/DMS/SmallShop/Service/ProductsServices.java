package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;
import com.example.Daily.Management.System.DMS.SmallShopRepo.SmallshopProductsRepo;

@Service
public class ProductsServices {

    @Autowired
    private SmallshopProductsRepo repo;

    public List<Products> getProducts(Long shopId) {
        return repo.findByShopId(shopId);
    }

    public Products addProduct(Long shopId, Products product) {
        product.setShopId(shopId);
        return repo.save(product);
    }

    public List<Products> searchProducts(Long shopId, String query) {
        return repo.findByShopIdAndProductNameContainingIgnoreCase(shopId, query);
    }

    public Products updateProduct(Long productId, Products req) {
        Products existingProduct = repo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        existingProduct.setProductName(req.getProductName());
        existingProduct.setPrice(req.getPrice());
        existingProduct.setStock(req.getStock());
        existingProduct.setCategory(req.getCategory());
        existingProduct.setImageUrl(req.getImageUrl());

        return repo.save(existingProduct);
    }

    @Transactional
    public void reduceStock(Long productId, int quantitySold) {
        Products product = repo.findById(productId).orElseThrow();
        if (product.getStock() < quantitySold) {
            throw new RuntimeException("Not enough stock for: " + product.getProductName());
        }
        product.setStock(product.getStock() - quantitySold);
        repo.save(product);
    }

    public List<Products> getLowStockProducts(Long shopId) {
        return repo.findByShopIdAndStockLessThan(shopId, 5);
    }

    public void deleteProduct(Long productId) {
        repo.deleteById(productId);
    }

	public int getStock() {
		// TODO Auto-generated method stub
		return 0;
	}
}