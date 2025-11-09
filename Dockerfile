# Use a Node.js image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy files from your project into the container
COPY . .

# Install dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]
