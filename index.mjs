import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

export const handler = async (event) => {
  // Extract path from the API Gateway or Function URL event
  let path = event.rawPath || event.path || '/index.html';
  
  if (path === '/') {
    path = '/index.html';
  }

  // Remove leading slash for local file path resolution
  const relativePath = path.startsWith('/') ? path.substring(1) : path;
  const filePath = join(__dirname, relativePath);

  // Check if file exists and is not a directory
  if (!existsSync(filePath)) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: '404 Not Found'
    };
  }

  try {
    const dotIndex = path.lastIndexOf('.');
    const fileExtension = dotIndex !== -1 ? path.substring(dotIndex).toLowerCase() : '';
    const contentType = MIME_TYPES[fileExtension] || 'application/octet-stream';
    
    // Determine if the file format is binary (e.g. images, fonts)
    const isBinary = !['.html', '.css', '.js', '.json', '.svg'].includes(fileExtension);
    
    const fileBuffer = readFileSync(filePath);
    const body = isBinary ? fileBuffer.toString('base64') : fileBuffer.toString('utf-8');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: isBinary,
      body: body
    };
  } catch (error) {
    console.error('Error reading file:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error'
    };
  }
};
