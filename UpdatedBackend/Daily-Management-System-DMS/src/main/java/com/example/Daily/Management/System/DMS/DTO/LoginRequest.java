package com.example.Daily.Management.System.DMS.DTO;



public class LoginRequest {

    private String mobile;
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
	private String password;

    // getters & setters
}
