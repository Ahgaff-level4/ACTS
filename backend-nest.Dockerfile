# Create image based on the official Node image from dockerhub
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
RUN mkdir backend-nest;
COPY backend-nest/package*.json ./backend-nest

# Install dependecies
RUN cd backend-nest && npm install;

# Get all the code needed to run the app
WORKDIR /usr/src/app
COPY . .

# Expose the port the app runs in
EXPOSE 3000

WORKDIR /usr/src/app/backend-nest
CMD [ "npm", "run", "start:dev" ]