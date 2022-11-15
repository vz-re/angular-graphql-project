# directory-listing

This is a web application that queries the local file system and returns the directory content for a specific file path.

## Features
The project currently consists of the following technologies:

* GraphQL - Used in the Back-End to query the filesystem
* Angular - Used in the Front-End to render the web application.

## Quick Start

### Back-End
1. Navigate to the backend source directory `cd ./backend/src/`
2. Run `yarn` to load all modules necessary for the project to work.
3. Run `node index.js` to start the server.

### Front-End
1. In a different terminal tab navigate to the frontend directory `cd ./frontend/`
2. Run `yarn` to load all modules necessary for the project to work.
3. Run `ng serve` to build and serve the application. (Optionally add the `--open` tag to automaically open in our default browser)

### Navigate to http://localhost:4200 to interact with the applicaion.

## Future Work
Some items I did not have time to complete/include:

* End-to-End testing
* Code formatting 
* Error handling
* Streaming the data from the Front-End to the Back-End
* Containerize the project
* Restructure project to avoid seperate module loading
