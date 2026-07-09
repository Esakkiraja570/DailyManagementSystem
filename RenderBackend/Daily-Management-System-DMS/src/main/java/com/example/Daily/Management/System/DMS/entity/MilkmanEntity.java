package com.example.Daily.Management.System.DMS.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
public class MilkmanEntity {

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

	public String getArea() {
		return area;
	}

	public void setArea(String area) {
		this.area = area;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	private String name;
    private String mobile;
    private String email;
    private String area;
    private String password;
    @Column(nullable = false)
    private Double price = 0.0;

    public Double getPrice() {
        return price != null ? price : 0.0;
    }

    // ✅ SAFE SETTER
    public void setPrice(Double price) {
        this.price = (price != null) ? price : 0.0;
    }

    // ✅ REQUIRED (EMPTY CONSTRUCTOR)
    public MilkmanEntity() {
    }

    // ✅ PARAMETER CONSTRUCTOR (optional)
    public MilkmanEntity(String name, String mobile, String email, String area, String password) {
        this.name = name;
        this.mobile = mobile;
        this.email = email;
        this.area = area;
        this.password = password;
    }

   

	// ✅ GETTERS & SETTERS
  
    @ManyToOne
    @JoinColumn(name = "milkman_id")
    private MilkmanEntity milkman;

	
}