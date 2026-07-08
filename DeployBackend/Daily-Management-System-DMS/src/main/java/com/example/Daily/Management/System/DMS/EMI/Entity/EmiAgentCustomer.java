package com.example.Daily.Management.System.DMS.EMI.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
public class EmiAgentCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String mobile;

    private Double loanAmount = 0.0;
    private Double emiAmount = 0.0;
    private Integer months = 0;

    private Double totalAmount = 0.0;
    private Double totalPaid = 0.0;
    private Double balance = 0.0;
    private Double interest = 0.0;

    private String status = "ACTIVE";
    private String paymentType = "MONTHLY";

    private Integer dueDate;

    private String productName;
    private Double productPrice = 0.0;
    private Double downPayment = 0.0;

    private String address;

    private Double lateFee = 0.0;

    // 🔗 RELATION WITH AGENT
    @ManyToOne
    @JoinColumn(name = "agent_id")
    @JsonIgnore   // 🔥 prevent infinite loop
    private EmiAgentEntity agent;

    // 🔗 PAYMENT HISTORY
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore   // optional but recommended
    private List<PaymentEntity> payments;

    // ================= GETTERS & SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public Double getLoanAmount() { return loanAmount; }
    public void setLoanAmount(Double loanAmount) { this.loanAmount = loanAmount; }

    public Double getEmiAmount() { return emiAmount; }
    public void setEmiAmount(Double emiAmount) { this.emiAmount = emiAmount; }

    public Integer getMonths() { return months; }
    public void setMonths(Integer months) { this.months = months; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getTotalPaid() { return totalPaid; }
    public void setTotalPaid(Double totalPaid) { this.totalPaid = totalPaid; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public Double getInterest() { return interest; }
    public void setInterest(Double interest) { this.interest = interest; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public Integer getDueDate() { return dueDate; }
    public void setDueDate(Integer dueDate) { this.dueDate = dueDate; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }

    public Double getDownPayment() { return downPayment; }
    public void setDownPayment(Double downPayment) { this.downPayment = downPayment; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLateFee() { return lateFee; }
    public void setLateFee(Double lateFee) { this.lateFee = lateFee; }

    public EmiAgentEntity getAgent() { return agent; }
    public void setAgent(EmiAgentEntity agent) { this.agent = agent; }

    public List<PaymentEntity> getPayments() { return payments; }
    public void setPayments(List<PaymentEntity> payments) { this.payments = payments; }
}