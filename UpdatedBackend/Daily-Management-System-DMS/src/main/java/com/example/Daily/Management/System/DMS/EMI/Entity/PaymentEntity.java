package com.example.Daily.Management.System.DMS.EMI.Entity;

import java.time.LocalDate;

import com.example.Daily.Management.System.DMS.EmiEnum.PaymentMode;
import com.example.Daily.Management.System.DMS.EmiEnum.PaymentStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Customer relation
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private EmiAgentCustomer customer;

    private Double amountPaid;
    private LocalDate paidDate;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PAID / PENDING / LATE

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode; // CASH / UPI

    private String transactionId;

    private Double balanceAfterPayment;

    // GETTERS & SETTERS
    public Long getId() { return id; }

    public EmiAgentCustomer getCustomer() { return customer; }
    public void setCustomer(EmiAgentCustomer customer) { this.customer = customer; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public PaymentMode getPaymentMode() { return paymentMode; }
    public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Double getBalanceAfterPayment() { return balanceAfterPayment; }
    public void setBalanceAfterPayment(Double balanceAfterPayment) { this.balanceAfterPayment = balanceAfterPayment; }
}