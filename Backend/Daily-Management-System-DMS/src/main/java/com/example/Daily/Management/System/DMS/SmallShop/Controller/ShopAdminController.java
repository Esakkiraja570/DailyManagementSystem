package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Daily.Management.System.DMS.SmallShop.Login.OfferRequest;
import com.example.Daily.Management.System.DMS.SmallShop.Service.NotificationService;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Offer;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;
import com.example.Daily.Management.System.DMS.SmallShopRepo.OfferRepository;
import com.example.Daily.Management.System.DMS.SmallShopRepo.SmallshopProductsRepo;


@RestController
@RequestMapping("/api/v1/admin")
public class ShopAdminController {
	

	@Autowired
	private SmallshopProductsRepo productRepo;
    @Autowired private NotificationService notificationService;
    @Autowired private OfferRepository offerRepo; // Added this

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<?> getLowStockItems() {
        // FIXED: Changed findByQuantityLessThan to findByStockLessThan
    	List<Products> items = productRepo.findByStockLessThan(5);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/active-offers")
    public List<Offer> getOffersForCustomer() {
        // FIXED: Removed static call, using autowired repo
        return offerRepo.findByIsActiveTrue();
    }

    @PostMapping("/send-promotion")
    public ResponseEntity<?> sendPromotion(@RequestBody OfferRequest offer) {
        // FIXED: Removed static call
        List<String> mobileNumbers = offerRepo.findDistinctCustomerMobileByShopId(offer.getShopId());
        notificationService.sendBulkSMS(mobileNumbers, offer.getMessage());
        return ResponseEntity.ok("Promotion sent to " + mobileNumbers.size() + " customers");
    }
}