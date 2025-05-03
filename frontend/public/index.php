<?php
// Simple PHP router for single-page applications
// This file helps when using shared hosting or PHP-based servers

// Get the requested URI
$uri = $_SERVER['REQUEST_URI'];

// Check if requesting a file with an extension (css, js, images, etc.)
if (preg_match('/\.(?:css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/', $uri)) {
    // If it's a static asset, let the server handle it normally
    return false;
} else {
    // For all other requests, serve the index.html file
    $indexFile = __DIR__ . '/index.html';
    
    if (file_exists($indexFile)) {
        // Set proper content type
        header('Content-Type: text/html');
        
        // Output the contents of index.html
        echo file_get_contents($indexFile);
    } else {
        // If index.html doesn't exist, show an error
        header('HTTP/1.1 500 Internal Server Error');
        echo '<h1>Error 500: Internal Server Error</h1>';
        echo '<p>The application index.html file could not be found.</p>';
        echo '<p>Please contact the website administrator.</p>';
    }
    
    // Stop execution
    exit;
}
?>