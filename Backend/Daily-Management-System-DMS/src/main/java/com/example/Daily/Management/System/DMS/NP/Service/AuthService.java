package com.example.Daily.Management.System.DMS.NP.Service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.NP.Entity.NewspaperDistributer;
import com.example.Daily.Management.System.DMS.NP.Entity.OtpEntity;
import com.example.Daily.Management.System.DMS.NP.Repositary.DistributorRepo;
import com.example.Daily.Management.System.DMS.NP.Repositary.OtpRepo;

@Service
public class AuthService {

    @Autowired
    private DistributorRepo distributorRepo;

    @Autowired
    private OtpRepo otpRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // REGISTER
    public NewspaperDistributer register(
            NewspaperDistributer d
    ) {

        if (distributorRepo
                .findByMobile(d.getMobile())
                .isPresent()) {

            throw new RuntimeException(
                    "MOBILE_EXISTS"
            );
        }

        if (distributorRepo
                .findByEmail(d.getEmail())
                .isPresent()) {

            throw new RuntimeException(
                    "EMAIL_EXISTS"
            );
        }

        d.setPassword(
                passwordEncoder.encode(
                        d.getPassword()
                )
        );

        return distributorRepo.save(d);
    }

    // LOGIN
    public NewspaperDistributer login(
            String username,
            String password
    ) {

        NewspaperDistributer user =
                distributorRepo
                        .findByMobileOrEmail(
                                username,
                                username
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "USER_NOT_FOUND"
                                )
                        );

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "INVALID_PASSWORD"
            );
        }

        return user;
    }

    // SEND OTP
    public String sendOtp(String mobile) {

        String otp =
                String.valueOf(
                        new Random()
                                .nextInt(9000) + 1000
                );

        OtpEntity entity =
                new OtpEntity();

        entity.setMobile(mobile);

        entity.setOtp(otp);

        entity.setExpiryTime(
                System.currentTimeMillis()
                        + 300000
        );

        otpRepo.save(entity);

        return otp;
    }

    // VERIFY OTP
    public boolean verifyOtp(
            String mobile,
            String otp
    ) {

        OtpEntity entity =
                otpRepo
                        .findTopByMobileOrderByIdDesc(
                                mobile
                        );

        if (entity == null) {

            return false;
        }

        if (!entity.getOtp().equals(otp)) {

            return false;
        }

        return entity.getExpiryTime()
                > System.currentTimeMillis();
    }

    // RESET PASSWORD
    public void resetPassword(
            String mobile,
            String newPassword
    ) {

        NewspaperDistributer user =
                distributorRepo
                        .findByMobile(mobile)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "USER_NOT_FOUND"
                                )
                        );

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        distributorRepo.save(user);
    }
}