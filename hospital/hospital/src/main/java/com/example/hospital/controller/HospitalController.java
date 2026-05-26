package com.example.hospital.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hospital.repository.DoctorRepository;
import com.example.hospital.repository.PatientRepository;

@RestController
@RequestMapping("/api/hospital")
public class HospitalController {

    @Autowired
    PatientRepository patientRepo;

    @Autowired
    DoctorRepository doctorRepo;

    @GetMapping
    public Map<String, Object> getHospitalData() {

        Map<String, Object> data =
            new HashMap<>();

        data.put(
            "patients",
            patientRepo.findAll()
        );

        data.put(
            "doctors",
            doctorRepo.findAll()
        );

        return data;
    }
}