package com.example.Daily.Management.System.DMS.EmiService;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.EMI.Entity.*;
import com.example.Daily.Management.System.DMS.EmiEnum.PaymentMode;
import com.example.Daily.Management.System.DMS.EmiEnum.PaymentStatus;
import com.example.Daily.Management.System.DMS.EmiRepositary.*;

@Service
public class EmiPaymentService {

    @Autowired
    private EmiCustomerRepo customerRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    public PaymentEntity payEmi(Long customerId, Double amount, PaymentMode mode) {

        EmiAgentCustomer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found ❌"));

        if (amount == null || amount <= 0) {
            throw new RuntimeException("Invalid payment amount ❌");
        }

        if (customer.getTotalAmount() == null) {
            throw new RuntimeException("Total amount missing ❌");
        }

        if (customer.getTotalPaid() == null) {
            customer.setTotalPaid(0.0);
        }

        // 🔥 LATE FEE
        double lateFee = customer.getLateFee() != null ? customer.getLateFee() : 0.0;

        double totalDueNow = customer.getEmiAmount() + lateFee;

        // ❌ PREVENT OVERPAY
        if (amount > customer.getBalance()) {
            throw new RuntimeException("Amount exceeds balance ❌");
        }

        // 🔥 UPDATE TOTAL PAID
        double newTotalPaid = customer.getTotalPaid() + amount;
        customer.setTotalPaid(newTotalPaid);

        // 🔥 UPDATE BALANCE
        double balance = customer.getTotalAmount() - newTotalPaid;
        customer.setBalance(balance);

        // 🔥 STATUS UPDATE
        if (balance <= 0) {
            customer.setStatus("COMPLETED");
            customer.setBalance(0.0);
        } else {
            customer.setStatus("ACTIVE");
        }

        // 🔥 RESET LATE FEE IF FULL EMI PAID
        if (amount >= totalDueNow) {
            customer.setLateFee(0.0);
        }

        // 🔥 CREATE PAYMENT RECORD
        PaymentEntity payment = new PaymentEntity();
        payment.setCustomer(customer);
        payment.setAmountPaid(amount);
        payment.setPaidDate(LocalDate.now());
        payment.setDueDate(LocalDate.now());
        payment.setPaymentMode(mode);
        payment.setBalanceAfterPayment(balance);

        // 🔥 PAYMENT STATUS LOGIC
        if (amount >= totalDueNow) {
            payment.setStatus(PaymentStatus.PAID);
        } else if (amount > 0) {
            payment.setStatus(PaymentStatus.PENDING); // partial
        } else {
            payment.setStatus(PaymentStatus.LATE);
        }

        customerRepo.save(customer);

        return paymentRepo.save(payment);
    }
}