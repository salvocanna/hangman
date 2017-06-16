# Hangman!

Goal of this project: build a nice simple game in node & websocket.

###To install:

You need a redis instance running on localhost.
```bash
docker run -d redis
```
This will launch a new redis instance binding on localhost on default port 6379.

See https://hub.docker.com/_/redis/


Then let's launch the application.

You'll need yarn installed globally. (Or npm, should be the same)

```bash
git clone https://github.com/salvocanna/hangman.git
cd hangman
yarn install
yarn run build && node build/server.js
```

Done. Should work. 
The address is http://localhost:3000/

