package com.edutech;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
class Security {
 @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
  return http.authorizeHttpRequests(a -> a.requestMatchers("/health/live", "/health/ready").permitAll().anyRequest().denyAll())
   .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex) -> {
    res.setStatus(401); res.setContentType("application/problem+json");
    res.getWriter().write("{\"type\":\"about:blank\",\"title\":\"Unauthorized\",\"status\":401}");
   })).build();
 }
}
