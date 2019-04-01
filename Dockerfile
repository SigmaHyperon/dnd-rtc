FROM node:lts

RUN mkdir /app

# Copy source code
COPY server/package.json /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install --production

RUN  mkdir client
RUN  mkdir jslib
RUN  mkdir server

COPY client/ client/
COPY jslib/ jslib/
COPY server/ server/
COPY server/config/docker.json server/config/default.json

EXPOSE 3000
EXPOSE 3001

WORKDIR /app/server

CMD ["npm","start"]