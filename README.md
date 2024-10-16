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

### Credential Authority Profile

- POST /api/v1/ca/ - create new CA
  ```json
  {
    "wa" : "wallet_address",
    "admin_email" : "admin_email"
  }

  response:

  {
    "message": {
        "name": "CA Name",
        "admin_email": "test@test.io",
        "creatorWA": "0x4289128eb6e3b298140845364fbec0f7344ffe8b",
        "contract_address": "0x99999999",
        "admin": [
            "0x4289128eb6e3b298140845364fbec0f7344ffe8b"
        ],
        "issuerKey": {
            "type": "jwk",
            "jwk": {
                "kty": "OKP",
                "d": "Ho_2n9eidSDnKwKrw3pfxl_QYvBf-iLcIysR3ttsDlE",
                "crv": "Ed25519",
                "kid": "nDVD3o4MUzwPddZim_AQIkybSo3gc9pPsS06Ff3A0xU",
                "x": "slQ0XLMtyvETG9GDZz_89ytjspNRsn7fNBcWvtWRsS8"
            }
        },
        "issuerDid": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoibkRWRDNvNE1VendQZGRaaW1fQVFJa3liU28zZ2M5cFBzUzA2RmYzQTB4VSIsIngiOiJzbFEwWExNdHl2RVRHOUdEWnpfODl5dGpzcE5Sc243Zk5CY1d2dFdSc1M4In0",
        "_id": "670fb05a77d3b449d9e3b69f",
        "code": "0x172fde1d5fd586411af4939b776693e93235b1791d17a5d9d935c3886183b16d",
        "createdAt": "2024-10-16T12:23:54.517Z",
        "updatedAt": "2024-10-16T12:23:54.517Z",
        "cid": "670fb05a77d3b449d9e3b69f",
        "id": "670fb05a77d3b449d9e3b69f"
    }
  }

### Authentication & Profile
- POST /api/v1/auth/signup - create new user
  ```json
  {
      "username": "test",
      "password": "test",
      "email": "test"
  }

  response:

  {
    "user": {
        "username": "test",
        "email": "test@test.io",
        "password": "$2a$10$/vk031XerkXo6llZfOIbPODjzOmcmSJzYARzzsFgLfAU6l01OWR9a",
        "walletAddress": "0x9f17ea656ea819a99506067f2214019924401e3f",
        "type": "local",
        "tokens": [],
        "createdAt": "2024-10-16T13:10:58.405Z",
        "updatedAt": "2024-10-16T13:10:58.405Z",
        "id": "670fbb6277d3b449d9e3b72b"
    }
  }
- POST /api/v1/auth/login {username, password} - login
  ```json
  {
      "username": "test",
      "password": "test"
  }

  response:

  {
    "success": true,
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6...-iT7QRTHOD39xxhQ",
    "expiresIn": "24h",
    "walletAddress": "0x1231231231231231231231231231231231231",
    "email": "john.doe@email.com"
  }
- GET /api/v1/auth/profile - get user profile
  ```json
    {
    "data": {
        "email": "test@test.io",
        "wa": "0x1231231231231231231231231231231231231",
        "roles": [
            "owner"
        ],
        "username": "test_ca",
        "balances": [
            {
                "address": "0x99999999",
                "balances": {
                    "createdTemplates": 4,
                    "createdCredentials": 181,
                    "allowedTemplates": 6,
                    "allowedCredentials": 191
                }
            }
        ],
        "hasDCA": true
    }
  }
- GET /api/v1/auth/keys - get user API keys
  ```json
  {
    "tokens": [
        {
            "id": "3cd9a541-38e1-44c8-b3b7-28ce8775a375",
            "token": "WalliD-e.../uk=",
            "name": "test key",
            "dateCreated": "2024-10-09T11:41:37.798Z",
            "_id": "67066bf1d6859374596b8773"
        },
        {
            "id": "852c3957-e7fb-47de-8eea-2d26d8d3fe42",
            "token": "WalliD-d...quU=",
            "name": "test key 2",
            "dateCreated": "2024-10-09T13:09:39.661Z",
            "_id": "67068093e6f7f73fba2dfa7a"
        }
    ]
  }

- POST /api/v1/auth/key - create new API key
    ```json
    {
        "name": "My key",
    }

    response:

    {
      "id": "852c3957-e7fb-47de-8eea-2d26d8d3fe42",
      "token": "WalliD-d...quU=",
      "name": "test key 2",
      "dateCreated": "2024-10-09T13:09:39.661Z",
      "_id": "67068093e6f7f73fba2dfa7a"
    }

- DELETE /api/v1/auth/key - delete API key
    ```json
    {
      "id": "852c3957-e7fb-47de-8eea-2d26d8d3fe42",
      "token": "WalliD-d...quU=",
      "name": "test key 2",
      "dateCreated": "2024-10-09T13:09:39.661Z",
      "_id": "67068093e6f7f73fba2dfa7a"
  }


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

   response:

   {
    "data": {
        "mgs": "The invite 670fb0d577d3b449d9e3b6a7 was sent!",
        "inviteId": "670fb0d577d3b449d9e3b6a7"
    },
    "credentialUrl": "openid-credential-offer://issuer.portal.walt.id/?credential_offer_uri=https%3A%2F%2Fissuer.portal.walt.id%2Fopenid4vc%2FcredentialOffer%3Fid%3Dc4d7f3f6-a8fb-4f89-8ca7-c2e9932dc3e4"
  }

- POST /api/v1/credential/create-verify-url - create verification url
   ```json
   {
      "id": "id_value", // credential id
      "tid": "tid_value", // template id
      "guid": "guid_value",
   }

   response:

  {
    "verificationUrl": "openid4vp://authorize?response_type=vp_token&client_id=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fverify&response_mode=direct_post&state=ClJIRQQu8FBr&presentation_definition_uri=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fpd%2FClJIRQQu8FBr&client_id_scheme=redirect_uri&client_metadata=%7B%22authorization_encrypted_response_alg%22%3A%22ECDH-ES%22%2C%22authorization_encrypted_response_enc%22%3A%22A256GCM%22%7D&nonce=f9ce4c7d-2804-4804-bc21-6e1fe199da60&response_uri=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fverify%2FClJIRQQu8FBr"
  }

- GET /api/v1/credential/redirect/:sessionId - handle credential verification redirect

  - Triggers socket io event in the Verify page session

- GET /api/v1/credential/data/:sessionId - get credential data for the session in the OIDC format

  ```	json
  {
    "id": "4I4Fh1MpQTyU",
    "presentationDefinition": {
      "id": "6XtJIeeJXpcL",
      "input_descriptors": [
        {
          "id": "NaturalPersonVerifiableID",
          "format": {
            "jwt_vc_json": {
              "alg": [
                "EdDSA"
              ]
            }
          },
          "constraints": {
            "fields": [
              {
                "path": [
                  "$.credentialSubject.tid"
                ],
                "filter": {
                  "type": "string",
                  "pattern": "670034d86ccf09c433c2ad54"
                }
              }
            ]
          }
        }
      ]
    },
    "tokenResponse": {
      "vp_token": "eyJraWQiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaVVVWlpaa0ZvTUc0eWRGTkJWek5rVFZKTmNrc3piRmt3YWpGUWJUWkxjRFpqTTBsWE1XSjJlR2xvTkNJc0luZ2lPaUpDY21RMGFEbDJhRjlGVkROR1VHaDJaMkphYm1GTmVXWnVhekYzVG5BMlMyYzRVa3hsWTBnNVIwczRJbjAjMCIsInR5cCI6IkpXVCIsImFsZyI6IkVkRFNBIn0.eyJzdWIiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaVVVWlpaa0ZvTUc0eWRGTkJWek5rVFZKTmNrc3piRmt3YWpGUWJUWkxjRFpqTTBsWE1XSjJlR2xvTkNJc0luZ2lPaUpDY21RMGFEbDJhRjlGVkROR1VHaDJaMkphYm1GTmVXWnVhekYzVG5BMlMyYzRVa3hsWTBnNVIwczRJbjAiLCJuYmYiOjE3Mjg0OTAwNDUsImlhdCI6MTcyODQ5MDEwNSwianRpIjoiNlh0SkllZUpYcGNMIiwiaXNzIjoiZGlkOmp3azpleUpyZEhraU9pSlBTMUFpTENKamNuWWlPaUpGWkRJMU5URTVJaXdpYTJsa0lqb2lVVVpaWmtGb01HNHlkRk5CVnpOa1RWSk5ja3N6YkZrd2FqRlFiVFpMY0Raak0wbFhNV0oyZUdsb05DSXNJbmdpT2lKQ2NtUTBhRGwyYUY5RlZETkdVR2gyWjJKYWJtRk5lV1p1YXpGM1RuQTJTMmM0VWt4bFkwZzVSMHM0SW4wIiwibm9uY2UiOiI4MWQ5MzJjNy05ZWU0LTRjYjAtYWYxOC05N2UzZDRhZGQ4NTMiLCJhdWQiOiJodHRwczovL3ZlcmlmaWVyLnBvcnRhbC53YWx0LmlkL29wZW5pZDR2Yy92ZXJpZnkiLCJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwiaWQiOiI2WHRKSWVlSlhwY0wiLCJob2xkZXIiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaVVVWlpaa0ZvTUc0eWRGTkJWek5rVFZKTmNrc3piRmt3YWpGUWJUWkxjRFpqTTBsWE1XSjJlR2xvTkNJc0luZ2lPaUpDY21RMGFEbDJhRjlGVkROR1VHaDJaMkphYm1GTmVXWnVhekYzVG5BMlMyYzRVa3hsWTBnNVIwczRJbjAiLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUpyYVdRaU9pSmthV1E2YW5kck9tVjVTbkprU0d0cFQybEtVRk14UVdsTVEwcHFZMjVaYVU5cFNrWmFSRWt4VGxSRk5VbHBkMmxoTW14clNXcHZhV05XVVRGVWFtc3pZakpTZWxWcVdUTldNR3haWVVaR2NWbHRhRVJTUlRReFpXNVNURlpGT1ZaTVZWb3hWREpOTUZWdVozbFZhVEZXVVZOSmMwbHVaMmxQYVVreVYxWndlbFZWYzNwWFJGcFpUMVpyZDFkSGRIRmxibXhIWWtWc2Nsa3lUa2xqVmtKUlkxZE9WR0V3V25abGJHY3dWakJ3VmxNeU1YWkpiakFpTENKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlpFUlRRU0o5LmV5SnBjM01pT2lKa2FXUTZhbmRyT21WNVNuSmtTR3RwVDJsS1VGTXhRV2xNUTBwcVkyNVphVTlwU2taYVJFa3hUbFJGTlVscGQybGhNbXhyU1dwdmFXTldVVEZVYW1zellqSlNlbFZxV1ROV01HeFpZVVpHY1ZsdGFFUlNSVFF4Wlc1U1RGWkZPVlpNVlZveFZESk5NRlZ1WjNsVmFURldVVk5KYzBsdVoybFBhVWt5VjFad2VsVlZjM3BYUkZwWlQxWnJkMWRIZEhGbGJteEhZa1ZzY2xreVRrbGpWa0pSWTFkT1ZHRXdXblpsYkdjd1ZqQndWbE15TVhaSmJqQWlMQ0p6ZFdJaU9pSmthV1E2YW5kck9tVjVTbkprU0d0cFQybEtVRk14UVdsTVEwcHFZMjVaYVU5cFNrWmFSRWt4VGxSRk5VbHBkMmxoTW14clNXcHZhVlZWV2xwYWEwWnZUVWMwZVdSR1RrSldlazVyVkZaS1RtTnJjM3BpUm10M1lXcEdVV0pVV2t4alJGcHFUVEJzV0UxWFNqSmxSMnh2VGtOSmMwbHVaMmxQYVVwRFkyMVJNR0ZFYkRKaFJqbEdWa1JPUjFWSGFESmFNa3BoWW0xR1RtVlhXblZoZWtZelZHNUJNbE15WXpSVmEzaHNXVEJuTlZJd2N6UkpiakFpTENKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSmRMQ0pwWkNJNklqWTNNRFE1TURoaFptSmlabVk1WkRGaE4yUTVOVFV5T1NJc0luUjVjR1VpT2xzaVZtVnlhV1pwWVdKc1pVTnlaV1JsYm5ScFlXd2lMQ0pPWVhSMWNtRnNVR1Z5YzI5dVZtVnlhV1pwWVdKc1pVbEVJbDBzSW1semMzVmhibU5sUkdGMFpTSTZJakl3TWpRdE1UQXRNRGhVTURFNk5UTTZNVFF1T1RFNVdpSXNJbU55WldSbGJuUnBZV3hUZFdKcVpXTjBJanA3SW5ScFpDSTZJalkzTURBek5HUTRObU5qWmpBNVl6UXpNMk15WVdRMU5DSXNJbU5wWkNJNklqWTJabVEzTmpkalltUTFNelpqWVRRMk1HWXpNMkpsTkNJc0ltVnRZV2xzSWpvaVozVnBiR2hsY20xbExtRnljMlZ1YVc5QWQyRnNiR2xrTG1sdklpd2lkWE5sY2tSaGRHRWlPbnNpVUV4QlEwVklUMHhFUlZJaU9pSlVaWE4wSW4wc0luQjFZbXhwWTE5bWFXVnNaQ0k2SWlJc0ltbHRaMEZ5Y21GNUlqcGJJbWgwZEhBNkx5OHhNamN1TUM0d0xqRTZNekF3TUM5bWRIQXZOamN3TkRJeFpHUmtPVEV3WkRCaU5qRmpNakUyT1dFMElsMHNJbkpsZG05clpWOXphV2NpT2x0ZExDSnpkR0YwZFhNaU9pSjNZV2wwYVc1blgzZGhiR3hsZENJc0ltTnlaV0YwWldSQmRDSTZJakl3TWpRdE1UQXRNRGhVTURFNk5UTTZNVFF1T0RVMVdpSXNJblZ3WkdGMFpXUkJkQ0k2SWpJd01qUXRNVEF0TURoVU1ERTZOVE02TVRRdU9EVTFXaUlzSW1sa0lqb2lOamN3TkRrd09HRm1ZbUptWmpsa01XRTNaRGsxTlRJNUluMTlMQ0pxZEdraU9pSTJOekEwT1RBNFlXWmlZbVptT1dReFlUZGtPVFUxTWpraUxDSnBZWFFpT2pFM01qZ3pOVEl6T1RRc0ltNWlaaUk2TVRjeU9ETTFNak01TkgwLmQ4S0JFaWN2VVd0R3g5dkp4ZVJOTWVpS2JHUks4TTBTVlBoM1NZcEwyaTNYMlVmVmhpNTJnMjQ4NGp6dy1IRWZCQ2I4SlY5ZlRiSV9zX0ViUmVrVkRRIiwiZXlKcmFXUWlPaUprYVdRNmFuZHJPbVY1U25Ka1NHdHBUMmxLVUZNeFFXbE1RMHBxWTI1WmFVOXBTa1phUkVreFRsUkZOVWxwZDJsaE1teHJTV3B2YVUxc2NFMVdibVF6WVd4bk0xSlVUa05VTTAxNVVsVjBWV1JyTlhoYVZYaDRUVmRzYkZGck1UTlNhMnhMVmxZNVRGWkZhelZOZWs1dFlYbEpjMGx1WjJsUGFVcGhWbFpHVDFGdGRIVmthVEZvWlZkR1JGRnRWWHBsYmxaUlZETm9jbFZ0T1VOUmJFWm9ZbFJTUmt4WVVsaFpiRVl3VlZWMFVVOVdPSGRKYmpBaUxDSjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSkZaRVJUUVNKOS5leUpwYzNNaU9pSmthV1E2YW5kck9tVjVTbkprU0d0cFQybEtVRk14UVdsTVEwcHFZMjVaYVU5cFNrWmFSRWt4VGxSRk5VbHBkMmxoTW14clNXcHZhVTFzY0UxV2JtUXpZV3huTTFKVVRrTlVNMDE1VWxWMFZXUnJOWGhhVlhoNFRWZHNiRkZyTVROU2EyeExWbFk1VEZaRmF6Vk5lazV0WVhsSmMwbHVaMmxQYVVwaFZsWkdUMUZ0ZEhWa2FURm9aVmRHUkZGdFZYcGxibFpSVkROb2NsVnRPVU5SYkVab1lsUlNSa3hZVWxoWmJFWXdWVlYwVVU5V09IZEpiakFpTENKemRXSWlPaUprYVdRNmFuZHJPbVY1U25Ka1NHdHBUMmxLVUZNeFFXbE1RMHBxWTI1WmFVOXBTa1phUkVreFRsUkZOVWxwZDJsaE1teHJTV3B2YVZWVldscGFhMFp2VFVjMGVXUkdUa0pXZWs1clZGWktUbU5yYzNwaVJtdDNZV3BHVVdKVVdreGpSRnBxVFRCc1dFMVhTakpsUjJ4dlRrTkpjMGx1WjJsUGFVcERZMjFSTUdGRWJESmhSamxHVmtST1IxVkhhREphTWtwaFltMUdUbVZYV25WaGVrWXpWRzVCTWxNeVl6UlZhM2hzV1RCbk5WSXdjelJKYmpBaUxDSjJZeUk2ZXlKQVkyOXVkR1Y0ZENJNld5Sm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OTJNU0pkTENKcFpDSTZJalkzTURRNU16TTFOV0UxTmpCbFpXSmxaamt4TVRZMk1TSXNJblI1Y0dVaU9sc2lWbVZ5YVdacFlXSnNaVU55WldSbGJuUnBZV3dpTENKT1lYUjFjbUZzVUdWeWMyOXVWbVZ5YVdacFlXSnNaVWxFSWwwc0ltbHpjM1ZoYm1ObFJHRjBaU0k2SWpJd01qUXRNVEF0TURoVU1ESTZNRFE2TXpndU1EWXhXaUlzSW1OeVpXUmxiblJwWVd4VGRXSnFaV04wSWpwN0luUnBaQ0k2SWpZM01EQXpOR1E0Tm1OalpqQTVZelF6TTJNeVlXUTFOQ0lzSW1OcFpDSTZJalkyWm1RM05qZGpZbVExTXpaallUUTJNR1l6TTJKbE5DSXNJbVZ0WVdsc0lqb2laM1ZwYkdobGNtMWxMbUZ5YzJWdWFXOUFkMkZzYkdsa0xtbHZJaXdpZFhObGNrUmhkR0VpT25zaVVFeEJRMFZJVDB4RVJWSWlPaUpVWlhOMEluMHNJbkIxWW14cFkxOW1hV1ZzWkNJNklpSXNJbWx0WjBGeWNtRjVJanBiSW1oMGRIQTZMeTh4TWpjdU1DNHdMakU2TXpBd01DOW1kSEF2Tmpjd05ESXhaR1JrT1RFd1pEQmlOakZqTWpFMk9XRTBJbDBzSW5KbGRtOXJaVjl6YVdjaU9sdGRMQ0p6ZEdGMGRYTWlPaUozWVdsMGFXNW5YM2RoYkd4bGRDSXNJbU55WldGMFpXUkJkQ0k2SWpJd01qUXRNVEF0TURoVU1ESTZNRFE2TXpjdU9USTRXaUlzSW5Wd1pHRjBaV1JCZENJNklqSXdNalF0TVRBdE1EaFVNREk2TURRNk16Y3VPVEk0V2lJc0ltbGtJam9pTmpjd05Ea3pNelUxWVRVMk1HVmxZbVZtT1RFeE5qWXhJbjE5TENKcWRHa2lPaUkyTnpBME9UTXpOVFZoTlRZd1pXVmlaV1k1TVRFMk5qRWlMQ0pwWVhRaU9qRTNNamd6TlRNd056Z3NJbTVpWmlJNk1UY3lPRE0xTXpBM09IMC5DaXJMMFJYQ1VLSWNyclpEeGdmdDB4dVVuWU5qS1VsOWpiYVFDMGQ5RVhuems0MEVRWTlvTUhOc2xDa0pLMjhIUi1pWl9YanUtZlMwUU9uNllVcEhBdyJdfX0.1LvJs07EA_sb4Z3tCxWdqxSwGDTw3rqHTjNpiv85_s0ZmXD6gIs0u3yWFrjH0OLEMqcFow-ufgvpXRKGv6NnBg",
      "presentation_submission": {
        "id": "6XtJIeeJXpcL",
        "definition_id": "6XtJIeeJXpcL",
        "descriptor_map": [
          {
            "id": "NaturalPersonVerifiableID",
            "format": "jwt_vp",
            "path": "$",
            "path_nested": {
              "id": "NaturalPersonVerifiableID",
              "format": "jwt_vc_json",
              "path": "$.verifiableCredential[0]"
            }
          },
          {
            "id": "NaturalPersonVerifiableID",
            "format": "jwt_vp",
            "path": "$",
            "path_nested": {
              "id": "NaturalPersonVerifiableID",
              "format": "jwt_vc_json",
              "path": "$.verifiableCredential[1]"
            }
          }
        ]
      },
      "state": "4I4Fh1MpQTyU"
    },
    "verificationResult": true,
    "policyResults": {
      "results": [
        {
          "credential": "VerifiablePresentation",
          "policyResults": [
            {
              "policy": "signature",
              "description": "Checks a JWT credential by verifying its cryptographic signature using the key referenced by the DID in `iss`.",
              "is_success": true,
              "result": {
                "sub": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiUUZZZkFoMG4ydFNBVzNkTVJNckszbFkwajFQbTZLcDZjM0lXMWJ2eGloNCIsIngiOiJCcmQ0aDl2aF9FVDNGUGh2Z2JabmFNeWZuazF3TnA2S2c4UkxlY0g5R0s4In0",
                "nbf": 1728490045,
                "iat": 1728490105,
                "jti": "6XtJIeeJXpcL",
                "iss": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiUUZZZkFoMG4ydFNBVzNkTVJNckszbFkwajFQbTZLcDZjM0lXMWJ2eGloNCIsIngiOiJCcmQ0aDl2aF9FVDNGUGh2Z2JabmFNeWZuazF3TnA2S2c4UkxlY0g5R0s4In0",
                "nonce": "81d932c7-9ee4-4cb0-af18-97e3d4add853",
                "aud": "https://verifier.portal.walt.id/openid4vc/verify",
                "vp": {
                  "@context": [
                    "https://www.w3.org/2018/credentials/v1"
                  ],
                  "type": [
                    "VerifiablePresentation"
                  ],
                  "id": "6XtJIeeJXpcL",
                  "holder": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiUUZZZkFoMG4ydFNBVzNkTVJNckszbFkwajFQbTZLcDZjM0lXMWJ2eGloNCIsIngiOiJCcmQ0aDl2aF9FVDNGUGh2Z2JabmFNeWZuazF3TnA2S2c4UkxlY0g5R0s4In0",
                  "verifiableCredential": [
                    "eyJraWQiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaWNWUTFUamszYjJSelVqWTNWMGxZYUZGcVltaERSRTQxZW5STFZFOVZMVVoxVDJNMFVuZ3lVaTFWUVNJc0luZ2lPaUkyV1ZwelVVc3pXRFpZT1Zrd1dHdHFlbmxHYkVsclkyTkljVkJRY1dOVGEwWnZlbGcwVjBwVlMyMXZJbjAiLCJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9.eyJpc3MiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaWNWUTFUamszYjJSelVqWTNWMGxZYUZGcVltaERSRTQxZW5STFZFOVZMVVoxVDJNMFVuZ3lVaTFWUVNJc0luZ2lPaUkyV1ZwelVVc3pXRFpZT1Zrd1dHdHFlbmxHYkVsclkyTkljVkJRY1dOVGEwWnZlbGcwVjBwVlMyMXZJbjAiLCJzdWIiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaVVVWlpaa0ZvTUc0eWRGTkJWek5rVFZKTmNrc3piRmt3YWpGUWJUWkxjRFpqTTBsWE1XSjJlR2xvTkNJc0luZ2lPaUpDY21RMGFEbDJhRjlGVkROR1VHaDJaMkphYm1GTmVXWnVhekYzVG5BMlMyYzRVa3hsWTBnNVIwczRJbjAiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6IjY3MDQ5MDhhZmJiZmY5ZDFhN2Q5NTUyOSIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJOYXR1cmFsUGVyc29uVmVyaWZpYWJsZUlEIl0sImlzc3VhbmNlRGF0ZSI6IjIwMjQtMTAtMDhUMDE6NTM6MTQuOTE5WiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7InRpZCI6IjY3MDAzNGQ4NmNjZjA5YzQzM2MyYWQ1NCIsImNpZCI6IjY2ZmQ3NjdjYmQ1MzZjYTQ2MGYzM2JlNCIsImVtYWlsIjoiZ3VpbGhlcm1lLmFyc2VuaW9Ad2FsbGlkLmlvIiwidXNlckRhdGEiOnsiUExBQ0VIT0xERVIiOiJUZXN0In0sInB1YmxpY19maWVsZCI6IiIsImltZ0FycmF5IjpbImh0dHA6Ly8xMjcuMC4wLjE6MzAwMC9mdHAvNjcwNDIxZGRkOTEwZDBiNjFjMjE2OWE0Il0sInJldm9rZV9zaWciOltdLCJzdGF0dXMiOiJ3YWl0aW5nX3dhbGxldCIsImNyZWF0ZWRBdCI6IjIwMjQtMTAtMDhUMDE6NTM6MTQuODU1WiIsInVwZGF0ZWRBdCI6IjIwMjQtMTAtMDhUMDE6NTM6MTQuODU1WiIsImlkIjoiNjcwNDkwOGFmYmJmZjlkMWE3ZDk1NTI5In19LCJqdGkiOiI2NzA0OTA4YWZiYmZmOWQxYTdkOTU1MjkiLCJpYXQiOjE3MjgzNTIzOTQsIm5iZiI6MTcyODM1MjM5NH0.d8KBEicvUWtGx9vJxeRNMeiKbGRK8M0SVPh3SYpL2i3X2UfVhi52g2484jzw-HEfBCb8JV9fTbI_s_EbRekVDQ",
                    "eyJraWQiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaU1scE1WbmQzYWxnM1JUTkNUM015UlV0VWRrNXhaVXh4TVdsbFFrMTNSa2xLVlY5TFZFazVNek5tYXlJc0luZ2lPaUphVlZGT1FtdHVkaTFoZVdGRFFtVXplblZRVDNoclVtOUNRbEZoYlRSRkxYUlhZbEYwVVV0UU9WOHdJbjAiLCJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9.eyJpc3MiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaU1scE1WbmQzYWxnM1JUTkNUM015UlV0VWRrNXhaVXh4TVdsbFFrMTNSa2xLVlY5TFZFazVNek5tYXlJc0luZ2lPaUphVlZGT1FtdHVkaTFoZVdGRFFtVXplblZRVDNoclVtOUNRbEZoYlRSRkxYUlhZbEYwVVV0UU9WOHdJbjAiLCJzdWIiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2lhMmxrSWpvaVVVWlpaa0ZvTUc0eWRGTkJWek5rVFZKTmNrc3piRmt3YWpGUWJUWkxjRFpqTTBsWE1XSjJlR2xvTkNJc0luZ2lPaUpDY21RMGFEbDJhRjlGVkROR1VHaDJaMkphYm1GTmVXWnVhekYzVG5BMlMyYzRVa3hsWTBnNVIwczRJbjAiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6IjY3MDQ5MzM1NWE1NjBlZWJlZjkxMTY2MSIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJOYXR1cmFsUGVyc29uVmVyaWZpYWJsZUlEIl0sImlzc3VhbmNlRGF0ZSI6IjIwMjQtMTAtMDhUMDI6MDQ6MzguMDYxWiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7InRpZCI6IjY3MDAzNGQ4NmNjZjA5YzQzM2MyYWQ1NCIsImNpZCI6IjY2ZmQ3NjdjYmQ1MzZjYTQ2MGYzM2JlNCIsImVtYWlsIjoiZ3VpbGhlcm1lLmFyc2VuaW9Ad2FsbGlkLmlvIiwidXNlckRhdGEiOnsiUExBQ0VIT0xERVIiOiJUZXN0In0sInB1YmxpY19maWVsZCI6IiIsImltZ0FycmF5IjpbImh0dHA6Ly8xMjcuMC4wLjE6MzAwMC9mdHAvNjcwNDIxZGRkOTEwZDBiNjFjMjE2OWE0Il0sInJldm9rZV9zaWciOltdLCJzdGF0dXMiOiJ3YWl0aW5nX3dhbGxldCIsImNyZWF0ZWRBdCI6IjIwMjQtMTAtMDhUMDI6MDQ6MzcuOTI4WiIsInVwZGF0ZWRBdCI6IjIwMjQtMTAtMDhUMDI6MDQ6MzcuOTI4WiIsImlkIjoiNjcwNDkzMzU1YTU2MGVlYmVmOTExNjYxIn19LCJqdGkiOiI2NzA0OTMzNTVhNTYwZWViZWY5MTE2NjEiLCJpYXQiOjE3MjgzNTMwNzgsIm5iZiI6MTcyODM1MzA3OH0.CirL0RXCUKIcrrZDxgft0xuUnYNjKUl9jbaQC0d9EXnzk40EQY9oMHNslCkJK28HR-iZ_Xju-fS0QOn6YUpHAw"
                  ]
                }
              }
            }
          ]
        },
        {
          "credential": "NaturalPersonVerifiableID",
          "policyResults": [
            {
              "policy": "signature",
              "description": "Checks a JWT credential by verifying its cryptographic signature using the key referenced by the DID in `iss`.",
              "is_success": true,
              "result": {
                "iss": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoicVQ1Tjk3b2RzUjY3V0lYaFFqYmhDRE41enRLVE9VLUZ1T2M0UngyUi1VQSIsIngiOiI2WVpzUUszWDZYOVkwWGtqenlGbElrY2NIcVBQcWNTa0Zvelg0V0pVS21vIn0",
                "sub": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiUUZZZkFoMG4ydFNBVzNkTVJNckszbFkwajFQbTZLcDZjM0lXMWJ2eGloNCIsIngiOiJCcmQ0aDl2aF9FVDNGUGh2Z2JabmFNeWZuazF3TnA2S2c4UkxlY0g5R0s4In0",
                "vc": {
                  "@context": [
                    "https://www.w3.org/2018/credentials/v1"
                  ],
                  "id": "6704908afbbff9d1a7d95529",
                  "type": [
                    "VerifiableCredential",
                    "NaturalPersonVerifiableID"
                  ],
                  "issuanceDate": "2024-10-08T01:53:14.919Z",
                  "credentialSubject": {
                    "tid": "670034d86ccf09c433c2ad54",
                    "cid": "66fd767cbd536ca460f33be4",
                    "email": "guilherme.arsenio@wallid.io",
                    "userData": {
                      "PLACEHOLDER": "Test"
                    },
                    "public_field": "",
                    "imgArray": [
                      "http://127.0.0.1:3000/ftp/670421ddd910d0b61c2169a4"
                    ],
                    "revoke_sig": [],
                    "status": "waiting_wallet",
                    "createdAt": "2024-10-08T01:53:14.855Z",
                    "updatedAt": "2024-10-08T01:53:14.855Z",
                    "id": "6704908afbbff9d1a7d95529"
                  }
                },
                "jti": "6704908afbbff9d1a7d95529",
                "iat": 1728352394,
                "nbf": 1728352394
              }
            }
          ]
        },
        {
          "credential": "NaturalPersonVerifiableID",
          "policyResults": [
            {
              "policy": "signature",
              "description": "Checks a JWT credential by verifying its cryptographic signature using the key referenced by the DID in `iss`.",
              "is_success": true,
              "result": {
                "iss": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiMlpMVnd3alg3RTNCT3MyRUtUdk5xZUxxMWllQk13RklKVV9LVEk5MzNmayIsIngiOiJaVVFOQmtudi1heWFDQmUzenVQT3hrUm9CQlFhbTRFLXRXYlF0UUtQOV8wIn0",
                "sub": "did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiUUZZZkFoMG4ydFNBVzNkTVJNckszbFkwajFQbTZLcDZjM0lXMWJ2eGloNCIsIngiOiJCcmQ0aDl2aF9FVDNGUGh2Z2JabmFNeWZuazF3TnA2S2c4UkxlY0g5R0s4In0",
                "vc": {
                  "@context": [
                    "https://www.w3.org/2018/credentials/v1"
                  ],
                  "id": "670493355a560eebef911661",
                  "type": [
                    "VerifiableCredential",
                    "NaturalPersonVerifiableID"
                  ],
                  "issuanceDate": "2024-10-08T02:04:38.061Z",
                  "credentialSubject": {
                    "tid": "670034d86ccf09c433c2ad54",
                    "cid": "66fd767cbd536ca460f33be4",
                    "email": "guilherme.arsenio@wallid.io",
                    "userData": {
                      "PLACEHOLDER": "Test"
                    },
                    "public_field": "",
                    "imgArray": [
                      "http://127.0.0.1:3000/ftp/670421ddd910d0b61c2169a4"
                    ],
                    "revoke_sig": [],
                    "status": "waiting_wallet",
                    "createdAt": "2024-10-08T02:04:37.928Z",
                    "updatedAt": "2024-10-08T02:04:37.928Z",
                    "id": "670493355a560eebef911661"
                  }
                },
                "jti": "670493355a560eebef911661",
                "iat": 1728353078,
                "nbf": 1728353078
              }
            }
          ]
        }
      ],
      "time": "PT0.011851902S",
      "policiesRun": 3
    }
  }


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

  response
  {
      "cid": "66fd767cbd536ca460f33be4",
      "name": "Card",
      "creatorWa": "0x4289128eb6e3b298140845364fbec0f7344ffe8b",
      "frontendProps": {
          "name": "Card",
          "repeatedAttributes": false,
          "currentLayout": "Card",
          "design": "Card",
      },
      "lang": "en",
      "template_chain": {
          "sig": []
      },
      "status": "active",
      "admin": [
          "0x4289128eb6e3b298140845364fbec0f7344ffe8b"
      ],
      "tid": "670fb92e77d3b449d9e3b6fe"
  }



- GET /api/v1/template/:tid - get template

  ```json
  {
    "cid": "66fd767cbd536ca460f33be4",
    "name": "Card",
    "creatorWa": "0x4289128eb6e3b298140845364fbec0f7344ffe8b",
    "frontendProps": {
        "name": "Card",
        "repeatedAttributes": false,
        "currentLayout": "Card",
        "design": "Card",
        "components": [
          (...)
        ],
        "layoutBackgroundColor": "#29969E",
        "backgroundFront": "http://127.0.0.1:3000/ftp/670fb92e77d3b449d9e3b6f8",
        "backgroundBack": "",
        "customTemplateName": "templateEditor",
        "preview": "http://127.0.0.1:3000/api/v1/assets/backgrounds/card-design.png",
        "conditions": []
    },
    "lang": "en",
    "template_chain": {
        "sig": []
    },
    "status": "active",
    "admin": [
        "0x4289128eb6e3b298140845364fbec0f7344ffe8b"
    ],
    "_id": "670fb92e77d3b449d9e3b6fe",
    "tid_sod": "0x32c854c8fd9dc2f46439c3aae7bf63fccbeec15185b7dadd4cdd4acd0dbde3f5",
    "createdAt": "2024-10-16T13:01:34.880Z",
    "updatedAt": "2024-10-16T13:01:34.880Z",
    "tid": "670fb92e77d3b449d9e3b6fe"
  }

- DELETE /api/v1/template/:tid - delete template

  ```json
  {
    "tid": "670fb92e77d3b449d9e3b6fe"
  }

- GET /api/v1/template/:tid/download/:fileFormat - create an example file to use when issuing credentials in bulk

  - Return the file as a response
##
