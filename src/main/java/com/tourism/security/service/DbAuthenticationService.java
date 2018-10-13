package com.tourism.security.service;

import com.tourism.dto.User;
import com.tourism.service.AuthenticationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

public class DbAuthenticationService implements AuthenticationService {

    @Override
    public User getCurrentUser() {
        SecurityContext context = SecurityContextHolder.getContext();
        if (context == null) {
            return null;
        }
        Authentication authentication = context.getAuthentication();
        if (authentication == null) {
            return null;
        }
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            return null;
        }
        return user;
    }

}