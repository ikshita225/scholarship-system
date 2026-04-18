package com.scholarship.controller;

import com.scholarship.model.User;
import com.scholarship.repository.UserRepository;
import com.scholarship.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    // Simulation: Mock OTP storage
    private static Map<String, String> otpStorage = new HashMap<>();

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.get("email"), loginRequest.get("password")));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(loginRequest.get("email"));

        User user = userRepository.findByEmail(loginRequest.get("email")).get();

        if (user.getRole() == User.Role.VERIFIER && !user.isApproved()) {
            return ResponseEntity.status(403).body(Map.of("message", "Your account is pending approval by Admin."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("userId", user.getUserId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole());
        response.put("approved", user.isApproved());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(email, otp);
        System.out.println("SIMULATED OTP for " + email + ": " + otp);
        return ResponseEntity.ok(Map.of(
            "message", "OTP generated (Simulated)",
            "otp", otp
        ));
    }

    @PostMapping({"/signup", "/register"})
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> signUpRequest) {
        String email = signUpRequest.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        email = email.trim().toLowerCase();
        
        String otp = signUpRequest.get("otp");

        // Validate OTP if it was provided (Handles both new frontend and cached frontend)
        if (otp != null && !otp.trim().isEmpty()) {
            if (!otpStorage.containsKey(email) || !otpStorage.get(email).trim().equals(otp.trim())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
            }
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }

        User user = User.builder()
                .name(signUpRequest.get("name"))
                .email(email)
                .password(encoder.encode(signUpRequest.get("password")))
                .role(User.Role.valueOf(signUpRequest.getOrDefault("role", "STUDENT")))
                .isVerified(true)
                .approved(signUpRequest.getOrDefault("role", "STUDENT").equals("STUDENT")) 
                .build();

        userRepository.save(user);
        otpStorage.remove(email);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    // RESET PASSWORD WORKFLOW
    @GetMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestParam String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.ok("User found");
        }
        return ResponseEntity.status(404).body("No account associated with this email.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok("Password updated successfully.");
        }
        return ResponseEntity.status(404).body("User not found.");
    }
}
