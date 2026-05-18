package com.praisomart.backend.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;


import java.time.LocalDateTime;

@Entity

@Table(name = "users", schema = "paisomart_auth")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="name",nullable = false,length=30)
    private String name;

    @Column(name="email", nullable = false,unique = true ,length=30)
    @Email(message="Invalid email format")
    private String email;

    @Column(name="phone_number",unique = true, length = 15)
    @Pattern(regexp="^[6-9][0-9]{9}$", message="Invalid phone number")
    private String phoneNumber;

    @Column(name="password",nullable = false,length=250)
    private String password;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name="role", nullable = false)
    private String role;

    @Column(name="is_verified", nullable = false)
    private Boolean isVerified = true;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.role="USER";
        this.isVerified = true;
    }

    public User(LocalDateTime createdAt, String email, Long id, String name, String password, String phoneNumber, String role) {
        this.createdAt = createdAt;
        this.email = email;
        this.id = id;
        this.name = name;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    public User() {
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getVerified() {
        return isVerified;
    }

    public void setVerified(Boolean verified) {
        isVerified = verified;
    }
}
