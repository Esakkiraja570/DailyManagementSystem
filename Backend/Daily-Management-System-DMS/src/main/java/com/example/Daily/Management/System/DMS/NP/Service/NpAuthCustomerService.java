package com.example.Daily.Management.System.DMS.NP.Service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.NP.Entity.NpCustomerEntity;
import com.example.Daily.Management.System.DMS.NP.Entity.OtpEntity;
import com.example.Daily.Management.System.DMS.NP.Repositary.CustomerRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.OtpRepo;

@Service
public class NpAuthCustomerService {

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private OtpRepo otpRepo;

    // SEND OTP
    public String sendCustomerOtp(String mobile) {

        customerRepo.findByMobile(mobile)
		.orElseThrow(() ->
		        new RuntimeException("CUSTOMER_NOT_FOUND")
		);

        String otp =
                String.valueOf(
                        new Random().nextInt(900000) + 100000
                );

        OtpEntity entity = new OtpEntity();

        entity.setMobile(mobile);
        entity.setOtp(otp);

        entity.setExpiryTime(
                System.currentTimeMillis() + 300000
        );

        otpRepo.save(entity);

        return otp;
    }

    // VERIFY LOGIN
    public NpCustomerEntity verifyCustomerLogin(
            String mobile,
            String otp
    ) {

        OtpEntity entity =
                otpRepo.findTopByMobileOrderByIdDesc(mobile);

        if(entity == null) {
            throw new RuntimeException("OTP_NOT_FOUND");
        }

        if(!entity.getOtp().equals(otp)) {
            throw new RuntimeException("INVALID_OTP");
        }

        if(entity.getExpiryTime() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP_EXPIRED");
        }

        return customerRepo.findByMobile(mobile)
                .orElseThrow(() ->
                        new RuntimeException("CUSTOMER_NOT_FOUND")
                );
    }
}