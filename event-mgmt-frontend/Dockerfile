# event-mgmt-frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite Port
EXPOSE 5173


CMD ["npm", "run", "dev", "--", "--host"]