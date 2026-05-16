package com.praisomart.backend.auth.dto;

public class RegisterResponseDTO {
    private String message;
    private String jwtToken;
    private String name;
    private String role;

    public RegisterResponseDTO(String jwtToken, String message, String name, String role) {
        this.jwtToken = jwtToken;
        this.message = message;
        this.name = name;
        this.role = role;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
