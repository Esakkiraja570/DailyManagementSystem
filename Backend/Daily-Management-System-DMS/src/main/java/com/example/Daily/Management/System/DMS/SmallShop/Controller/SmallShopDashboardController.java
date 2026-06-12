

package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Customer;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Products;
import com.example.Daily.Management.System.DMS.SmallShopRepo.BillRepositary;
import com.example.Daily.Management.System.DMS.SmallShopRepo.CustomersRepo;
import com.example.Daily.Management.System.DMS.SmallShopRepo.SmallshopProductsRepo;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class SmallShopDashboardController {

    @Autowired
    private BillRepositary billRepo;

    @Autowired
    private CustomersRepo customerRepo;

    @Autowired
    private SmallshopProductsRepo productRepo;

    @GetMapping("/{shopId}")
    public Map<String, Object> getDashboard(
            @PathVariable Long shopId
    ) {

        List<Bill> bills =
                billRepo.findByShopId(shopId);

        List<Customer> customers =
                customerRepo.findByShopId(shopId);

        List<Products> products =
                productRepo.findByShopId(shopId);

        double revenue =
                bills.stream()
                        .mapToDouble(Bill::getTotal)
                        .sum();

        Map<String, Object> map =
                new HashMap<>();

        map.put("totalBills", bills.size());
        map.put("totalCustomers", customers.size());
        map.put("totalProducts", products.size());
        map.put("totalRevenue", revenue);

        return map;
    }
}