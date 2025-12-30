# 1. Use Node.js 20 on Alpine Linux
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. FIX: Install OpenSSL (Crucial for Prisma on Alpine)
RUN apk add --no-cache openssl

# 4. Copy package files
COPY package*.json ./

# 5. Install dependencies
RUN npm install

# 6. Copy the rest of the code
COPY . .

# 7. Generate Prisma Client
RUN npx prisma generate

# 8. Build the TypeScript code
RUN npm run build

# 9. Expose the port
EXPOSE 8000

# 10. Start the app
CMD ["npm", "start"]