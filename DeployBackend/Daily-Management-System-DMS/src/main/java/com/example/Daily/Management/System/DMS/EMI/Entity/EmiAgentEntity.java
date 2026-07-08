package com.example.Daily.Management.System.DMS.EMI.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class EmiAgentEntity {

	

	

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

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getArea() {
		return area;
	}

	public void setArea(String area) {
		this.area = area;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public List<EmiAgentCustomer> getCustomers() {
		return customers;
	}

	public void setCustomers(List<EmiAgentCustomer> customers) {
		this.customers = customers;
	}
	public Double getLateFeePerDay() {
		return lateFeePerDay;
	}

	public void setLateFeePerDay(Double lateFeePerDay) {
		this.lateFeePerDay = lateFeePerDay;
	}
	private Double lateFeePerDay;

		@Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
	    private String name;
	    private String mobile;
	    private String password;
	    private String area;
	    private String email;

	    // 🔥 MATCHES "agent" field in CustomerEntity
	    

	    @OneToMany(mappedBy = "agent")
	    @JsonIgnore   // 🔥 IMPORTANT FIX
	    private List<EmiAgentCustomer> customers;
	    // getters & setters
	}
	