# 🔧 CRITICAL FIXES TO APPLY NOW

## Issues Found:

1. **User.ts** - SQL parameter placeholders missing `$` sign in `findByIdAndUpdate`
2. **FlowSession.ts** - Same SQL parameter issue in `create` method
3. **Auth system** - No email verification
4. **Sample data generation** - Failing due to SQL errors

## Fix 1: User Model (backend/src/models/User.ts)

Find line ~92 in `findByIdAndUpdate` method:
```typescript
fields.push(`${snakeKey} = ${paramCount}`);
```

Change to:
```typescript
fields.push(`${snakeKey} = $${paramCount}`);
```

And line ~100:
```typescript
const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ${paramCount} RETURNING *`;
```

Change to:
```typescript
const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
```

## Fix 2: FlowSession Model (backend/src/models/FlowSession.ts)

The `create` method has correct placeholders already, but let me verify the issue is elsewhere.

## Testing After Fixes:

```powershell
# 1. Restart backend
# Stop current backend (Ctrl+C)
cd backend
npm run dev

# 2. Test registration
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

# 3. Test sign in
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/signin" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

$token = $response.token

# 4. Test sample data generation
$body = @{ count = 20 } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/generate-sample-data" `
    -Method Post `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -Body $body `
    -ContentType "application/json"
```

## Apply These Fixes Now:

1. Open `backend/src/models/User.ts`
2. Find line with `fields.push(\`${snakeKey} = ${paramCount}\`);`
3. Add `$` before `${paramCount}` to make it `$${paramCount}`
4. Find line with `WHERE id = ${paramCount}`
5. Add `$` before `${paramCount}` to make it `$${paramCount}`
6. Save file
7. Restart backend

This will fix the SQL parameter issue!
