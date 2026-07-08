package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Offer;
import com.example.Daily.Management.System.DMS.SmallShopRepo.CustomersRepo;
import com.example.Daily.Management.System.DMS.SmallShopRepo.OfferRepository;


@RestController
@RequestMapping("/api/smallshop")
@CrossOrigin(origins = "*")
public class CustomerOfferController {

    @Autowired
    private CustomersRepo customerRepo;

    @Autowired
    private OfferRepository offerRepo;

    // ✅ GET CUSTOMERS
    @GetMapping("/{shopId}/customers")
    public List<Customer> getCustomers(@PathVariable Long shopId) {
        return customerRepo.findByShopId(shopId);
    }

    // ✅ GET OFFERS
    @GetMapping("/{shopId}/offers")
    public List<Offer> getOffers(@PathVariable Long shopId) {
        return offerRepo.findByShopId(shopId);
    }

    // ✅ CREATE OFFER
    @PostMapping("/{shopId}/offers")
    public Offer createOffer(@PathVariable Long shopId, @RequestBody Offer offer) {
        offer.setShopId(shopId);
        return offerRepo.save(offer);
    }

    // ✅ DELETE OFFER
    @DeleteMapping("/{shopId}/offers/{offerId}")
    public void deleteOffer(@PathVariable Long offerId) {
        offerRepo.deleteById(offerId);
    }

    // ✅ BROADCAST OFFER
    @PostMapping("/{shopId}/broadcast-offer")
    public String broadcastOffer(@RequestBody Map<String, Object> data) {
        return "Offer sent successfully!";
    }
}