


package com.example.Daily.Management.System.DMS.EmiService;





import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmiServicesms {

    @Value("${msg91.authkey}")
    private String authKey;

    @Value("${msg91.sender}")
    private String sender;

    @Value("${msg91.route}")
    private String route;

    public void sendReminder(String mobile, String message) {

        String url = "https://api.msg91.com/api/sendhttp.php";

        url += "?authkey=" + authKey;
        url += "&mobiles=" + mobile;
        url += "&message=" + message.replace(" ", "%20");
        url += "&sender=" + sender;
        url += "&route=" + route;

        new RestTemplate().getForObject(url, String.class);
    }
}