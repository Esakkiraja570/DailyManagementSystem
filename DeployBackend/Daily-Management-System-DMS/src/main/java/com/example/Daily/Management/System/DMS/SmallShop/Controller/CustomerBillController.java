package com.example.Daily.Management.System.DMS.SmallShop.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.Daily.Management.System.DMS.SmallShopEntity.Bill;
import com.example.Daily.Management.System.DMS.SmallShopRepo.BillRepositary;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin("*")
public class CustomerBillController {

    @Autowired
    private BillRepositary billRepo; // This variable is now used below

    @GetMapping("/bills/{phone}")
    public List<Bill> getBills(@PathVariable String phone) {
        // FIXED: Using the autowired variable 'billRepo' instead of the Interface name
        return billRepo.findByCustomerPhone(phone);
    }
}