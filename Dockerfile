FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# RUN npm install --only=production

# Bundle app source
COPY . .

CMD [ "node", "index" ]
