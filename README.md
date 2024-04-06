# Sorter

## Server

```sh
cd server

# install deps
npm i

# initialize the database
npm run db:generate
npm run db:push
npm run db:seed

# start the dev server
npm run dev
```

## App

```sh
cd app

# install deps
npm i
```

Create .env file with server/api URL such as

```env
EXPO_PUBLIC_API_URL=http://192.168.1.64:3100
```

Install [Expo Go](https://expo.dev/go) on you mobile device 

Open Expo Go, Read de QR code
