
package com.example.Daily.Management.System.DMS.NP.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "workers")
public class NpWorkerEntity {

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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getAssignedRoute() {
		return assignedRoute;
	}

	public void setAssignedRoute(String assignedRoute) {
		this.assignedRoute = assignedRoute;
	}

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public String getDistributorMobile() {
		return distributorMobile;
	}

	public void setDistributorMobile(String distributorMobile) {
		this.distributorMobile = distributorMobile;
	}

	private String name;

    private String mobile;

    private String email;

    private String assignedRoute;

    private Boolean active = true;

    private String distributorMobile;

    // Getters and Setters
}
