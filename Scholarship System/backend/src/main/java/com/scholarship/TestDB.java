package com.scholarship;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:mysql://127.0.0.1:3307/?createDatabaseIfNotExist=true";
        String user = "root";
        String password = "Ikshita@2205";

        try {
            System.out.println("Attempting to connect to: " + url);
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("SUCCESS: Connected to MySQL!");
            conn.close();
        } catch (SQLException e) {
            System.err.println("FAILURE: Could not connect to MySQL.");
            System.err.println("Error: " + e.getMessage());
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            e.printStackTrace();
        }
    }
}
