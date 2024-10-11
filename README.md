## README
# Api for creating and managing credentials

### Overview

- **Credentials** - create and verify credentials
- **Template Editor** - design your own templates

##

## Installation & Usage

pnpm install

pnpm run dev

##

## API Endpoints

### Authentication & Profile
- POST /api/v1/auth/signup - create new user
  ```json
  {
      "username": "test",
      "password": "test",
      "email": "test"
  }
- POST /api/v1/auth/login {username, password} - login
  ```json
  {
      "username": "test",
      "password": "test"
  }
- GET /api/v1/auth/profile - get user profile
- GET /api/v1/auth/keys - get user API keys
- POST /api/v1/auth/key - create new API key
    ```json
    {
        "name": "My key",
    }

- DELETE /api/v1/auth/key - delete API key

### Verifiable Credentials

- POST /api/v1/credential/create - create new credential
   ```json
   {
      "cid": "cid_value", // Certificate Authority (CA) id
      "tid": "tid_value", // Template id
      "waAdmin": "waAdmin_value", // wallet address of the admin creating the credential
      "data": [{ "key": "value" }], // data to be stored in the credential (in the format of a list of key value pairs)
      "email": "user@domain.com",
   }

- post /api/v1/credential/create-verify-url - create verification url
   ```json
   {
      "id": "id_value", // credential id
      "tid": "tid_value", // template id
      "guid": "guid_value",
   }
- GET /api/v1/credential/redirect/:sessionId - handle credential verification redirect
- GET /api/v1/credential/data/:sessionId - get credential data for the session

### Template Editor

- POST /api/v1/template/ - create new template
  ```json
  {
      "cid": "cid_value", // Certificate Authority (CA) id
      "name": "template_name",
      "wa": "waAdmin_value", // wallet address of the admin creating the template
      "frontendProps": {
          "components": [
              {
                  "id": "component_id"
                  ...
                  "type": "text",
              }
          ],
          "currentLayout": "current_layout"
      }
  }
- GET /api/v1/template/:tid - get template
- DELETE /api/v1/template/:tid - delete template
- GET /api/v1/template/:tid/download/:fileFormat - create an example file to use when issuing credentials in bulk

##
