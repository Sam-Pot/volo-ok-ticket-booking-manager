# TICKET-BOOKING-MANAGER

This is a module that can be used for ticket and booking management. It's already configured with gRPC and MySQL.

It already includes the following shared modules:
* database: a module configured with mySQL that contains a customBase entity and some utils.

## Description

It uses the "@nestjs/config" library to access to the environment variables, configured inside a .env file, for which it is provided a starting example.
All the .env params are validated at startup by using the "Joi" library.
A ValidationPipe is configured to validate the content of objects, by using "class-validator" and "class-transformer" libraries.

### TICKET-BOOKING-MANAGER
The following params must be specified in the .env file:
* MS_URL: it refers to the url(ip:port) where the microservice exposes it's services;
* MS_PROTO_PACKAGE: it refers to the package name in the .proto file;

#### Database
It provides a default configuration for a mySQL database access with TypeORM (but can be changed from database.module.ts). 
Each module, that needs to access to the database, can import DatabaseModule by specifying its own entities in the respective "Module" declaration. The module automatically loads all the modules/'modulename'/entities/*.entity.ts entities. 

1. Install MySQL and create a new schema named volook_ticket_booking_manager.
2. The following params must be specified in the .env file:

* DB_HOST: is the database host ip;
* DB_PORT: is the database port;
* DB_USERNAME: is the username used for database auth;
* DB_PASSWORD: is the password used for database auth;
* DB_SCHEMA: is the database schema name;
* DB_SYNCH: if "true" it allows to automatically create/update all database tables, in relation to the project entities. DB_SYNCH MUST BE false IN PRODUCTION TO AVOID DATA LOSS!

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

- Author - [Salvatore Potrino (https://www.linkedin.com/in/salvatore-potrino-a32626255?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

## License

