package com.example.Daily.Management.System.DMS.SmallShop.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;
import com.example.Daily.Management.System.DMS.SmallShop.Dto.CustomerDashboardDTO;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;
import com.example.Daily.Management.System.DMS.SmallShopRepo.CustomersRepo;
import com.example.Daily.Management.System.DMS.SmallShopRepo.BillRepositary;
import com.example.Daily.Management.System.DMS.SmallShopRepo.ShopRepo;

@Service
public class CustomerDashboardService {

    @Autowired
    private CustomersRepo customerRepo;

    @Autowired
    private BillRepositary billRepo;

    @Autowired
    private ShopRepo shopRepo;

    public CustomerDashboardDTO getDashboard(String phone) {

        Customer customer = customerRepo.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Bill> bills =
                billRepo.findByCustomerPhoneOrderByCreatedAtDesc(phone);

        CustomerDashboardDTO dto = new CustomerDashboardDTO();

        dto.setCustomerName(customer.getName());
        dto.setPhone(customer.getPhone());
        dto.setPurchaseLevel(customer.getPurchaseLevel());
        dto.setTotalPurchase(customer.getTotalPurchase());
        dto.setVisitCount(customer.getVisitCount());

        dto.setOrders(bills);

        // 🔥 SHOP NAME FETCH
        if (customer.getShopId() != null) {
            shopRepo.findById(customer.getShopId())
                    .ifPresent(shop -> dto.setShopName(shop.getShopName()));
        }

        return dto;
    }
}
