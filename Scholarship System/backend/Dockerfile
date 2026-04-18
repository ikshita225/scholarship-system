# Use a Maven image to build the project
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the entire project content
COPY . .

# 1. Dynamically find the directory containing pom.xml
# 2. Build the project (skipping tests for speed)
RUN cd "$(find . -name pom.xml -exec dirname {} \;)" && mvn clean package -DskipTests

# Use a lighter runtime image for the final container
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the generated jar from the build stage
COPY --from=build /app/**/target/*.jar app.jar

# Expose the standard Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]