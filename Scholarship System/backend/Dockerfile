FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /app

COPY . .

# Find pom.xml automatically and build from there
RUN cd "$(find . -name pom.xml -exec dirname {} \;)" && mvn clean package -DskipTests

# Run jar from wherever it was built
CMD ["sh", "-c", "java -jar $(find . -name '*.jar')"]