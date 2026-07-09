# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and source code from the RenderBackend folder
COPY RenderBackend/Daily-Management-System-DMS/pom.xml .
COPY RenderBackend/Daily-Management-System-DMS/src ./src

# Build the application inside the container (skipping tests)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/Daily-Management-System-DMS-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
