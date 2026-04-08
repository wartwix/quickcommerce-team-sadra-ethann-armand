FROM node:18-alpine

WORKDIR /app

# TODO 1 : Copier package.json
COPY package.json ./

# TODO 2 : Installer dépendances
RUN npm install

# TODO 3 : Copier code source
COPY src ./src

# TODO 4 : Copier SQL
COPY sql ./sql

EXPOSE 3000

CMD ["npm", "start"]