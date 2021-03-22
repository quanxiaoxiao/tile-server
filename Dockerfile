FROM node:14.16.0-alpine

WORKDIR /tile-server

COPY package.json .

COPY . .

ENV PORT=4000

EXPOSE $PORT

CMD ["npm", "run", "start"]
