package com.ems.controller;

import com.ems.dto.EmployeeDTO;
import com.ems.service.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A web-layer slice test: only EmployeeController + Spring MVC infrastructure
 * are loaded, EmployeeService is mocked, and the security filter chain is
 * switched off (addFilters = false) so the test can focus purely on
 * request/response mapping and bean validation. Role-based access itself is
 * exercised manually against the running app - see docs/API_REFERENCE.md.
 */
@WebMvcTest(EmployeeController.class)
@AutoConfigureMockMvc(addFilters = false)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployeeService employeeService;

    @Test
    void getAllEmployees_returnsOkWithJsonBody() throws Exception {
        EmployeeDTO dto = EmployeeDTO.builder()
                .id(1L).firstName("Aditi").lastName("Sharma")
                .email("aditi.sharma@ems.com").departmentId(1L).departmentName("Engineering")
                .build();
        when(employeeService.getAllEmployees()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("aditi.sharma@ems.com"))
                .andExpect(jsonPath("$[0].departmentName").value("Engineering"));
    }

    @Test
    void createEmployee_returnsBadRequest_whenEmailIsMissing() throws Exception {
        EmployeeDTO invalid = EmployeeDTO.builder()
                .firstName("New").lastName("Hire").departmentId(1L)
                .build(); // email left blank on purpose

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }

    @Test
    void createEmployee_returnsCreated_withValidPayload() throws Exception {
        EmployeeDTO request = EmployeeDTO.builder()
                .firstName("New").lastName("Hire").email("new.hire@ems.com").departmentId(1L)
                .build();
        EmployeeDTO response = EmployeeDTO.builder()
                .id(2L).firstName("New").lastName("Hire").email("new.hire@ems.com")
                .departmentId(1L).departmentName("Engineering")
                .build();
        when(employeeService.createEmployee(any(EmployeeDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2));
    }
}
