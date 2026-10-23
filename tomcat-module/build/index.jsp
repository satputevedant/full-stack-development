<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EMS Status Monitor — Apache Tomcat Module</title>
    <style>
        :root {
            --bg: #000000;
            --card: #0A0A0A;
            --border: rgba(255, 255, 255, 0.15);
            --border-bright: rgba(255, 255, 255, 0.35);
            --text: #FFFFFF;
            --muted: #888888;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple Color Emoji", system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 24px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-tomcat { background: #FFFFFF; color: #000000; border: 1px solid #FFFFFF; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-top: 1px solid var(--border-bright);
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6);
        }
        .metric { font-size: 2.2rem; font-weight: 700; margin: 8px 0; color: #FFFFFF; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.9rem; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
        th { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; }
    </style>
</head>
<body>
<div class="container">
    <header>
        <div>
            <h1 style="margin: 0; font-size: 1.5rem;">🚨 EMS Live Status — Tomcat Java Module</h1>
            <p style="margin: 4px 0 0; color: var(--muted); font-size: 0.85rem;">Syllabus Unit 5: Java Servlet & JSP Deployed on Apache Tomcat v10</p>
        </div>
        <span class="badge badge-tomcat">☕ Apache Tomcat 10</span>
    </header>

    <%
        int activeIncidents = 0;
        int readyAmbulances = 0;
        int availableBeds = 0;
        String dbStatus = "Connecting...";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/emergency_dispatch", "emergency_app", "EmergencyApp_Fix2026!")) {
                dbStatus = "Connected to MySQL emergency_dispatch";

                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM incidents WHERE status NOT IN ('Resolved', 'Cancelled')")) {
                    if (rs.next()) activeIncidents = rs.getInt(1);
                }

                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM ambulances WHERE status = 'Available'")) {
                    if (rs.next()) readyAmbulances = rs.getInt(1);
                }

                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT COALESCE(SUM(available_beds), 0) FROM hospitals")) {
                    if (rs.next()) availableBeds = rs.getInt(1);
                }
    %>
    <div class="grid">
        <div class="card">
            <div style="font-size: 0.75rem; color: var(--muted); display: flex; justify-content: space-between;">
                <span>ACTIVE EMERGENCIES</span>
                <span>🚨</span>
            </div>
            <div class="metric"><%= activeIncidents %></div>
            <div style="font-size: 0.75rem; color: var(--muted);">Pending or Dispatched</div>
        </div>
        <div class="card">
            <div style="font-size: 0.75rem; color: var(--muted); display: flex; justify-content: space-between;">
                <span>AMBULANCES READY</span>
                <span>🚑</span>
            </div>
            <div class="metric"><%= readyAmbulances %></div>
            <div style="font-size: 0.75rem; color: var(--muted);">Available for deployment</div>
        </div>
        <div class="card">
            <div style="font-size: 0.75rem; color: var(--muted); display: flex; justify-content: space-between;">
                <span>AVAILABLE HOSPITAL BEDS</span>
                <span>🛏️</span>
            </div>
            <div class="metric"><%= availableBeds %></div>
            <div style="font-size: 0.75rem; color: var(--muted);">Trauma & Emergency Beds</div>
        </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
        <h3 style="margin-top: 0; font-size: 1.1rem; color: #FFFFFF;">📋 Active Emergency Incidents (Live JDBC Query)</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Caller</th>
                    <th>Address</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <%
                    try (Statement st = conn.createStatement();
                         ResultSet rs = st.executeQuery(
                             "SELECT incident_id, incident_type, severity, caller_name, address, status " +
                             "FROM incidents WHERE status NOT IN ('Resolved', 'Cancelled') " +
                             "ORDER BY incident_id DESC LIMIT 10")) {
                        while (rs.next()) {
                %>
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: #FFFFFF;">#<%= rs.getInt("incident_id") %></td>
                    <td><%= rs.getString("incident_type") %></td>
                    <td>
                        <span class="badge" style="<%= "Critical".equalsIgnoreCase(rs.getString("severity")) ? "background: #FFFFFF; color: #000000;" : "background: rgba(255,255,255,0.1); color: #FFFFFF;" %>">
                            <%= rs.getString("severity") %>
                        </span>
                    </td>
                    <td><%= rs.getString("caller_name") %></td>
                    <td><%= rs.getString("address") %></td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.1); color: #FFFFFF;"><%= rs.getString("status") %></span></td>
                </tr>
                <%
                        }
                    }
                %>
            </tbody>
        </table>
    </div>
    <%
            }
        } catch (Exception e) {
    %>
    <div class="card" style="border-color: #FFFFFF;">
        <h3 style="color: #FFFFFF; margin: 0 0 8px;">⚠️ Database Connection Error</h3>
        <p style="margin: 0; color: var(--muted);"><%= e.getMessage() %></p>
    </div>
    <%
        }
    %>

    <footer style="margin-top: 32px; font-size: 0.75rem; color: var(--muted); text-align: center;">
        Tomcat Web Module · Servlet Path: <code>/status</code> · Time: <%= new java.util.Date() %>
    </footer>
</div>
</body>
</html>
