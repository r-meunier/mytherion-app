package io.mytherion.auth.exception

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import org.springframework.http.HttpStatus

// The frontend's parseErrorMessage matches these messages verbatim until MYT-31: reword together.

class NotAuthenticatedException :
    ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED, ErrorMessages.UNAUTHENTICATED)

class InvalidCredentialsException :
    ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "Invalid credentials")

class EmailNotVerifiedException :
    ApiException(HttpStatus.FORBIDDEN, ErrorCode.EMAIL_NOT_VERIFIED, "Please verify your email before logging in")

class EmailAlreadyInUseException :
    ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_IN_USE, "Email already in use")

class EmailAlreadyVerifiedException :
    ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_VERIFIED, "Email already verified")

class InvalidVerificationTokenException :
    ApiException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_VERIFICATION_TOKEN, "Invalid verification token")

class VerificationTokenExpiredException :
    ApiException(HttpStatus.GONE, ErrorCode.VERIFICATION_TOKEN_EXPIRED, "Verification token expired")
