package com.example.Daily.Management.System.DMS.EMI.Entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class EmiSchedule {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public EmiAgentCustomer getCustomer() {
		return customer;
	}

	public void setCustomer(EmiAgentCustomer customer) {
		this.customer = customer;
	}

	public Integer getInstallmentNo() {
		return installmentNo;
	}

	public void setInstallmentNo(Integer installmentNo) {
		this.installmentNo = installmentNo;
	}

	public Double getEmiAmount() {
		return emiAmount;
	}

	public void setEmiAmount(Double emiAmount) {
		this.emiAmount = emiAmount;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public Double getPaidAmount() {
		return paidAmount;
	}

	public void setPaidAmount(Double paidAmount) {
		this.paidAmount = paidAmount;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Double getLateFee() {
		return lateFee;
	}

	public void setLateFee(Double lateFee) {
		this.lateFee = lateFee;
	}

	public LocalDate getPaidDate() {
		return paidDate;
	}

	public void setPaidDate(LocalDate paidDate) {
		this.paidDate = paidDate;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private EmiAgentCustomer customer;

    private Integer installmentNo;

    private Double emiAmount;

    private LocalDate dueDate;

    private Double paidAmount = 0.0;

    private String status; // PENDING, PAID, PARTIAL, LATE

    private Double lateFee = 0.0;

    private LocalDate paidDate;
}