## How to authenticate, issue and invalidate tokens

## The problem

This authentication method solves the following questions:

1. How to treat login from multiple sources (server, device, browser, etc)
2. How to make a logout process from one source without logout the user from another
3. How to change the password and invalidate all issued token before the change
4. How to do all of this without a lot of database use and without add latency to the api response

All process will build up from the JWT standard

## Login

The login process is simples:

1. An API call is made with username and password
2. If the user exists, is active and the password is correct, issues an `accessToken` and `refreshToken`
3. Each token has information about `userId` and `loginId` that represents the login request

```mermaid
stateDiagram-v2
direction LR

[*] --> login
state "Auth Service" as auth
auth --> login: accessToken + refreshToken
login --> auth: username + password
state "Auth Database" as database
auth --> database: data exchange
```

## Logout

The logout process is:

1. The endpoint requires an `accessToken`
2. The `loginId` is extracted and added to the cache to mark that the token is now invalid

Once a login request is made, all access and refresh tokens has the same `loginId`. This way a logout process invalidates all access and refresh tokens issued without the need to store each token into database

```mermaid
stateDiagram-v2
direction LR

state "Logout request" as logout_req
state "Logout response" as logout_res

[*] --> logout_req
state "Auth Service" as auth
logout_req --> auth: accessToken

state "Verifies if token was invalidated by logout or password change" as verify
auth --> verify

state is_valid <<choice>>
verify --> is_valid

state "Invalid token" as invalid_token {
    state "The token has already been invalidated and the operation is not allowed" as unauthorized
}

is_valid --> invalid_token

state "Valid token" as valid_token {
    state "Performs the operation and invalidates the token" as invalidate

}

is_valid --> valid_token

invalid_token --> logout_res
valid_token --> logout_res
logout_res --> [*]
```

## Password change

The password change process is:

1. The endpoint requires an `accessToken`
2. The current password is required along with the new one
3. The `userId` is extracted and added to the cache to mark that the user had a password change event
4. The password change timestamp is store at cache
5. A new pair of `accessToken` and `refreshToken` is issued **AFTER** the timestamp stored at cache

With the above process, all tokens issued before the password change timestamp for this user will be invalidated

```mermaid
stateDiagram-v2
direction LR

state "Password change request" as password_req
state "Password change response" as password_res

[*] --> password_req
state "Auth Service" as auth
password_req --> auth: accessToken

state "Verifies if token was invalidated by logout or password change" as verify
auth --> verify

state is_valid <<choice>>
verify --> is_valid

state "Invalid token" as invalid_token {
    state "The token has already been invalidated and the operation is not allowed" as unauthorized
}

is_valid --> invalid_token

state "Valid token" as valid_token {
    state "Invalidate all tokens before this timestamp" as invalidate
    state "Changes the password" as password_change
    invalidate --> password_change

}

is_valid --> valid_token

invalid_token --> password_res
valid_token --> password_res
password_res --> [*]
```

## Refresh token

The refresh token process is:

1. The endpoint requires a `refreshToken`
2. If the user is active, a new `accessToken` is issued

With the above process, a new `accessToken` can be issued without ask the user for username and password

```mermaid
stateDiagram-v2
direction LR

state "Refresh token request" as refresh_req
state "Refresh token response" as refresh_res

[*] --> refresh_req
state "Auth Service" as auth
refresh_req --> auth: accessToken

state "Verifies if token was invalidated by logout or password change" as verify
auth --> verify

state is_valid <<choice>>
verify --> is_valid

state "Invalid token" as invalid_token {
    state "The token has already been invalidated and the operation is not allowed" as unauthorized
}

is_valid --> invalid_token

state "Valid token" as valid_token {
    state "Issue new access token" as invalidate
}

is_valid --> valid_token

invalid_token --> refresh_res
valid_token --> refresh_res
refresh_res --> [*]
```

## API calls

All secure API calls requires the `accessToken` to perform authentication within the steps:

1. Extract `userId` and `loginId` from `accessToken`
2. Verifies if `loginId` is not present at the list of performed logout
3. Verifies if `userId` is not into the cached list of password changed users. If it is, verifies if the token was issued after the password change event.
4. If all the above applies, accept the request

The algorithm is present in the following diagrams:

#### JWT validation

```mermaid
stateDiagram-v2
direction LR

classDef unauthorized_style fill:red,font-weight:bold,stroke-width:2px,stroke:yellow
classDef rest_req_res fill:yellow,color:black,font-weight:bold,stroke-width:2px,stroke:black
classDef transfer_state fill:#661ae6,color:white,font-weight:bold,stroke-width:2px,stroke:white

state "Unauthorized" as unauthorized
class unauthorized unauthorized_style

state "REST API request" as api_call
api_call:::rest_req_res

state "REST API Response" as response
response:::rest_req_res

[*] --> api_call

state "JWT Validation" as jwt_validation {
    [*] --> common_jwt
    state "Performs all common JWT validations (signature, timestamp, ...)" as common_jwt
    state "Verifies if the token has the correct structure (all required fields are presents)" as payload_structure
    common_jwt --> payload_structure
    payload_structure --> [*]
}

api_call --> jwt_validation
state jwt_is_valid <<choice>>
jwt_validation --> jwt_is_valid

state "Logout verification" as logout
logout:::transfer_state

jwt_is_valid --> logout: Token has passed JWT validation
jwt_is_valid --> unauthorized: Token has not passed JWT validation
unauthorized --> response

response --> [*]
```

#### Logout verification

```mermaid
stateDiagram-v2
direction LR

classDef unauthorized_style fill:red,font-weight:bold,stroke-width:2px,stroke:yellow
classDef authorized_style fill:green,font-weight:bold,stroke-width:2px,stroke:yellow
classDef rest_req_res fill:yellow,color:black,font-weight:bold,stroke-width:2px,stroke:black
classDef transfer_state fill:#661ae6,color:white,font-weight:bold,stroke-width:2px,stroke:white

state "Unauthorized" as unauthorized
class unauthorized unauthorized_style

state "Logout verification" as logout {
    state "Extract userId and loginId from accessToken" as logout_extraction
    state "Verify if the combination of userId with loginId is marked in cache as invalid" as logout_verification
    [*] --> logout_extraction
    logout_extraction --> logout_verification
    state has_logout_event <<choice>>
    logout_verification --> has_logout_event
    state "Invalid token" as logout_invalid_token
    state "Valid token" as logout_valid_token
    has_logout_event --> logout_invalid_token: combination marked as invalid
    has_logout_event --> logout_valid_token: combination not present in cache
    logout_invalid_token --> [*]
    logout_valid_token --> [*]
}
class logout_invalid_token unauthorized_style
class logout_valid_token authorized_style

[*] --> logout

state logout_is_valid <<choice>>
logout --> logout_is_valid
logout_is_valid --> unauthorized: Token has not passed logout verification

state "Password change verification" as password_change
password_change:::transfer_state
logout_is_valid --> password_change: Token has passed logout verification

state "REST API Response" as response
response:::rest_req_res

unauthorized --> response
response --> [*]
```

#### Password change verification

```mermaid
stateDiagram-v2
direction LR

classDef unauthorized_style fill:red,font-weight:bold,stroke-width:2px,stroke:yellow
classDef authorized_style fill:green,font-weight:bold,stroke-width:2px,stroke:yellow
classDef rest_req_res fill:yellow,color:black,font-weight:bold,stroke-width:2px,stroke:black

state "Unauthorized" as unauthorized
class unauthorized unauthorized_style
state "Authorized" as authorized
class authorized authorized_style

state "Password change verification" as password_change {
    state "Extract userId from accessToken" as password_change_extraction
    state "Verify if userId has a password change event" as password_change_event
    [*] --> password_change_extraction
    password_change_extraction --> password_change_event
    state has_password_change_event <<choice>>
    password_change_event --> has_password_change_event
    state "Verify if the current token was issued after the password change event" as issued_token_time
    has_password_change_event --> issued_token_time: has a password change event
    state issued_time <<choice>>
    issued_token_time --> issued_time
    state "As the token was issued after the password change event, it is a valid one" as issued_after_event
    issued_time --> issued_after_event: Issued after the event

    state "Invalid token" as invalid_token
    issued_time --> invalid_token: Issued before the event
    invalid_token --> [*]

    state "Valid token" as valid_token
    issued_after_event --> valid_token
    has_password_change_event --> valid_token: does not have a password change event
    valid_token --> [*]
}
class invalid_token unauthorized_style
class valid_token authorized_style

[*] --> password_change

state password_change_is_valid <<choice>>

password_change --> password_change_is_valid
password_change_is_valid --> unauthorized: Token has not passed password change verification
password_change_is_valid --> authorized: Token has passed password change verification

state "REST API Response" as response

authorized --> response
unauthorized --> response
response --> [*]
class response rest_req_res
```
