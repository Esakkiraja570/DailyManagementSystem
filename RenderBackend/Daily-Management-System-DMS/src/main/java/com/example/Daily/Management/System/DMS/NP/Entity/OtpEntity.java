package com.example.Daily.Management.System.DMS.NP.Entity;

import jakarta.persistence.*;
@Entity
@Table(name = "otp_table")
public class OtpEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getMobile() {
		return mobile;
	}


	public void setMobile(String mobile) {
		this.mobile = mobile;
	}


	public String getOtp() {
		return otp;
	}


	public void setOtp(String otp) {
		this.otp = otp;
	}


	public Long getExpiryTime() {
		return expiryTime;
	}


	public void setExpiryTime(Long expiryTime) {
		this.expiryTime = expiryTime;
	}


	private String mobile;

    private String otp;
  

    private Long expiryTime;

    // Getters and Setters
}
