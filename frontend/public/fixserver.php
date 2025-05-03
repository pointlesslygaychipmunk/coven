<?php
// Server diagnostics and fix script
// Place this file at the root of your web hosting to diagnose issues

// Set proper content type
header('Content-Type: text/html');

// Check if this script can run
$canExecute = true;

// Server information
$serverInfo = [
    'PHP Version' => phpversion(),
    'Server Software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'Document Root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'Server Name' => $_SERVER['SERVER_NAME'] ?? 'Unknown',
    'Request URI' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
    'Script Filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
];

// Check if index.html exists
$indexHtmlExists = file_exists(__DIR__ . '/index.html');
$indexHtmlContent = $indexHtmlExists ? substr(file_get_contents(__DIR__ . '/index.html'), 0, 500) . '...' : 'File not found';

// File permissions
$permissions = [];
$commonFiles = ['index.html', 'index.php', '.htaccess', 'assets'];
foreach ($commonFiles as $file) {
    $fullPath = __DIR__ . '/' . $file;
    if (file_exists($fullPath)) {
        $perms = fileperms($fullPath);
        $permissions[$file] = substr(sprintf('%o', $perms), -4);
    } else {
        $permissions[$file] = 'File not found';
    }
}

// Directory listing
$dirListing = [];
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        $dirListing[] = $file . (is_dir(__DIR__ . '/' . $file) ? ' (directory)' : ' (file)');
    }
}

// Create a simple .htaccess file if it doesn't exist
$htaccessContent = <<<EOT
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOT;

$htaccessPath = __DIR__ . '/.htaccess';
$htaccessExists = file_exists($htaccessPath);
$htaccessWritable = is_writable(__DIR__);

// Handle fixing the .htaccess
$htaccessMessage = '';
if (isset($_GET['fix_htaccess']) && $_GET['fix_htaccess'] == 'yes') {
    if ($htaccessWritable) {
        file_put_contents($htaccessPath, $htaccessContent);
        $htaccessMessage = 'Created or updated .htaccess file successfully!';
        $htaccessExists = true;
    } else {
        $htaccessMessage = 'Could not write .htaccess file. Directory is not writable.';
    }
}

// Handle creating minimal index.html
$indexMessage = '';
if (isset($_GET['create_index']) && $_GET['create_index'] == 'yes') {
    $minimalIndexContent = <<<EOT
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Witch's Coven</title>
  <style>
    body {
      background-color: #1e1724;
      color: #d0c8b0;
      font-family: 'Courier New', monospace;
      text-align: center;
      padding: 50px;
    }
    h1 {
      color: #4a2c6f;
    }
    a {
      color: #7b4dab;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Witch's Coven</h1>
  <p>Minimal index page for server testing.</p>
  <p><a href="/emergency.html">Go to emergency page</a></p>
</body>
</html>
EOT;
    
    if (is_writable(__DIR__)) {
        file_put_contents(__DIR__ . '/index.html', $minimalIndexContent);
        $indexMessage = 'Created minimal index.html successfully!';
        $indexHtmlExists = true;
        $indexHtmlContent = substr($minimalIndexContent, 0, 500) . '...';
    } else {
        $indexMessage = 'Could not write index.html. Directory is not writable.';
    }
}

// Output the diagnostics page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Diagnostics - Witch's Coven</title>
    <style>
        body {
            font-family: sans-serif;
            background-color: #27224a;
            color: #e2dbff;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: #2a2545;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        h1, h2, h3 {
            color: #c1b3ff;
        }
        pre {
            background-color: #1f1a38;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            color: #a39cc5;
        }
        .section {
            margin-bottom: 30px;
            border-bottom: 1px solid #695e9e;
            padding-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #695e9e;
        }
        th {
            background-color: #1f1a38;
        }
        .actions {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4a3674;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .btn:hover {
            background-color: #7952b8;
        }
        .message {
            background-color: #643b68;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Server Diagnostics - Witch's Coven</h1>
        <p>This script helps diagnose server issues with your single-page application deployment.</p>
        
        <?php if ($htaccessMessage): ?>
        <div class="message"><?php echo $htaccessMessage; ?></div>
        <?php endif; ?>
        
        <?php if ($indexMessage): ?>
        <div class="message"><?php echo $indexMessage; ?></div>
        <?php endif; ?>
        
        <div class="section">
            <h2>Server Information</h2>
            <table>
                <?php foreach ($serverInfo as $key => $value): ?>
                <tr>
                    <th><?php echo htmlspecialchars($key); ?></th>
                    <td><?php echo htmlspecialchars($value); ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
        
        <div class="section">
            <h2>File Status</h2>
            <h3>index.html</h3>
            <p>Status: <?php echo $indexHtmlExists ? 'Found' : 'Not Found'; ?></p>
            <?php if ($indexHtmlExists): ?>
            <pre><?php echo htmlspecialchars($indexHtmlContent); ?></pre>
            <?php endif; ?>
            
            <h3>.htaccess</h3>
            <p>Status: <?php echo $htaccessExists ? 'Found' : 'Not Found'; ?></p>
            <?php if ($htaccessExists): ?>
            <pre><?php echo htmlspecialchars(file_get_contents($htaccessPath)); ?></pre>
            <?php else: ?>
            <p>Recommended .htaccess content:</p>
            <pre><?php echo htmlspecialchars($htaccessContent); ?></pre>
            <?php endif; ?>
        </div>
        
        <div class="section">
            <h2>Directory Listing</h2>
            <ul>
                <?php foreach ($dirListing as $item): ?>
                <li><?php echo htmlspecialchars($item); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
        
        <div class="section">
            <h2>File Permissions</h2>
            <table>
                <?php foreach ($permissions as $file => $perm): ?>
                <tr>
                    <th><?php echo htmlspecialchars($file); ?></th>
                    <td><?php echo htmlspecialchars($perm); ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
        
        <div class="section">
            <h2>Fix Options</h2>
            <div class="actions">
                <?php if (!$htaccessExists): ?>
                <a href="?fix_htaccess=yes" class="btn">Create .htaccess</a>
                <?php endif; ?>
                
                <?php if (!$indexHtmlExists): ?>
                <a href="?create_index=yes" class="btn">Create Minimal Index.html</a>
                <?php endif; ?>
                
                <a href="/" class="btn">Go to Home Page</a>
                <a href="/emergency.html" class="btn">Go to Emergency Page</a>
            </div>
        </div>
    </div>
</body>
</html>