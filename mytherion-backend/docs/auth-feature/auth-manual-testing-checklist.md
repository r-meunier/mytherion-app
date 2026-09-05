# Authentication Manual Testing Checklist

> **Historical record.** Vocabulary predates [`terminology.md`](../../docs/terminology.md):
> "Entity" = Codex Entry, "Component" = Entry Section, "World" = Project.
> Category was removed in MYT-81.


This checklist guides you through manually testing all authentication features. Check off each item as you complete it.

---

## Pre-Testing Setup

### Environment Check

- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:3001`
- [ ] Database is accessible
- [ ] Browser DevTools is open (F12)
- [ ] Cookies are cleared for localhost

### Test Data

- [ ] Prepare test email: `test@example.com`
- [ ] Prepare test username: `testuser`
- [ ] Prepare test password: `password123`

---

## 1. User Registration Flow

### Test 1.1: Successful Registration ✅

**Steps:**

1. [ ] Navigate to `http://localhost:3001/register`
2. [ ] Fill in the form:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Confirm Password: `password123`
3. [ ] Click "Register" button

**Expected Results:**

- [ ] Form submits without errors
- [ ] Redirected to home page (`/`)
- [ ] Navbar shows authenticated state:
  - [ ] Username displayed: "testuser"
  - [ ] "Profile", "Settings", and "Logout" buttons visible
  - [ ] "Login" button NOT visible
- [ ] Cookie `mytherion_token` is set
  - [ ] Open DevTools → Application → Cookies → `http://localhost:3001`
  - [ ] Cookie has `HttpOnly` flag ✓
  - [ ] Cookie has `SameSite=Strict` ✓

**Notes:**

```
Date/Time: 17/01/2026 21:31
Result: PASS
Issues: None
```

---

### Test 1.2: Registration Validation - Invalid Email ❌

**Steps:**

1. [ ] Navigate to `/register`
2. [ ] Enter invalid email: `notanemail`
3. [ ] Fill other fields correctly
4. [ ] Click "Register"

**Expected Results:**

- [x] Form does NOT submit
- [x] Error message displayed: "Invalid email format"
- [ ] No API request made (check Network tab)

**Notes:**

```
Date/Time: 17/01/2026 21:31
Result: PASS
Issues: None
```

---

### Test 1.3: Registration Validation - Username Too Short ❌

**Steps:**

1. [x] Navigate to `/register`
2. [x] Enter username: `ab` (2 characters)
3. [x] Fill other fields correctly
4. [x] Click "Register"

**Expected Results:**

- [x] Form does NOT submit
- [x] Error message: "Username must be at least 3 characters"

**Notes:**

```
Result: PASS
```

---

### Test 1.4: Registration Validation - Password Too Short ❌

**Steps:**

1. [x] Navigate to `/register`
2. [x] Enter password: `pass123` (7 characters)
3. [x] Fill other fields correctly
4. [x] Click "Register"

**Expected Results:**

- [x] Form does NOT submit
- [x] Error message: "Password must be at least 8 characters"

**Notes:**

```
Result: PASS
```

---

### Test 1.5: Registration Validation - Password Mismatch ❌

**Steps:**

1. [x] Navigate to `/register`
2. [x] Enter password: `password123`
3. [x] Enter confirm password: `password456`
4. [x] Fill other fields correctly
5. [x] Click "Register"

**Expected Results:**

- [x] Form does NOT submit
- [x] Error message: "Passwords do not match"

**Notes:**

```
Result: PASS
```

---

### Test 1.6: Registration - Duplicate Email ❌

**Steps:**

1. [x] Register a user with email `test@example.com` (if not already done)
2. [x] Logout
3. [x] Try to register again with same email `test@example.com`

**Expected Results:**

- [x] API returns error
- [x] Error message displayed in form
- [x] User remains on registration page
- [x] No redirect occurs

**Notes:**

```
Result: PASS
Error Message:
 - On PC web browser (Vivaldi): {"status":400,"error":"Bad Request","message":"Email already in use","timestamp":"2026-01-17T20:37:12.288033500Z"}
 - On Android web browser (Vivaldi): "Failed to fetch"
```

---

## 2. User Login Flow

### Test 2.1: Successful Login ✅

**Prerequisites:** User account exists (email: `test@example.com`, password: `password123`)

**Steps:**

1. [x] Navigate to `http://localhost:3001/login`
2. [x] Enter email: `test@example.com`
3. [x] Enter password: `test12345`
4. [x] Click "Login"

**Expected Results:**

- [x] Form submits successfully
- [x] Redirected to home page (`/`)
- [x] Navbar shows authenticated state with username
- [x] Cookie `mytherion_token` is set
- [x] Cookie has security flags (HttpOnly, SameSite=Strict)

**Notes:**

```
Date/Time: 17/01/2026 21:41
Result: PASS
```

---

### Test 2.2: Login - Invalid Credentials ❌

**Steps:**

1. [x] Navigate to `/login`
2. [ ] Enter email: `test@example.com`
3. [ ] Enter password: `wrongpassword`
4. [ ] Click "Login"

**Expected Results:**

- [x] API returns error
- [-] Error message displayed: "Invalid credentials"
- [x] User remains on login page
- [x] No cookie is set

**Notes:**

```
Date/Time: 17/01/2026 21:42
Result: PASS
Error Message:
 - On PC web browser (Vivaldi): {"status":400,"error":"Bad Request","message":"Invalid credentials","timestamp":"2026-01-17T20:42:41.960325200Z"}
 - On Android web browser (Vivaldi): "Failed to fetch"
```

---

### Test 2.3: Login - Non-existent User ❌

**Steps:**

1. [x] Navigate to `/login`
2. [x] Enter email: `nonexistent@example.com`
3. [x] Enter password: `password123`
4. [x] Click "Login"

**Expected Results:**

- [x] API returns error
- [-] Error message: "Invalid credentials" (generic for security)
- [x] No cookie is set

**Notes:**

```
Date/Time: 17/01/2026 21:42
Result: PASS
Error Message:
 - On PC web browser (Vivaldi): {"status":400,"error":"Bad Request","message":"Invalid credentials","timestamp":"2026-01-17T20:43:56.211848800Z"}
 - On Android web browser (Vivaldi): "Failed to fetch"
```

---

### Test 2.4: Login Validation - Empty Fields ❌

**Steps:**

1. [x] Navigate to `/login`
2. [x] Leave email and password empty
3. [x] Click "Login"

**Expected Results:**

- [x] Form does NOT submit
- [x] Validation errors shown for both fields
- [x] No API request made

**Notes:**

```
Result: PASS
```

---

## 3. Session Persistence & Authentication State

### Test 3.1: Session Persistence on Page Refresh ✅

**Prerequisites:** User is logged in

**Steps:**

1. [x] Login successfully
2. [x] Verify navbar shows authenticated state
3. [x] Refresh the page (F5 or Ctrl+R)

**Expected Results:**

- [x] User remains authenticated after refresh
- [x] Navbar still shows username and authenticated buttons
- [x] Redux state is rehydrated via `/api/auth/me` call
- [x] Cookie persists across refresh

**Technical Verification:**

- [x] Check Network tab: `/api/auth/me` request is made on page load
- [x] Request includes cookie automatically
- [x] Response returns user info

**Notes:**

```
Result: PASS
```

---

### Test 3.2: Session Persistence Across Browser Tabs ✅

**Prerequisites:** User is logged in

**Steps:**

1. [x] Login in Tab 1
2. [x] Open new tab (Tab 2)
3. [x] Navigate to `http://localhost:3001` in Tab 2

**Expected Results:**

- [x] User is authenticated in Tab 2
- [x] Navbar shows authenticated state
- [x] Cookie is shared across tabs

**Notes:**

```
Result: PASS
```

---

### Test 3.3: Unauthenticated State on Fresh Visit ✅

**Prerequisites:** No cookies set (clear browser data)

**Steps:**

1. [x] Clear all cookies for localhost
2. [x] Navigate to `http://localhost:3001`

**Expected Results:**

- [x] Navbar shows "Login" button
- [x] No username displayed
- [x] "Profile", "Settings", "Logout" buttons NOT visible
- [x] Redux state: `isAuthenticated = false`, `user = null`

**Notes:**

```
Result: PASS
```

---

## 4. Logout Flow

### Test 4.1: Successful Logout ✅

**Prerequisites:** User is logged in

**Steps:**

1. [ ] Click "Logout" button in navbar

**Expected Results:**

- [x] User is redirected to `/login` page
- [x] Cookie `mytherion_token` is cleared
  - [x] Check DevTools: Cookie should be deleted or have Max-Age=0
- [x] Redux state updated: `isAuthenticated = false`, `user = null`

**Notes:**

```
Result: PASS
```

---

### Test 4.2: Logout Clears Session Completely ✅

**Prerequisites:** User is logged in

**Steps:**

1. [x] Logout
2. [x] Navigate to home page (`/`)

**Expected Results:**

- [x] User is NOT authenticated
- [x] Navbar shows unauthenticated state
- [x] No cookie present

**Notes:**

```
Result: PASS
```

---

## 5. Navigation & Routing

### Test 5.1: Login to Register Navigation ✅

**Steps:**

1. [x] Navigate to `/login`
2. [x] Click "Register here" link

**Expected Results:**

- [x] Redirected to `/register` page
- [x] Registration form is displayed

**Notes:**

```
Result: PASS
```

---

### Test 5.2: Register to Login Navigation ✅

**Steps:**

1. [x] Navigate to `/register`
2. [x] Click "Login here" link

**Expected Results:**

- [x] Redirected to `/login` page
- [x] Login form is displayed

**Notes:**

```
Result: PASS
```

---

### Test 5.3: Unauthenticated User Clicks Login Button ✅

**Steps:**

1. [x] Ensure logged out
2. [x] Navigate to home page
3. [x] Click "Login" button in navbar

**Expected Results:**

- [x] Redirected to `/login` page

**Notes:**

```
Result: PASS
```

---

## 6. Security Features

### Test 6.1: Cookie Security Flags ✅

**Prerequisites:** User is logged in

**Steps:**

1. [ ] Open DevTools → Application → Cookies
2. [ ] Inspect `mytherion_token` cookie

**Expected Results:**

- [x] `HttpOnly` flag is set (prevents JavaScript access)
- [x] `SameSite` is set to `Strict` (CSRF protection)
- [-] `Secure` flag is `false` (development) - should be `true` in production
- [x] `Path` is `/`
- [?] `Max-Age` matches JWT expiration --> maxAge = 2026-01-17T21:53:46.870Z

**Notes:**

```
Result: PASS
Cookie Details: mytherion_token=eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI1MyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzY4NjgzMjI2LCJleHAiOjE3Njg2ODY4MjZ9.JLuB1Mbn0RQv7SBzaPbmlVduTlzpPxh2YqPX_F96kyJCq1iEzF9ceD8mgqPdsbAy
```

---

### Test 6.2: Cookie Inaccessible to JavaScript ✅

**Prerequisites:** User is logged in

**Steps:**

1. [x] Open browser console
2. [x] Try to access cookie: `document.cookie`

**Expected Results:**

- [x] `mytherion_token` is NOT visible in `document.cookie` output
- [x] HttpOnly flag prevents JavaScript access

**Notes:**

```
Result: PASS
Console Output: ''
```

---

### Test 6.3: Password Not Exposed in Response ✅

**Steps:**

1. [x] Register or login
2. [x] Check Network tab → Response body

**Expected Results:**

- [x] Response contains: `id`, `email`, `username`, `role`
- [x] Response does NOT contain: `password`, `passwordHash`, or JWT token
- [x] JWT is only in `Set-Cookie` header

**Notes:**

```
Result: PASS
```

---

## 7. UI/UX Testing

### Test 7.1: Loading States ✅

**Steps:**

1. [x] Submit login or register form
2. [x] Observe button during API request

**Expected Results:**

- [x] Button text changes to "Logging in..." or "Creating account..."
- [-] Button is disabled during request
- [-] Form fields are disabled during request
- [x] Loading state ends after response

**Notes:**

```
Result: FAIL
```

---

### Test 7.2: Form Field Clearing on Error ✅

**Steps:**

1. [x] Enter invalid credentials
2. [x] Submit form
3. [x] Correct the error
4. [x] Type in the field

**Expected Results:**

- [x] Validation error clears when user starts typing
- [x] API error remains until form is resubmitted

**Notes:**

```
Result: PASS
```

---

### Test 7.3: Responsive Design ✅

**Steps:**

1. [x] Test on different screen sizes (mobile, tablet, desktop)
2. [x] Use DevTools responsive mode

**Expected Results:**

- [x] Forms are centered and readable on all sizes
- [?] Navbar adapts to screen size --> RESULT: no navbar visible on login/register pages
- [x] No horizontal scrolling
- [x] Touch-friendly on mobile

**Notes:**

```
Result: PASS (?)
Screen Sizes Tested: iPad Pro, iPhone SE, iPhone 14 Pro
```

---

## Test Summary

### Results Overview

| Category            | Tests  | Passed     | Failed     | Notes |
| ------------------- | ------ | ---------- | ---------- | ----- |
| Registration        | 6      | \_\_\_     | \_\_\_     |       |
| Login               | 4      | \_\_\_     | \_\_\_     |       |
| Session Persistence | 3      | \_\_\_     | \_\_\_     |       |
| Logout              | 2      | \_\_\_     | \_\_\_     |       |
| Navigation          | 3      | \_\_\_     | \_\_\_     |       |
| Security            | 3      | \_\_\_     | \_\_\_     |       |
| UI/UX               | 3      | \_\_\_     | \_\_\_     |       |
| **TOTAL**           | **24** | **\_\_\_** | **\_\_\_** |       |

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
- Clear cookies between test runs for accurate results

---

## Related Documents

- [Test Plan](file:///C:/Users/gramy/.gemini/antigravity/brain/043d2fb9-ea22-4066-972c-b41d8cfeaa48/test_plan.md)
- [Future Features](file:///d:/Documents/Web%20Dev/mytherion/docs/auth-future-features.md)
