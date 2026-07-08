package com.example.Daily.Management.System.DMS.service;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.Daily.Management.System.DMS.entity.ProductEntity;
import com.example.Daily.Management.System.DMS.repositary.ProductsRepo;

@Service
public class ProductService {

    @Autowired
    private ProductsRepo repo;

    private static final String UPLOAD_DIR =
            System.getProperty("user.dir") + "/uploads/";

    // ✅ ADD PRODUCT
    public ProductEntity add(String name, Double price, Integer stock,
                             String description, Boolean promoted,
                             String specialMessage, String milkmanMobile,
                             MultipartFile file) {

        ProductEntity p = new ProductEntity();
        p.setName(name);
        p.setPrice(price);
        p.setStock(stock);
        p.setDescription(description);
        p.setPromoted(promoted);
        p.setSpecialMessage(specialMessage);
        p.setMilkmanMobile(milkmanMobile);

        // IMAGE UPLOAD
        if (file != null && !file.isEmpty()) {
            try {
                File folder = new File(UPLOAD_DIR);
                if (!folder.exists()) folder.mkdirs();

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File dest = new File(UPLOAD_DIR + fileName);

                file.transferTo(dest);

                p.setImagePath("/uploads/" + fileName);

            } catch (IOException e) {
                throw new RuntimeException("Image upload failed ❌", e);
            }
        }

        return repo.save(p);
    }

    // ✅ GET ALL (milkman)
    public List<ProductEntity> getAllProducts() {
        return repo.findAll();
    }

    // ✅ CUSTOMER SIDE
    public List<ProductEntity> getPromotedProducts() {
        List<ProductEntity> list = repo.findByPromotedTrue();
        list.removeIf(p -> p.getStock() == null || p.getStock() <= 0);
        return list;
    }

    // ✅ PROMOTE
    public ProductEntity promote(Long id, boolean status) {
        ProductEntity p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found ❌"));

        p.setPromoted(status);
        return repo.save(p);
    }

    // ✅ DELETE
    public boolean delete(Long id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}