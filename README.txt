Commands to setup

npm install both server and client

in client:

npx cypress open
npm run dev
probably dont need this but just in case:

npm install --save-dev jest mocha chai supertest selenium-webdriver artillery mongodb-memory-server

in server:

npm run start

in mern:

docker-compose up --build