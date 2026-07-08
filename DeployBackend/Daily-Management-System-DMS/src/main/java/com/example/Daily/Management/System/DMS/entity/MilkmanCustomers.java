package com.example.Daily.Management.System.DMS.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.ManyToOne;

@Entity
public class MilkmanCustomers {

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

	public MilkmanEntity getMilkman() {
		return milkman;
	}

	public void setMilkman(MilkmanEntity milkman) {
		this.milkman = milkman;
	}

	private String name;
    private String mobile;
    private String address;

    public double getDefaultMorning() {
		return defaultMorning;
	}

	public void setDefaultMorning(double defaultMorning) {
		this.defaultMorning = defaultMorning;
	}

	public double getDefaultEvening() {
		return defaultEvening;
	}

	public void setDefaultEvening(double defaultEvening) {
		this.defaultEvening = defaultEvening;
	}

	private double defaultMorning;
    private double defaultEvening;
    @ManyToOne
    private MilkmanEntity milkman;

    // ✅ REQUIRED: Default constructor
   
    public MilkmanCustomers() {}

    // ✅ Optional: Parameterized constructor
    public MilkmanCustomers(String name, String mobile, String address) {
        this.name = name;
        this.mobile = mobile;
        this.address = address;
    }

	public double getPrice() {
		// TODO Auto-generated method stub
		return 0;
	}

	public Object findById(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}

    // getters & setters
}