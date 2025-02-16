FROM node:22

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies, including dev dependencies for TypeScript build
RUN npm install

# Copy the rest of the application code
COPY ./server ./server
COPY ./types ./types
COPY ./drizzle ./drizzle
COPY ./tsconfig.json  ./tsconfig.json
COPY ./sqlite.db  ./sqlite.db

# Build the application using TypeScript
RUN npm run check
RUN npm run migrate
# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]