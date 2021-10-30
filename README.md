# jukebox

## Run redis
```
docker pull redis
docker run --name jukebox-redis -d -p 6379:6379  redis
```

## Install
```
npm install
```

## Start dev
```
cd view && npm run serve
nodemon app.js
```

## Start prod
```
npm run build
npm start
```