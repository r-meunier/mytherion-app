# Email Verification Manual Testing Checklist

> **Historical record.** Vocabulary predates [`terminology.md`](../../docs/terminology.md):
> "Entity" = Codex Entry, "Component" = Entry Section, "World" = Project.
> Category was removed in MYT-81.


This checklist guides you through manually testing the email verification feature. Check off each item as you complete it.

---

## Pre-Testing Setup

### Environment Check

- [x] Backend is running on `http://localhost:8080`
- [x] Frontend is running on `http://localhost:3001`
- [x] MailHog is running on `http://localhost:8025`
- [x] Database is accessible
- [x] Browser DevTools is open (F12)
- [x] Cookies are cleared for localhost

### Test Data

- [x] Prepare test email: `test@example.com`
- [x] Prepare test username: `test`
- [x] Prepare test password: `pass12345`

---

## 1. Registration with Email Verification

### Test 1.1: Successful Registration Shows "Check Your Email" ✅

**Steps:**

1. [x] Navigate to `http://localhost:3001/register`
2. [x] Fill in the form:
   - Email: `test@example.com`
   - Username: `test`
   - Password: `pass12345`
   - Confirm Password: `pass12345`
3. [x] Click "Register" button

**Expected Results:**

- [x] Form submits without errors
- [x] "Check Your Email!" page is displayed
- [x] Shows the registered email address
- [x] Warning message: "You must verify your email before you can log in"
- [x] "Go to Login" button is visible
- [x] User is NOT logged in (no cookie set)
  - [x] Check DevTools → Application → Cookies
  - [x] `mytherion_token` cookie should NOT exist

**Notes:**

```
Date/Time: 18 Jan 2026 14:56:29
Result: PASS
Issues: None
```

---

### Test 1.2: Registration Does Not Auto-Login ✅

**Steps:**

1. [x] Complete registration (Test 1.1)
2. [x] Check authentication state

**Expected Results:**

- [x] No `mytherion_token` cookie is set
- [x] User cannot access protected routes
- [x] Navbar shows unauthenticated state (if visible)

**Notes:**

```
Result: PASS
```

---

## 2. Email Delivery

### Test 2.1: Verification Email Received in MailHog ✅

**Steps:**

1. [x] Complete registration
2. [x] Open MailHog UI at `http://localhost:8025`
3. [x] Check for new email

**Expected Results:**

- [x] Email appears in MailHog inbox
- [x] From: `noreply@mytherion.local` (or configured sender)
- [x] To: `test@example.com`
- [x] Subject: "Verify Your Email - Mytherion"
- [x] Email received within 2 seconds of registration

**Notes:**

```
Result: PASS
Email Delivery Time: <1 second
```

---

### Test 2.2: Email Content and Formatting ✅

**Steps:**

1. [x] Open the verification email in MailHog
2. [x] Click "HTML" tab to view rendered email
3. [x] Inspect email content

**Expected Results:**

- [x] Professional HTML formatting with gradient design
- [-] Welcome message with username --> RESULT: no username is shown
- [x] Clear "Verify Email Address" button
- [x] Verification link also shown as plain text
- [x] Expiration warning: "This link will expire in 24 hours"
- [-] Mytherion branding/logo (if implemented) --> RESULT: not yet implemented

**Notes:**

```
Result: PASS
Visual Quality: Good quality, but missing username and logo
```

---

### Test 2.3: Verification Link Format ✅

**Steps:**

1. [x] In MailHog, view email source or inspect link
2. [x] Check verification link format

**Expected Results:**

- [?] Link format: `http://localhost:3001/verify-email?token=<UUID>` --> RESULT: button-link: http://localhost:3001/verify-email?token=3Debbd7=
  dd8-cb2e-4e9f-a545-4b42af2cb6d5 / text-link: http://localhost:3001/verify-email?toke=
  n=3Debbd7dd8-cb2e-4e9f-a545-4b42af2cb6d5
- [?] Token is a valid UUID (36 characters with hyphens)
- [x] Link is clickable --> RESULT: button is clickable
- [?] No encoding issues (quoted-printable is normal in source)

**Notes:**

```
Result: FAIL
Token Format: ?toke=
n=3Debbd7dd8-cb2e-4e9f-a545-4b42af2cb6d
```

---

## 3. Email Verification Flow

### Test 3.1: Verify Email with Valid Token ✅

**Steps:**

1. [x] Register new user
2. [x] Open MailHog and find verification email
3. [x] Click "Verify Email Address" button in email

**Expected Results:**

- [x] Redirected to `/verify-email?token=xxx`
- [x] Shows "Verifying Email..." loading spinner
- [x] Changes to "✓ Email Verified!" success message
- [x] Green checkmark icon displayed
- [x] Success message: "Email verified successfully!"
- [x] Auto-redirects to home page after 3 seconds
- [x] Database: User's `email_verified` = `true`

**Technical Verification:**

- [x] Check Network tab: `POST /api/auth/verify-email?token=xxx`
- [x] Response status: 200 OK
- [x] Response includes user with `emailVerified: true`

**Notes:**

```
Result: PASS
Redirect Time: 3s
```

---

### Test 3.2: Verify Email with Invalid Token ❌

**Steps:**

1. [x] Navigate to `/verify-email?token=invalid-token-123`

**Expected Results:**

- [x] Shows "✗ Verification Failed" error state
- [x] Red X icon displayed
- [x] User-friendly error message (not raw backend error)
- [x] "Go to Login" button visible
- [x] No auto-redirect

**Technical Verification:**

- [x] Network tab: `POST /api/auth/verify-email?token=invalid-token-123`
- [x] Response status: 400 Bad Request
- [x] Error message is user-friendly

**Notes:**

```
Result: PASS
Error Message: This verification link is invalid. Please request a new verification email.
```

---

### Test 3.3: Verify Email with Expired Token ❌

**Prerequisites:** Create a token manually in database with `expires_at` in the past, or wait 24 hours

**Steps:**

1. [x] Use expired verification token
2. [x] Click verification link

**Expected Results:**

- [x] Shows "✗ Verification Failed" error
- [x] Error message: "This verification link has expired..."
- [x] Suggests requesting new verification email
- [x] "Go to Login" button visible

**Notes:**

```
Result: PASS
Error Message: This verification link has expired. Please request a new verification email.
Feature suggestions: Add button to page + email to request new verification email because currently it's not possible to reverify the email
```

---

### Test 3.4: Verify Already Verified Email ❌

**Steps:**

1. [x] Verify email successfully (Test 3.1)
2. [x] Click the same verification link again

**Expected Results:**

- [x] Shows error message
- [x] Error: "Your email has already been verified..."
- [x] Suggests logging in
- [x] No database changes

**Notes:**

```
Result: PASS
```

---

### Test 3.5: Error State Clears on Navigation ✅

**Steps:**

1. [x] Trigger verification error (invalid token)
2. [x] Click "Go to Login" button
3. [x] Navigate to login page

**Expected Results:**

- [x] Error message does NOT persist on login page
- [x] Redux error state is cleared
- [x] Clean login form displayed

**Notes:**

```
Result: PASS
```

---

## 4. Login with Email Verification

### Test 4.1: Login with Unverified Email Blocked ❌

**Steps:**

1. [x] Register new user (do NOT verify email)
2. [x] Navigate to `/login`
3. [x] Enter credentials:
   - Email: `test3@test3.com`
   - Password: `test12345`
4. [x] Click "Login"

**Expected Results:**

- [x] Login FAILS with error
- [x] Error message: "Please verify your email address before logging in..."
- [x] User-friendly error (not raw backend message)
- [x] No cookie is set
- [x] User remains on login page

**Technical Verification:**

- [x] Network tab: `POST /api/auth/login`
- [x] Response status: 400 Bad Request
- [x] No `Set-Cookie` header

**Notes:**

```
Result: PASS
Error Message: Please verify your email address before logging in. Check your inbox for the verification email.
```

---

### Test 4.2: Login with Verified Email Succeeds ✅

**Steps:**

1. [x] Register and verify email (Tests 1.1 and 3.1)
2. [x] Navigate to `/login`
3. [x] Enter credentials
4. [x] Click "Login"

**Expected Results:**

- [x] Login succeeds
- [x] Redirected to home page
- [X/-] Cookie `mytherion_token` is set --> RESULT: Set-Cookie header is present TWICE
- [x] User is authenticated
- [x] Navbar shows authenticated state

**Notes:**

```
Result: PASS ?
```

---

## 5. Resend Verification Email

### Test 5.1: Resend Verification Email ✅

**Steps:**

1. [x] Register user (do NOT verify)
2. [x] Note: Currently requires manual API call or future UI implementation
3. [x] Send POST request to `/api/auth/resend-verification?email=test3@test3.com`

**Expected Results:**

- [x] Response status: 204 No Content
- [x] New email appears in MailHog
- [x] New verification token generated
- [x] Old token is invalidated/deleted --> RESULT: Old token is removed from DB

**Technical Verification:**

- [x] Check database: Old token should be deleted
- [x] New token exists with new `created_at` timestamp
- [x] New token has 24-hour expiration

**Notes:**

```
Result: PASS
Method Used: Manual API call with POST to `/api/auth/resend-verification?email=test3@test3.com`; manual DB check
```

---

### Test 5.2: Resend for Already Verified User ❌

**Steps:**

1. [x] Verify email successfully
2. [x] Try to resend verification email
3. [x] Send POST to `/api/auth/resend-verification?email=test@example.com`

**Expected Results:**

- [x] Response status: 400 Bad Request
- [x] Error message: "Email already verified"
- [x] No email sent

**Notes:**

```
Result: PASS
```

---

### Test 5.3: Resend for Non-existent Email ❌

**Steps:**

1. [x] Send POST to `/api/auth/resend-verification?email=nonexistent@example.com`

**Expected Results:**

- [x] Response status: 400 Bad Request
- [x] Error message: "User not found" (or generic for security)
- [x] No email sent

**Notes:**

```
Result: PASS
```

---

### Test 5.4: Resend Endpoint is Public ✅

**Steps:**

1. [x] Ensure NOT logged in (no cookie)
2. [x] Send resend verification request

**Expected Results:**

- [x] Request succeeds without authentication
- [x] No 401 Unauthorized error
- [x] Email is sent

**Notes:**

```
Result: PASS
```

---

## 6. Error Message Quality

### Test 6.1: User-Friendly Error Messages ✅

**Steps:**

1. [x] Trigger various errors:
   - Invalid token
   - Expired token
   - Already verified
   - Unverified login attempt

**Expected Results:**

- [x] All errors show user-friendly messages
- [x] No raw backend stack traces
- [x] No technical jargon
- [x] Clear actionable guidance
- [x] Consistent error formatting

**Notes:**

```
Result: PASS
Sample Error Messages:
1. Please verify your email address before logging in. Check your inbox for the verification email.
2. This verification link has expired. Please request a new verification email.
3. Your email has already been verified. You can now log in.
```

---

### Test 6.2: Error Persistence Prevention ✅

**Steps:**

1. [x] Trigger error on verify-email page
2. [x] Navigate to login page
3. [x] Navigate to register page

**Expected Results:**

- [ ] Errors do NOT persist across pages
- [ ] Each page starts with clean state
- [x] Redux errors cleared on component mount

**Notes:**

```
Result: PASS
```

---

## 7. Database Verification

### Test 7.1: User Email Verified Flag ✅

**Steps:**

1. [x] Register user
2. [x] Check database before verification
3. [x] Verify email
4. [x] Check database after verification

**Expected Results:**

**Before Verification:**

- [x] `users.email_verified` = `false`

**After Verification:**

- [x] `users.email_verified` = `true`

**SQL Query:**

```sql
SELECT id, email, username, email_verified
FROM users
WHERE email = 'test@example.com';
```

**Notes:**

```
Result: PASS
```

---

### Test 7.2: Verification Token Lifecycle ✅

**Steps:**

1. [x] Register user
2. [x] Check `email_verification_tokens` table
3. [x] Verify email
4. [x] Check table again

**Expected Results:**

**After Registration:**

- [x] Token exists in `email_verification_tokens`
- [x] `verified_at` is NULL
- [x] `expires_at` is 24 hours in future
- [x] Token is valid UUID

**After Verification:**

- [x] `verified_at` is set to current timestamp
- [x] Token still exists (not deleted)

**SQL Query:**

```sql
SELECT token, user_id, created_at, expires_at, verified_at
FROM email_verification_tokens
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

**Notes:**

```
Result: PASS
```

---

## 8. Security Testing

### Test 8.1: Token Uniqueness ✅

**Steps:**

1. [x] Register multiple users
2. [x] Check all verification tokens

**Expected Results:**

- [x] All tokens are unique UUIDs
- [x] No token collisions
- [x] Tokens are cryptographically random

**Notes:**

```
Result: PASS
Tokens Checked: f17d6d74-2028-44ed-9668-5a8876553fe2 / 73bbe03f-d5ba-4a44-8e93-d2d57b85c60b
```

---

### Test 8.2: Token Cannot Be Reused ✅

**Steps:**

1. [x] Verify email with token
2. [x] Try to use same token again

**Expected Results:**

- [x] Second attempt fails
- [x] Error: "Email already verified"
- [x] Token marked as used (`verified_at` set)

**Notes:**

```
Result: PASS
```

---

### Test 8.3: Verification Endpoint is Public ✅

**Steps:**

1. [x] Ensure NOT logged in
2. [x] Access `/api/auth/verify-email?token=xxx`

**Expected Results:**

- [x] Endpoint accessible without authentication
- [x] No 401 Unauthorized error
- [x] Verification works for unauthenticated users

**Notes:**

```
Result: PASS
```

---

## 9. UI/UX Testing

### Test 9.1: Loading States ✅

**Steps:**

1. [x] Click verification link
2. [x] Observe loading state

**Expected Results:**

- [x] Shows "Verifying Email..." message
- [x] Animated spinner displayed
- [x] Professional loading UI
- [x] Loading state transitions smoothly to success/error

**Notes:**

```
Result: PASS
```

---

### Test 9.2: Success State Auto-Redirect ✅

**Steps:**

1. [x] Verify email successfully
2. [x] Wait for auto-redirect

**Expected Results:**

- [x] Success message displayed for 3 seconds
- [x] "Redirecting to home page..." message shown
- [x] Auto-redirects after 3 seconds
- [x] Redirect is smooth (no flash)

**Notes:**

```
Result: PASS
Redirect Timing: 3s
```

---

### Test 9.3: Responsive Design ✅

**Steps:**

1. [x] Test on different screen sizes
2. [x] Use DevTools responsive mode

**Expected Results:**

- [x] Verification page is centered and readable
- [x] Email address wraps properly on mobile
- [x] Buttons are touch-friendly
- [x] No horizontal scrolling
- [x] Icons and text scale appropriately

**Screen Sizes Tested:**

- [x] Mobile (375px)
- [x] Tablet (768px)
- [x] Desktop (1920px)

**Notes:**

```
Result: PASS
```

---

### Test 9.4: Email Template Rendering ✅

**Steps:**

1. [x] View email in MailHog HTML tab
2. [x] Check visual appearance

**Expected Results:**

- [x] Professional gradient design
- [x] Readable fonts and colors
- [x] Button is prominent and clickable
- [x] Link is visible as fallback
- [x] Proper spacing and padding
- [x] No broken images or styles

**Notes:**

```
Result: PASS
Visual Quality Rating: Good
```

---

## 10. Edge Cases

### Test 10.1: Email Case Sensitivity ✅

**Steps:**

1. [x] Register with `Test@Example.COM`
2. [x] Try to resend with `test@example.com`

**Expected Results:**

- [x] Email is normalized to lowercase
- [x] Resend works regardless of case
- [x] Verification works with any case

**Notes:**

```
Result: PASS
```

---

### Test 10.2: Multiple Verification Attempts ✅

**Steps:**

1. [x] Register user
2. [x] Request resend verification multiple times
3. [x] Check MailHog

**Expected Results:**

- [x] Each resend creates new token
- [x] Old tokens are deleted
- [x] Only latest email/token is valid
- [x] Multiple emails appear in MailHog

**Notes:**

```
Result: PASS
```

---

### Test 10.3: Concurrent Verification Attempts ✅

**Steps:**

1. [x] Open verification link in two tabs simultaneously
2. [x] Click verify in both tabs

**Expected Results:**

- [x] First tab succeeds
- [x] Second tab shows "already verified" error
- [x] No database conflicts
- [x] User is verified only once

**Notes:**

```
Result: PASS
```

---

## Test Summary

### Results Overview

| Category                | Tests  | Passed     | Failed     | Notes |
| ----------------------- | ------ | ---------- | ---------- | ----- |
| Registration            | 2      | \_\_\_     | \_\_\_     |       |
| Email Delivery          | 3      | \_\_\_     | \_\_\_     |       |
| Email Verification      | 5      | \_\_\_     | \_\_\_     |       |
| Login with Verification | 2      | \_\_\_     | \_\_\_     |       |
| Resend Verification     | 4      | \_\_\_     | \_\_\_     |       |
| Error Messages          | 2      | \_\_\_     | \_\_\_     |       |
| Database                | 2      | \_\_\_     | \_\_\_     |       |
| Security                | 3      | \_\_\_     | \_\_\_     |       |
| UI/UX                   | 4      | \_\_\_     | \_\_\_     |       |
| Edge Cases              | 3      | \_\_\_     | \_\_\_     |       |
| **TOTAL**               | **30** | **\_\_\_** | **\_\_\_** |       |

### Issues Found

```
1. _______________________________________________
   Severity: Critical / High / Medium / Low
   Steps to Reproduce: _______________________________________________

2. _______________________________________________
   Severity: Critical / High / Medium / Low
   Steps to Reproduce: _______________________________________________

3. _______________________________________________
   Severity: Critical / High / Medium / Low
   Steps to Reproduce: _______________________________________________
```

### Overall Assessment

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Email delivery working correctly
- [ ] Hard enforcement working (unverified users cannot login)
- [ ] Ready for production (with noted limitations)
- [ ] Requires fixes before deployment

**Tester:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***  
**Environment:** Development / Staging / Production  
**Browser:** **\*\***\_\_\_**\*\***  
**OS:** **\*\***\_\_\_**\*\***

---

## Notes

- Mark tests as PASS/FAIL in the checkboxes
- Document any issues immediately
- Take screenshots of failures
- Test in multiple browsers if possible
- Clear cookies and database between test runs for accurate results
- Check MailHog for all email-related tests

---

## Related Documents

- [Email Verification Test Plan](file:///C:/Users/gramy/.gemini/antigravity/brain/043d2fb9-ea22-4066-972c-b41d8cfeaa48/email_verification_test_plan.md)
- [Email Service Provider Guide](file:///d:/Documents/Web%20Dev/mytherion/mytherion-backend/docs/email-service-providers.md)
- [Auth Manual Testing Checklist](file:///d:/Documents/Web%20Dev/mytherion/mytherion-backend/docs/auth-feature/auth-manual-testing-checklist.md)
