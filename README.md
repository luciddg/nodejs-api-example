## BuildingOS API Node.js Example
A simple webapp that shows information from BuildingOS using an OAuth2 Client

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
