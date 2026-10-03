package io.mytherion.auth.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import org.springframework.http.HttpStatus

// The messages below are matched verbatim by the frontend's `parseErrorMessage` until it
// switches to branching on `code` (MYT-31). Reword them only together with that file.

/** No valid session reached a handler that needs one. Same body as the filter-chain 401. */
class NotAuthenticatedException :
    ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED, ErrorMessages.UNAUTHENTICATED)

/** Login rejected. Never says whether the email or the password was wrong. */
class InvalidCredentialsException :
    ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "Invalid credentials")

/** Credentials are correct, but the account's email address has not been verified yet. */
class EmailNotVerifiedException :
    ApiException(HttpStatus.FORBIDDEN, ErrorCode.EMAIL_NOT_VERIFIED, "Please verify your email before logging in")

class EmailAlreadyInUseException :
    ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_IN_USE, "Email already in use")

class EmailAlreadyVerifiedException :
    ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_VERIFIED, "Email already verified")

class InvalidVerificationTokenException :
    ApiException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_VERIFICATION_TOKEN, "Invalid verification token")

/** 410 rather than 400: the token was valid once and is now permanently gone. */
class VerificationTokenExpiredException :
    ApiException(HttpStatus.GONE, ErrorCode.VERIFICATION_TOKEN_EXPIRED, "Verification token expired")
