# Deliver On

A small Shopify app that lets merchants add a "Deliver On" date selector to their cart page or post-checkout page.

### Build instructions

Deliver On requires [Docker](https://docker.com), which ensures it will always build and function exactly the same no matter where it's deployed or developed.

```bash
# Deliver On uses CouchDB for its database and expects it to be available at 'http://couchdb:5984'
docker pull couchdb
docker run --name couchdb -d -p 5984:5984 couchdb

# Build the Deliver On container, specifying --build-arg env=development when running on a dev machine
docker build --build-arg env=development -t deliver-on

# Start and run the Deliver On container, linking your localhost:8080 port to the container's localhost:443 port, 
# and linking the already linking couchdb container. You also need to specify certain environment variables for the 
# container, either through a .env file or by passing them one-by-one through the command line with -e key=value
docker run --env-file deliveron.private.env -d -p 8080:443 --name deliver-on --link couchdb:couchdb deliver-on

# Extra: check the startup logs for the deliver-on container
docker logs deliver-on

# Extra: attach your shell to the deliver-on container, streaming logs to the shell
docker attach deliver-on

# Extra: remote into the deliver-on container to manually interact with it via bash
docker exec -it deliver-on "bash" 
```

### Environment variables

Deliver On expects several environment variables which get passed to it via Docker through either a .env file or by specifying multiple -e key=value switch during the `docker run` command. 

Environment variable documentation is coming soon!