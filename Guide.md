
# Deploy Guide

## Build Image

1. Modify the 2 docker file
2. `docker build -t EBMP-backend ./flask-backend`
3. `docker build -t EBMP-frontend ./frontend`

## Run Image Locally
1. `docker-compose run`

### If want to run frontend backend separately
1. `docker run -p 5000:5000 EBMP-backend`
2. `docker run -p 3000:3000 EBMP-frontend`

## Utilities

- Show all images: `docker images`
- Delete images: `docker rmi -f <imageName>`