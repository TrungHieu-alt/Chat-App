FROM node:20-alpine

WORKDIR /app
# Create a non-root user and group, avoid running the application as root for security reasons
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# copy package.json and package-lock.json to the container
COPY package*.json ./
# install dependencies using npm ci for clean install 
RUN npm ci

# copy all src code and all other files to the container
COPY . .
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 5173
# Run command runs when docker build, cmd command runs when docker run
CMD ["npm", "run", "dev"]