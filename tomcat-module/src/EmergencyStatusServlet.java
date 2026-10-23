package com.emergency.dispatch;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/status")
public class EmergencyStatusServlet extends HttpServlet {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/emergency_dispatch";
    private static final String DB_USER = "emergency_app";
    private static final String DB_PASS = "EmergencyApp_Fix2026!";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        try (PrintWriter out = resp.getWriter()) {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {

                // 1. Count active emergencies
                int activeIncidents = 0;
                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT COUNT(*) FROM incidents WHERE status NOT IN ('Resolved', 'Cancelled')");
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) activeIncidents = rs.getInt(1);
                }

                // 2. Count ready ambulances
                int readyAmbulances = 0;
                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT COUNT(*) FROM ambulances WHERE status = 'Available'");
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) readyAmbulances = rs.getInt(1);
                }

                // 3. Total hospital available beds
                int availableBeds = 0;
                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT SUM(available_beds) FROM hospitals");
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) availableBeds = rs.getInt(1);
                }

                out.print(String.format(
                    "{\"status\":\"OPERATIONAL\",\"server\":\"Apache Tomcat 10\"," +
                    "\"activeIncidents\":%d,\"availableAmbulances\":%d,\"availableHospitalBeds\":%d," +
                    "\"timestamp\":\"%s\"}",
                    activeIncidents, readyAmbulances, availableBeds, new java.util.Date().toString()
                ));
            }
        } catch (Exception e) {
            resp.setStatus(500);
            resp.getWriter().print("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }
}
