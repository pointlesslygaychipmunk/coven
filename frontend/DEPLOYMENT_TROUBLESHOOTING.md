# Troubleshooting Server 500 Error on playcoven.com

A 500 Internal Server Error means there's an issue with the web server hosting your application. Here are steps to diagnose and fix this issue:

## Common Causes of 500 Errors

1. **Server Configuration Issues**
   - Incorrect permissions on server files
   - Misconfigured .htaccess file
   - Missing or incorrect server modules/dependencies

2. **Routing Problems**
   - Missing or misconfigured redirect rules
   - Issues with client-side routing vs. server-side routing

3. **Build Problems**
   - Incorrect build output 
   - Missing essential files like index.html

## Immediate Actions

1. **Check Server Logs**
   - Access your hosting provider's control panel
   - Look for error logs to identify the specific cause
   - Common locations: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`

2. **Verify Hosting Configuration**
   - Ensure your hosting is configured for single-page applications (SPAs)
   - Add proper redirect rules for client-side routing

## Configuration Files to Check

### For Apache Servers
Create or update the `.htaccess` file in your deployment directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### For Nginx Servers
Update your site configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### For Netlify
Create a `netlify.toml` file:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### For Vercel
Create a `vercel.json` file:

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Quick Solutions to Try

1. **Create a simple test.html file** in the root directory to check if static files are being served properly:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Server Test</title>
   </head>
   <body>
     <h1>Server is working!</h1>
   </body>
   </html>
   ```

2. **Rebuild with minimal dependencies**:
   - Build a simplified version of your app if possible
   - Start with just the essential files to isolate issues

3. **Check file permissions**:
   - Ensure all files have correct read permissions (typically 644 for files, 755 for directories)
   - Command: `chmod -R 755 [directory]`

4. **Contact your hosting provider**:
   - Share the error logs with them
   - Ask if there are specific configuration requirements for React apps

## Specific to playcoven.com

If you're using a hosting provider that doesn't support client-side routing by default:

1. Try accessing the static emergency page directly: https://playcoven.com/emergency.html
2. If that works, the issue is with routing rather than your files
3. Add the appropriate configuration file from above based on your hosting platform

## For Debugging

You can temporarily modify your build to include server-side error reporting by adding this to your index.html:

```html
<script>
window.onerror = function(message, source, lineno, colno, error) {
  document.body.innerHTML = '<div style="padding:20px;font-family:sans-serif;">' + 
    '<h1>Error Occurred</h1>' +
    '<p>Please share this with the developers:</p>' +
    '<pre style="background:#f5f5f5;padding:10px;overflow:auto;">' + 
    'Message: ' + message + '\n' +
    'Source: ' + source + '\n' +
    'Line: ' + lineno + ', Column: ' + colno + '\n' +
    'Error: ' + (error ? error.stack : 'No stack trace') +
    '</pre></div>';
  return true;
};
</script>
```