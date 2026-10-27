package com.edutech;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
class Health {
 private final JdbcTemplate db;
 Health(JdbcTemplate db) { this.db = db; }
 @GetMapping("/health/live") Map<String,String> live() { return Map.of("status", "up"); }
 @GetMapping("/health/ready") ResponseEntity<Map<String,String>> ready() {
  try { db.queryForObject("SELECT marker FROM lms.foundation WHERE id = 1", String.class);
   return ResponseEntity.ok(Map.of("status", "up"));
  } catch (Exception e) { return ResponseEntity.status(503).body(Map.of("status", "down")); }
 }
}
