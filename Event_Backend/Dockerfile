# Event_Backend/Dockerfile

# 1. Use Node 20 Alpine
FROM node:20-alpine

# 2. Install OpenSSL (Required for Prisma on Alpine)
RUN apk add --no-cache openssl

# 3. Set Working Dir
WORKDIR /app

# 4. Copy Package Files
COPY package*.json ./

# 5. Install Dependencies (Clean install)
RUN npm ci

# 6. Copy Source Code
COPY . .

# 7. Generate Prisma Client
RUN npx prisma generate

# 8. Build TypeScript
RUN npm run build

# 9. Expose Internal Port (Not accessed directly by host)
EXPOSE 8000

# 10. Start Command
CMD ["npm", "start"]