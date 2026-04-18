FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /app

COPY . .

# Move backend to clean path (NO SPACE)
RUN mv "Scholarship System/backend" /app/backend

WORKDIR /app/backend

RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/*.jar"]