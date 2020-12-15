FROM node:lts-alpine

WORKDIR /home/node

# Copy manifest files
COPY package*.json ./

# Ensure dependencies are installed
RUN npm install

# The rest of the owl
COPY . .

EXPOSE 8000

CMD ["npm", "run", "simulate-api"]
