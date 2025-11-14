# Frontend Deployment Guide

## Environment Variables

### Required GitHub Secret

- `VITE_API_BASE_URL` - **MUST be HTTPS in production**
  - Example: `https://api.sixpine.in/api`
  - **DO NOT use HTTP** - This will cause mixed content errors
  - **DO NOT use placeholder values** like `http://your-production-api.com`

## Common Issues

### Mixed Content Error

If you see an error like:
```
Mixed Content: The page at 'https://sixpine.in/vendor/login' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://your-production-api.com/api/auth/vendor/login/'. 
This request has been blocked; the content must be served over HTTPS.
```

**Solution:**
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Find `VITE_API_BASE_URL` secret
3. Update it to use **HTTPS**:
   ```
   https://api.sixpine.in/api
   ```
4. Re-run the deployment workflow

### Important Notes

- The `VITE_API_BASE_URL` must start with `https://` (not `http://`)
- The URL should include the `/api` path at the end
- Example format: `https://your-api-domain.com/api`
- Never use placeholder values in production

## Verification

After deployment, check the browser console. The API requests should go to:
- ✅ `https://api.sixpine.in/api/...` (correct)
- ❌ `http://your-production-api.com/api/...` (wrong - placeholder)
- ❌ `http://api.sixpine.in/api/...` (wrong - HTTP instead of HTTPS)

