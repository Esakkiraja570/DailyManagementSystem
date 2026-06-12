package com.example.Daily.Management.System.DMS.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @Min(0)
    private Double price;

    @Min(0)
    private Integer stock;

    private String imagePath;

    private boolean promoted = false;

    // ✅ NEW FIELD (important)
    private String specialMessage;

    // ✅ NEW FIELD (important for multi-user system)
    private String milkmanMobile;

    // 🔥 Computed field (not stored in DB)
    @Transient
    public boolean isAvailable() {
        return stock != null && stock > 0 && promoted;
    }

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public boolean isPromoted() { return promoted; }
    public void setPromoted(boolean promoted) { this.promoted = promoted; }

    public String getSpecialMessage() { return specialMessage; }
    public void setSpecialMessage(String specialMessage) { this.specialMessage = specialMessage; }

    public String getMilkmanMobile() { return milkmanMobile; }
    public void setMilkmanMobile(String milkmanMobile) { this.milkmanMobile = milkmanMobile; }

	public String getProductName() {
		// TODO Auto-generated method stub
		return null;
	}
}