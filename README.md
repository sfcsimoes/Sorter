# Sorter

## Server

```sh
cd server

# install deps
npm i

#Create .env to hold your environment variables,use the .exemple.env as template

# For Windows use the flowing command to create your .env
npm run env

# Other Platforms
Rename the .exemple.env to .env

# initialize the database
npm run db:start

# start the dev server
npm run dev

#Default Login
email=admin@email.com 
password=123456789
```

## App

```sh
cd app

# install deps
npm i

#Create .env to hold your environment variables,use the .exemple.env as template

# For Windows use the flowing command to create your .env
npm run env

#  Check if the IP on the .env file is correct

# Other Platforms
#Rename the .exemple.env to .env
#Change the {{API_URL}} to the url of your server.

Exemple:
#Create .env file with your API URL
EXPO_PUBLIC_API_URL=http://192.168.56.1:3000


# start your app server
npm start

#Default Login
email=admin@email.com 
password=123456789
```

## Install [Expo Go](https://expo.dev/go) on you mobile device 

### Open Expo Go, Read de QR code

## Your server and mobile device need to be on the same network

