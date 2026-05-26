package com.example.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hospital.entity.Patient;

public interface PatientRepository
extends JpaRepository<Patient, Integer> {
}