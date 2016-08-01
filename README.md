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
docker run --env-file deliveron.private.env -d -p 8080:443 --name deli --link couchdb:couchdb deli 
```