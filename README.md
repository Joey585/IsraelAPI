Hello, this is the repository for my REST API that powers the up and coming https://israelupdates.blue

It is structured behind the expressjs framework

## Endpoints

- **GET** /oauth2
Recieves the oauth2 link for discord based on your development enviroment (local or external)

- **POST** /auth
Gets the discord user access code based on the initial code supplied from discord and sends it back to the client

- **GET** /verify
Takes the discord access code and creates a user account on the database, or just sends pre-existing info if the user already exists

- **GET** /user *authenticated*
Sends info on any user based on the permissions the token contains. 
