# Step 1 — Start from an existing image (Node 20 on Alpine Linux)
# Alpine is a tiny Linux distro — only 5MB vs Ubuntu's 200MB
FROM node:20-alpine

# Step 2 — Set the working directory inside the container
# All subsequent commands run from here
WORKDIR /app

# Step 3 — Copy package files FIRST (before source code)
# This is a caching trick — Docker caches each step as a "layer"
# If package.json hasn't changed, Docker reuses the cached
# npm ci layer instead of reinstalling everything from scratch
COPY package*.json ./
RUN npm ci

# Step 4 — Copy the rest of your source code
COPY . .

# Step 5 — Build TypeScript to JavaScript
RUN npm run build

# Step 6 — Tell Docker this container listens on port 5000
EXPOSE 5000

# Step 7 — The command that runs when the container starts
CMD ["node", "dist/app.js"]