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

![Login process](./images/auth-login.svg)

## Logout

The logout process is:

1. The endpoint requires an `accessToken`
2. The `loginId` is extracted and added to the cache to mark that the token is now invalid

Once a login request is made, all access and refresh tokens has the same `loginId`. This way a logout process invalidates all access and refresh tokens issued without the need to store each token into database

![Logout process](./images/auth-logout.svg)

## Password change

The password change process is:

1. The endpoint requires an `accessToken`
2. The current password is required along with the new one
3. The `userId` is extracted and added to the cache to mark that the user had a password change event
4. The password change timestamp is store at cache
5. A new pair of `accessToken` and `refreshToken` is issued **after** the timestamp stored at cache

With the above process, all tokens issued before the password change timestamp for this user will be invalidated

![Password change process](./images/auth-password-change.svg)

## Refresh token

The refresh token process is:

1. The endpoint requires a `refreshToken`
2. If the user is active, a new `accessToken` is issued

With the above process, a new `accessToken` can be issued without ask the user for username and password

![Refresh token process](./images/auth-refresh.svg)

## API calls

All secure API calls requires the `accessToken` to authenticate and the verification follows the steps:

1. Extract the `userId` and `loginId` from `accessToken`
2. Verifies if the `loginId` is not into the cached list of logged login requests
3. Verifies if the `userId` is not into the cached list of password changed users
4. If all the above applies, accept the request
