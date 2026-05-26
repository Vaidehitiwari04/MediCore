package com.example.hospital;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class HospitalApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void testCompleteHospitalWorkflow() throws Exception {
        // 1. Create a doctor
        String doctorJson = """
                {
                    "doctorName": "Dr. Gregory House",
                    "specialization": "Diagnostic Medicine"
                }
                """;

        String doctorResult = mockMvc.perform(post("/doctors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(doctorJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.doctorId", notNullValue()))
                .andExpect(jsonPath("$.doctorName", is("Dr. Gregory House")))
                .andExpect(jsonPath("$.specialization", is("Diagnostic Medicine")))
                .andReturn().getResponse().getContentAsString();

        // Parse doctor ID from response (since it's auto-generated)
        int doctorId = Integer.parseInt(doctorResult.split("\"doctorId\":")[1].split(",")[0].trim());

        // 2. Create a patient
        String patientJson = """
                {
                    "name": "Will Smith",
                    "disease": "Influenza"
                }
                """;

        String patientResult = mockMvc.perform(post("/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(patientJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.patientId", notNullValue()))
                .andExpect(jsonPath("$.name", is("Will Smith")))
                .andExpect(jsonPath("$.disease", is("Influenza")))
                .andExpect(jsonPath("$.doctor", nullValue()))
                .andReturn().getResponse().getContentAsString();

        int patientId = Integer.parseInt(patientResult.split("\"patientId\":")[1].split(",")[0].split("}")[0].trim());

        // 3. Assign the doctor to the patient
        mockMvc.perform(put("/patients/" + patientId + "/assign-doctor/" + doctorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientId", is(patientId)))
                .andExpect(jsonPath("$.doctor.doctorId", is(doctorId)))
                .andExpect(jsonPath("$.doctor.doctorName", is("Dr. Gregory House")));

        // 4. Verify aggregated hospital data
        mockMvc.perform(get("/hospital"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctors", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.patients", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.patients[?(@.patientId == " + patientId + ")].doctor.doctorName", contains("Dr. Gregory House")));

        // 5. Update the doctor
        String updatedDoctorJson = """
                {
                    "doctorName": "Dr. House",
                    "specialization": "Nephrology"
                }
                """;

        mockMvc.perform(put("/doctors/" + doctorId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedDoctorJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorName", is("Dr. House")))
                .andExpect(jsonPath("$.specialization", is("Nephrology")));

        // 6. Delete the patient
        mockMvc.perform(delete("/patients/" + patientId))
                .andExpect(status().isNoContent());

        // 7. Verify patient is gone
        mockMvc.perform(get("/patients/" + patientId))
                .andExpect(status().isNotFound());
    }
    // Touch to trigger recompilation
}
