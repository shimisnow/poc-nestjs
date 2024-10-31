## How to authenticate, issue and invalidate tokens

## The problem

This authentication method solves the following questions:

1. How to ask the user for username and password only once in a while
2. How to issue new tokens without the username/password information
3. How to treat login from multiples sources (server, device, browser, etc)
4. How to make a logout process from one source without logout the user from another source
5. How to change the password and invalidate all issued token before the change
6. How to do all of this without a lot of database use and without add latency to the api response

All process will build up from the JWT standard

## Login

The login process is simples:

1. An API call is made with username and password
2. If the user exists, is active and the password is correct, issues an `accessToken` and `refreshToken`
3. Each token have information about the `userId` and a `loginId` that represents this login request

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

state "Loggout request" as loggout_req
state "Loggout response" as loggout_res

[*] --> loggout_req
state "Auth Service" as auth
loggout_req --> auth: accessToken

state "Verifies if token was invalidated by loggout or password change" as verify
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

invalid_token --> loggout_res
valid_token --> loggout_res
loggout_res --> [*]
```

## Password change

The password change process is:

1. The endpoint requires an `accessToken`
2. The current password is required along with the new one
3. The `userId` is extracted and added to the cache to mark that the user had a password change event
4. The password change timestamp is store at cache
5. A new pair of `accessToken` and `refreshToken` is issued **after** the timestamp stored at cache

With the above process, all tokens issued before the password change timestamp for this user will be invalidated

```mermaid
stateDiagram-v2
direction LR

state "Password change request" as password_req
state "Password change response" as password_res

[*] --> password_req
state "Auth Service" as auth
password_req --> auth: accessToken

state "Verifies if token was invalidated by loggout or password change" as verify
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

state "Verifies if token was invalidated by loggout or password change" as verify
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

All secure API calls requires the `accessToken` to perform authenticate and the verification within the steps:

1. Extract the `userId` and `loginId` from `accessToken`
2. Verifies if the `loginId` is not present at the list of performed logout
3. Verifies if the `userId` is not into the cached list of password changed users. If it is at the list, verifies if the token was issued after the password change event.
4. If all the above applies, accept the request

The algorithm described above is present in the following diagram:

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

state "REST API request" as api_call
class api_call rest_req_res

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
jwt_is_valid --> unauthorized: Token has not passed JWT validation


state "Loggout verification" as loggout {
    state "Extract userId and loginId from accessToken" as loggout_extraction
    state "Verify if the combination of userId with loginId is marked in cache as invalid" as loggout_verification
    [*] --> loggout_extraction
    loggout_extraction --> loggout_verification
    state has_loggout_event <<choice>>
    loggout_verification --> has_loggout_event
    state "Invalid token" as loggout_invalid_token
    state "Valid token" as loggout_valid_token
    has_loggout_event --> loggout_invalid_token: combination marked as invalid
    has_loggout_event --> loggout_valid_token: combination not present in cache
    loggout_invalid_token --> [*]
    loggout_valid_token --> [*]
}
class loggout_invalid_token unauthorized_style
class loggout_valid_token authorized_style

jwt_is_valid --> loggout: Token has passed JWT validation
state loggout_is_valid <<choice>>
loggout --> loggout_is_valid
loggout_is_valid --> unauthorized: Token has not passed logout verification

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

loggout_is_valid --> password_change: Token has passed logout verification

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
