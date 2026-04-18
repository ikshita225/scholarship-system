# Use a Maven image to build the project
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the entire project content
COPY . .

# 1. Find the project and build it
# 2. Specifically find the JAR that is NOT labeled 'original' 
# 3. Move it to a clear, absolute path: /app/final.jar
RUN POM_DIR=$(find . -name pom.xml -exec dirname {} \; | head -n 1) && \
    cd "$POM_DIR" && \
    mvn clean package -DskipTests && \
    cp target/$(ls target | grep ".jar$" | grep -v "original" | head -n 1) /app/final.jar

# Final runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the validated fat jar from the build stage
COPY --from=build /app/final.jar app.jar

# Ensure the file is readable and executable
RUN chmod +x app.jar

EXPOSE 8080

# Run using the absolute path to be 100% safe
ENTRYPOINT ["java", "-jar", "/app/app.jar"]