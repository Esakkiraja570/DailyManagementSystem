package com.example.Daily.Management.System.DMS.entity;






import jakarta.persistence.*;




import java.time.LocalDate;

@Entity
public class MilkEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	private Double price;
    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public double getMorning() {
		return morning;
	}

	public void setMorning(double morning) {
		this.morning = morning;
	}

	public double getEvening() {
		return evening;
	}

	public void setEvening(double evening) {
		this.evening = evening;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public MilkmanCustomers getCustomer() {
		return customer;
	}

	public void setCustomer(MilkmanCustomers customer) {
		this.customer = customer;
	}

	private LocalDate date;

    private double morning;
    private double evening;
    private double total;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private MilkmanCustomers customer;

    public MilkEntry() {} // ✅ IMPORTANT

    public MilkEntry(LocalDate date, double morning, double evening, MilkmanCustomers customer) {
        this.date = date;
        this.morning = morning;
        this.evening = evening;
        this.total = morning + evening;
        this.customer = customer;
    }

	public static MilkEntry save(MilkEntry entry) {
		// TODO Auto-generated method stub
		return null;
	}

    // getters & setters
}