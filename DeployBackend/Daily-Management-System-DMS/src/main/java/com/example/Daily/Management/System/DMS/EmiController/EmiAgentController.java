package com.example.Daily.Management.System.DMS.EmiController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.Daily.Management.System.DMS.EMI.Entity.EmiAgentEntity;
import com.example.Daily.Management.System.DMS.EmiRepositary.EmiAgentRepo;
import com.example.Daily.Management.System.DMS.EmiService.OtpService;

@RestController
@RequestMapping("/agent")
@CrossOrigin("*")
public class EmiAgentController {

    @Autowired
    private EmiAgentRepo repo;

    @Autowired
    private OtpService otpService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody EmiAgentEntity agent) {

        if (agent.getMobile() == null || agent.getMobile().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mobile required"));
        }

        if (agent.getPassword() == null || agent.getPassword().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password required"));
        }

        // Check duplicate mobile
        if (!repo.findByMobile(agent.getMobile()).isEmpty()) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "Mobile already registered"));
        }

        // Encrypt password
        agent.setPassword(encoder.encode(agent.getPassword()));

        // ✅ SAVE USER (IMPORTANT FIX)
        EmiAgentEntity saved = repo.save(agent);

        // Hide password in response
        saved.setPassword(null);

        return ResponseEntity.ok(saved);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody EmiAgentEntity agent) {

        List<EmiAgentEntity> list = repo.findByMobile(agent.getMobile());

        if (list.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "User not found"));
        }

        EmiAgentEntity existing = list.get(0);

        // Check password
        if (!encoder.matches(agent.getPassword(), existing.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid password"));
        }

        existing.setPassword(null);

        return ResponseEntity.ok(existing);
    }

    // ================= GET AGENT =================
    @GetMapping("/{id}")
    public ResponseEntity<?> getAgent(@PathVariable Long id) {

        Optional<EmiAgentEntity> agent = repo.findById(id);

        if (agent.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Agent not found"));
        }

        agent.get().setPassword(null);

        return ResponseEntity.ok(agent.get());
    }

    // ================= UPDATE PROFILE =================
 

    @PostMapping("/update/{id}")
    public ResponseEntity<?> updateAgent(@PathVariable Long id, @RequestBody EmiAgentEntity updated) {
        EmiAgentEntity agent = repo.findById(id).orElseThrow();
        agent.setName(updated.getName());
        agent.setEmail(updated.getEmail());
        agent.setArea(updated.getArea());
        return ResponseEntity.ok(repo.save(agent));
    }

    @PostMapping("/late-fee/{id}")
    public ResponseEntity<?> setLateFee(@PathVariable Long id, @RequestParam Double fee) {
        EmiAgentEntity agent = repo.findById(id).orElseThrow();
        agent.setLateFeePerDay(fee);
        return ResponseEntity.ok(repo.save(agent));
    }

    // ================= SEND OTP =================
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> req) {

        String mobile = req.get("mobile");

        if (mobile == null || mobile.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mobile required"));
        }

        if (repo.findByMobile(mobile).isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "User not found"));
        }

        otpService.generateOtp(mobile);

        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    // ================= VERIFY OTP =================
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> req) {

        String mobile = req.get("mobile");
        String otp = req.get("otp");

        if (mobile == null || otp == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mobile & OTP required"));
        }

        boolean valid = otpService.verifyOtp(mobile, otp);

        if (!valid) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid OTP"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {

        String mobile = req.get("mobile");
        String newPassword = req.get("newPassword");

        if (mobile == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mobile & new password required"));
        }

        List<EmiAgentEntity> list = repo.findByMobile(mobile);

        if (list.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "User not found"));
        }

        EmiAgentEntity agent = list.get(0);

        agent.setPassword(encoder.encode(newPassword));

        repo.save(agent);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}