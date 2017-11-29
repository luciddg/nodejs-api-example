## Example BuildingOS Oauth2 Application
An example web application that retrieves building data from BuildingOS via Oauth2 authentication.

## Prerequisites
- A BuildingOS user account (https://buildingos.com)
- Some buildings in your organization
- An API Client of type "Authorization code". See https://buildingos.com/developers/

## Installation
```
git clone https://github.com/luciddg/nodejs-api-example.git
cd nodejs-api-example
npm install
```
Create a configuration file:
```
cp config_example.json config.json
```
Edit that file and paste in your API Client ID and Secret

Start the application:
```
npm start
```
Point your browser at http://127.0.0.1:3000

In this app you are able to:
- Login with OAuth2
- Show list of buildings
- Select one from list and see a detail view

TODO
- View Building with all meters
- Each meter should have an the type of resource and the most recent reading.
