package com.example.Daily.Management.System.DMS.NP.Service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Daily.Management.System.DMS.NP.Entity.NpPayemntEntity;
import com.example.Daily.Management.System.DMS.NP.Repositary.NpPaymentRepo;


@Service
public class NpPayment {

    @Autowired
    private NpPaymentRepo paymentRepo;

    // PAY
    public NpPayemntEntity pay(
            NpPayemntEntity payment
    ) {

        payment.setPaymentDate(
                LocalDate.now().toString()
        );

        payment.setStatus("PAID");

        return paymentRepo.save(payment);
    }

    // HISTORY
    public List<NpPayemntEntity> history(
            Long customerId
    ) {

        return paymentRepo.findByCustomerId(
                customerId
        );
    }

	public void setPaymentDate(String string) {
		// TODO Auto-generated method stub
		
	}

	public void setStatus(String string) {
		// TODO Auto-generated method stub
		
	}

	public NpPayment save(NpPayment p) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<NpPayment> findByCustomerId(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}
}