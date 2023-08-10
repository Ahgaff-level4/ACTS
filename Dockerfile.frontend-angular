# Create image based on the official Node image from dockerhub
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
RUN mkdir frontend-angular;
COPY frontend-angular/package*.json ./frontend-angular

# Install dependecies
RUN cd frontend-angular && npm install;

# Get all the code needed to run the app
WORKDIR /usr/src/app
COPY . .

# Expose the port the app runs in
EXPOSE 4200

WORKDIR /usr/src/app/frontend-angular
CMD [ "npm", "run", "start" ]