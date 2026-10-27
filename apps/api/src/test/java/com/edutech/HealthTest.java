package com.edutech;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class HealthTest {
 @Test void healthReflectsDatabaseFailure() {
  var db = mock(JdbcTemplate.class); var health = new Health(db);
  assertEquals("up", health.live().get("status"));
  when(db.queryForObject(anyString(), eq(String.class))).thenThrow(new RuntimeException());
  assertEquals(503, health.ready().getStatusCode().value());
  when(db.queryForObject(anyString(), eq(String.class))).thenReturn("phase-0");
  assertEquals(200, health.ready().getStatusCode().value());
 }
}
