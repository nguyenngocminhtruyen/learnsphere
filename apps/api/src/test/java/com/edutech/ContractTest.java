package com.edutech;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@org.springframework.context.annotation.Import(Security.class)
@WebMvcTest(Health.class)
class ContractTest {
 @Autowired MockMvc mvc;
 @MockitoBean JdbcTemplate db;
 @Test void publicHealthMatchesAuthoritativeContract() throws Exception {
  var contract = new ObjectMapper().readTree(Path.of("../../contracts/openapi/lms-public.yaml").toFile());
  for (String path : new String[]{"/health/live", "/health/ready"}) {
   assertTrue(contract.path("paths").has(path));
   when(db.queryForObject(anyString(), eq(String.class))).thenReturn("phase-0");
   mvc.perform(get(path)).andExpect(status().isOk()).andExpect(content().json("{\"status\":\"up\"}"));
  }
 }
 @Test void unknownRoutesFailClosed() throws Exception {
  mvc.perform(get("/v1/admin/courses")).andExpect(status().isUnauthorized())
   .andExpect(content().contentType("application/problem+json"));
 }
}
