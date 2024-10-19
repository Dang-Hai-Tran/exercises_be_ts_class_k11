# Use the latest Node.js LTS version as the base image
FROM node:latest

# Create and set the working directory
WORKDIR /app

# Copy necessary files to the working directory
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src ./src

# Install dependencies
RUN npm install
RUN npm run build
# Expose the port the app runs on (optional, adjust if necessary)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
