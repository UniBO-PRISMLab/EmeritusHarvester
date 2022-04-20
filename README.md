[![Site: IoTPrismLab](https://img.shields.io/badge/site-IoT%20Prism%20Lab-blue)](http://iot-prism-lab.nws.cs.unibo.it/)


# EmeritusHarvester

Emeritus Harvester caches the simulation results from DrHarvester.

## Dependencies
Emeritus Harvester needs to communicate with two services: [DrHarvester](https://github.com/xAlessandroC/harvester-adapter) and a MongoDB. Both services can be configured in the [conf.json](src/config/conf.json) file.


## Usage with Docker

### Docker and Docker Compose

This application can be deployed as a [Docker](https://www.docker.com) container unsing [Docker-Compose](https://docs.docker.com/compose/).
The compose file instantiates Emeritus Harvester, a MongoDB instance and a Mongo Express instance - to facilitate data management in MongoDB.   


In order to build and run the containers:

```console
$ docker-compose up
```

## Usage with NPM

To install all dependencies of the Emeritus and deploy it execute the following commands:

```console
$ npm install
$ npm run start
```

## API

Emeritus mirrors [DrHarvester](https://github.com/xAlessandroC/harvester-adapter) API, all endpoints and responses are the same.