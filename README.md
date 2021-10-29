# jukebox

docker pull redis
docker run --name jukebox-redis -d -p 6379:6379  redis
npm install
npm run build
npm start