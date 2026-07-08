
package com.example.Daily.Management.System.DMS.NP.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "customers")
public class NpCustomerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getRouteName() {
		return routeName;
	}

	public void setRouteName(String routeName) {
		this.routeName = routeName;
	}

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public Boolean getPaused() {
		return paused;
	}

	public void setPaused(Boolean paused) {
		this.paused = paused;
	}

	public String getPauseStartDate() {
		return pauseStartDate;
	}

	public void setPauseStartDate(String pauseStartDate) {
		this.pauseStartDate = pauseStartDate;
	}

	public String getPauseEndDate() {
		return pauseEndDate;
	}

	public void setPauseEndDate(String pauseEndDate) {
		this.pauseEndDate = pauseEndDate;
	}

	public String getDistributorMobile() {
		return distributorMobile;
	}

	public void setDistributorMobile(String distributorMobile) {
		this.distributorMobile = distributorMobile;
	}

	private String name;

    @Column(unique = true)
    private String mobile;

    private String address;

    private String routeName;

    private Boolean active = true;

    private Boolean paused = false;

    private String pauseStartDate;

    private String pauseEndDate;

    private String distributorMobile;

	public boolean isPaperPaused() {
		// TODO Auto-generated method stub
		return false;
	}

	public long getPaperRate() {
		// TODO Auto-generated method stub
		return 0;
	}

	public long getQuantity() {
		// TODO Auto-generated method stub
		return 0;
	}

	public void setPaperPaused(boolean b) {
		// TODO Auto-generated method stub
		
	}

	public void setPaymentStatus(String string) {
		// TODO Auto-generated method stub
		
	}

	public void setMonthPending(double d) {
		// TODO Auto-generated method stub
		
	}

    // getters setters
}