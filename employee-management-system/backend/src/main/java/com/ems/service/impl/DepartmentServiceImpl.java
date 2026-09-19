package com.ems.service.impl;

import com.ems.dto.DepartmentDTO;
import com.ems.entity.Department;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentById(Long id) {
        return toDTO(findDepartmentOrThrow(id));
    }

    @Override
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("A department already exists named: " + dto.getName());
        }

        Department department = Department.builder()
                .name(dto.getName())
                .location(dto.getLocation())
                .build();

        return toDTO(departmentRepository.save(department));
    }

    @Override
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department department = findDepartmentOrThrow(id);

        boolean nameChanged = !department.getName().equalsIgnoreCase(dto.getName());
        if (nameChanged && departmentRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("A department already exists named: " + dto.getName());
        }

        department.setName(dto.getName());
        department.setLocation(dto.getLocation());

        return toDTO(departmentRepository.save(department));
    }

    @Override
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("No department found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private Department findDepartmentOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No department found with id: " + id));
    }

    private DepartmentDTO toDTO(Department department) {
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .location(department.getLocation())
                .employeeCount(department.getEmployees() == null ? 0 : department.getEmployees().size())
                .build();
    }
}
