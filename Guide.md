# Run Locally
1. If need re-build `docker-compose build`
2. `docker-compose run`

# Deploy Guide

## Deploy Backend (Server)

1. `cd flask-backend`
2. Delete `, debug=True` in the last line of [app.py](./flask-backend/app.py)
3. 
```
heroku container:login

heroku container:push web --app ebmp-api

heroku container:release web --app ebmp-api
```

## Deploy Frontend (Client)

1. `cd frontend`
2. Change domain from `http://localhost:5000/` to `https://ebmp-api.herokuapp.com/`
3.
```
heroku container:login

heroku container:push web --app emotion-based-music-provider

heroku container:release web --app emotion-based-music-provider
```


# Utilities

- Show all images: `docker images`
- Delete images: `docker rmi -f <imageName>`
- Build single image`docker build -t <name> <path>`

### If want to run frontend backend separately
1. `docker run -p 5000:5000 EBMP-backend`
2. `docker run -p 3000:3000 EBMP-frontend`