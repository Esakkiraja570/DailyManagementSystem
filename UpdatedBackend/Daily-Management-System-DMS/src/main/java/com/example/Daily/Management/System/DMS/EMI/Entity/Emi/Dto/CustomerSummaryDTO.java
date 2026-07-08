package com.example.Daily.Management.System.DMS.EMI.Entity.Emi.Dto;

public class CustomerSummaryDTO {

    private Double totalPaid;
    public Double getTotalPaid() {
		return totalPaid;
	}
	public void setTotalPaid(Double totalPaid) {
		this.totalPaid = totalPaid;
	}
	public Double getBalance() {
		return balance;
	}
	public void setBalance(Double balance) {
		this.balance = balance;
	}
	public Integer getPendingEmis() {
		return pendingEmis;
	}
	public void setPendingEmis(Integer pendingEmis) {
		this.pendingEmis = pendingEmis;
	}
	public String getRiskLevel() {
		return riskLevel;
	}
	public void setRiskLevel(String riskLevel) {
		this.riskLevel = riskLevel;
	}
	private Double balance;
    private Integer pendingEmis;
    private String riskLevel;
}