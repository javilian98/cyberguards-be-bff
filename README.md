# Cyberguards BFF (Orchestrator) Microservice

## Environment variable configurations

1. rename your .env copy file to .env

## Running in Docker Compose:

1. Use the environment variables that has private URLs

```
#
# Use these URLs if you are running in docker-compose
#
CASE_SERVICE_URL=http://case-service:10000
USER_SERVICE_URL=http://user-service:10001
EMPLOYEE_SERVICE_URL=http://employee-service:8080
THREAT_SERVICE_URL=http://threat-service:5000
PREDICTION_SERVICE_URL=http://prediction-service:5001
```

2. Make sure your compose.yaml file is within the same directory level as this project and other services folder e.g.:

```
root project folder
  - /cyberguards-frontend
  - /cyberguards-be-cases
  - ...
  - compose.yaml
```

3. Make sure before running the command below, you are in the same directory level as compose.yaml shown above

```
docker compose up -d --build
```

## Running in non-Docker Compose environment:

1. Use the environment variables that has localhost

```
#
# Use these URLs if you are not running docker-compose
#
CASE_SERVICE_URL=http://localhost:10000
USER_SERVICE_URL=http://localhost:10001
EMPLOYEE_SERVICE_URL=http://localhost:8080
THREAT_SERVICE_URL=http://localhost:5000
PREDICTION_SERVICE_URL=http://localhost:5001
```

2. Make sure you are in the cyberguards-be-cases directory
3. Install node_module dependencies by running the command:

```
npm install
```

4. Make sure you are in the cyberguards-be-cases directory
5. Run the application

```
npm run dev
```