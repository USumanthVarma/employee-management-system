package com.ems.service;

import com.ems.dto.EmployeeDTO;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Day 41 of the curriculum: JUnit 5 + Mockito. The repositories are mocked
 * so these tests exercise EmployeeServiceImpl's own logic (validation,
 * duplicate checks, DTO mapping) in isolation, with no real database.
 */
@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Department engineering;
    private Employee savedEmployee;
    private EmployeeDTO requestDto;

    @BeforeEach
    void setUp() {
        engineering = Department.builder().id(1L).name("Engineering").location("Bengaluru").build();

        savedEmployee = Employee.builder()
                .id(10L)
                .firstName("Aditi")
                .lastName("Sharma")
                .email("aditi.sharma@ems.com")
                .designation("Software Engineer")
                .salary(65000.0)
                .department(engineering)
                .build();

        requestDto = EmployeeDTO.builder()
                .firstName("Aditi")
                .lastName("Sharma")
                .email("aditi.sharma@ems.com")
                .designation("Software Engineer")
                .salary(65000.0)
                .departmentId(1L)
                .build();
    }

    @Test
    void createEmployee_savesAndReturnsDto_whenEmailIsUnique() {
        when(employeeRepository.existsByEmail(requestDto.getEmail())).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(engineering));
        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);

        EmployeeDTO result = employeeService.createEmployee(requestDto);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getDepartmentName()).isEqualTo("Engineering");
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployee_throwsDuplicateResourceException_whenEmailAlreadyExists() {
        when(employeeRepository.existsByEmail(requestDto.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(requestDto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(requestDto.getEmail());
    }

    @Test
    void createEmployee_throwsResourceNotFoundException_whenDepartmentMissing() {
        when(employeeRepository.existsByEmail(requestDto.getEmail())).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.createEmployee(requestDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getEmployeeById_throwsResourceNotFoundException_whenIdMissing() {
        when(employeeRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void getAllEmployees_mapsEntitiesToDtos() {
        when(employeeRepository.findAll()).thenReturn(List.of(savedEmployee));

        List<EmployeeDTO> result = employeeService.getAllEmployees();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("aditi.sharma@ems.com");
    }
}
