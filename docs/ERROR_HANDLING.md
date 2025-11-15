# Error Handling & Permission Management System

## Overview
Complete error handling system with automatic redirects for permission denied (403), server errors (500), rate limiting (429), and 404 responses.

## Error Pages Created

### 1. **403 Forbidden** (`/src/app/forbidden.tsx`)
- **Trigger:** User lacks permission to perform an action
- **UI:** Lock icon, Shield warning box with explanation
- **Actions:** Home, Back buttons
- **Message:** Explains permission denial and suggests contacting administrator

### 2. **404 Not Found** (`/src/app/not-found.tsx`)
- **Trigger:** Route or resource doesn't exist
- **UI:** AlertTriangle icon, clear 404 heading
- **Actions:** Home, Back buttons
- **Message:** Route not found message

### 3. **Generic Error** (`/src/app/error.tsx`)
- **Trigger:** Unhandled exceptions in client components
- **UI:** AlertCircle icon, error message display
- **Actions:** Try Again, Home, Back buttons
- **Message:** Generic error message with error digest ID for debugging

### 4. **500 Server Error** (`/src/app/server-error.tsx`)
- **Trigger:** Server-side errors (500, 502, 503, 504)
- **UI:** ServerCrash icon, orange warning box
- **Actions:** Try Again, Home, Back buttons
- **Message:** Explains server issue and suggests contacting support
- **Support Email:** support@tasknity.work

### 5. **429 Rate Limit** (`/src/app/rate-limit.tsx`)
- **Trigger:** Too many requests in short time
- **UI:** AlertTriangle icon, countdown timer (60 seconds)
- **Actions:** Try Again (disabled until countdown ends), Home, Back buttons
- **Message:** Explains rate limit with automatic retry timer

## API Error Interceptor

### File: `/src/lib/apiClient.ts`
Centralized axios instance with automatic error handling:

```typescript
// Usage in any component:
import apiClient from "@/lib/apiClient";

const response = await apiClient.get("/api/tasks");
```

**Automatic Handling:**
- `403` → Redirects to `/forbidden`
- `404` → Redirects to `/not-found`
- `429` → Redirects to `/rate-limit` with countdown
- `500/502/503/504` → Redirects to `/server-error`
- `401` → Redirects to `/login`
- All errors → Toast notification with error message

### Setup: `/src/components/providers/ApiErrorInterceptorInitializer.tsx`
Initializes the interceptor when app loads (already added to root layout).

## Integration in Root Layout

The API error interceptor is automatically initialized in `/src/app/layout.tsx`:

```tsx
import { ApiErrorInterceptorInitializer } from "@/components/providers/ApiErrorInterceptorInitializer";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          <ApiErrorInterceptorInitializer /> {/* Initializes on mount */}
          {/* Rest of layout */}
        </AppProvider>
      </body>
    </html>
  );
}
```

## How It Works

### Flow Diagram:
```
API Request
    ↓
Response/Error
    ↓
Interceptor checks HTTP Status
    ↓
┌─────────────────────────────────────┐
│ Match Status Code                   │
├─────────────────────────────────────┤
│ 403 → /forbidden                    │
│ 404 → /not-found                    │
│ 429 → /rate-limit (with countdown) │
│ 500-504 → /server-error             │
│ 401 → /login                        │
│ Other → Toast notification          │
└─────────────────────────────────────┘
    ↓
User sees appropriate error page
```

## Usage in Components

### Option 1: Use AppContext (Existing)
Components already using `useApp()` continue to work without changes. Errors are caught and displayed as toasts.

```tsx
import { useApp } from "@/context/AppContext";

export function MyComponent() {
  const { createTask } = useApp();
  
  const handleCreate = async () => {
    try {
      await createTask({ title: "New Task" });
    } catch (error) {
      // Error automatically shows toast + may redirect on 403/500
    }
  };
}
```

### Option 2: Use apiClient Directly
For new components, import apiClient for automatic error handling:

```tsx
import apiClient from "@/lib/apiClient";

export function MyComponent() {
  const handleFetch = async () => {
    try {
      const response = await apiClient.get("/api/tasks");
      // Handle success
    } catch (error) {
      // Error automatically handled by interceptor
      // - Redirects on 403/404/429/500
      // - Shows toast on other errors
    }
  };
}
```

### Option 3: Handle Specific Error in Component
For granular control:

```tsx
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export function MyComponent() {
  const router = useRouter();

  const handleFetch = async () => {
    try {
      const response = await apiClient.get("/api/tasks");
    } catch (error) {
      if (error.response?.status === 403) {
        router.push("/forbidden");
      } else if (error.response?.status === 429) {
        router.push("/rate-limit");
      }
      // Other errors handled by interceptor
    }
  };
}
```

## Status Code Reference

| Code | Error | Page | Action |
|------|-------|------|--------|
| 401 | Unauthorized | /login | Redirect to login |
| 403 | Forbidden | /forbidden | Show permission denied |
| 404 | Not Found | /not-found | Show page not found |
| 429 | Too Many Requests | /rate-limit | Show countdown timer |
| 500 | Server Error | /server-error | Show server error |
| 502 | Bad Gateway | /server-error | Show server error |
| 503 | Service Unavailable | /server-error | Show server error |
| 504 | Gateway Timeout | /server-error | Show server error |

## Testing Error Scenarios

### Test 403 Forbidden:
```typescript
// In any component with admin action
try {
  await apiClient.post("/api/admin/action");
  // If user lacks permission, API returns 403
  // Interceptor redirects to /forbidden
} catch (error) {
  // Error handled
}
```

### Test 429 Rate Limit:
```typescript
// Make rapid consecutive requests
for (let i = 0; i < 100; i++) {
  await apiClient.get("/api/tasks"); // After limit, redirects to /rate-limit
}
```

### Test 500 Server Error:
```typescript
// API server crashes or returns 500
await apiClient.get("/api/tasks");
// Redirects to /server-error
```

## Customization

### Add Custom Error Page:
1. Create new error page in `/src/app/`
2. Update `setupApiErrorInterceptor()` in `/src/lib/apiClient.ts`
3. Add case for your status code

Example:
```typescript
case 503:
  if (router) {
    router.push("/maintenance");
  }
  break;
```

### Customize Toast Messages:
Edit `setupApiErrorInterceptor()` in `/src/lib/apiClient.ts`:

```typescript
case 403:
  if (toast) {
    toast({
      title: "Access Restricted",
      description: "Your account doesn't have permission for this action.",
      variant: "destructive",
    });
  }
  break;
```

### Modify Countdown Timer:
Edit `/src/app/rate-limit.tsx`:

```typescript
const [countdown, setCountdown] = useState(120); // Change from 60 to 120
```

## Support Contact
For server errors (500+), users are directed to:
- Email: support@tasknity.work
- Page: `/server-error`

Update the email address in `/src/app/server-error.tsx` if needed.

## Files Modified/Created

### Created:
- `/src/app/forbidden.tsx` - 403 Forbidden page
- `/src/app/not-found.tsx` - 404 Not Found page
- `/src/app/error.tsx` - Generic error boundary page
- `/src/app/server-error.tsx` - 500 Server Error page
- `/src/app/rate-limit.tsx` - 429 Rate Limit page with countdown
- `/src/lib/apiClient.ts` - Axios instance with interceptor
- `/src/components/providers/ApiErrorInterceptorInitializer.tsx` - Initializer component

### Modified:
- `/src/app/layout.tsx` - Added ApiErrorInterceptorInitializer

## Next Steps

1. ✅ Error pages created
2. ✅ API interceptor set up
3. ✅ Interceptor initialized in root layout
4. **Test error scenarios** - Verify each error page displays correctly
5. **Monitor production** - Check logs for unexpected errors
6. **Collect user feedback** - Refine error messages based on usage
