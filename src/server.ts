import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

// The folder where the Angular browser build files are located
const browserDistFolder = resolve(dirname(fileURLToPath(import.meta.url)), '../browser');

const app = express();

/**
 * Serve static files (Angular frontend) from /browser directory.
 * These files will be built by running 'ng build' or 'ng build --prod'
 */
app.use(express.static(browserDistFolder, {
  maxAge: '1y',  // Cache static files for a year
  index: false,  // Disable automatic serving of index.html
  redirect: false,  // Disable redirect for non-existent files
}));

/**
 * Serve index.html for all routes so Angular handles routing on the frontend.
 * This allows Angular to take care of routes and page reloads in the client-side app.
 */
app.all('*', (req, res) => {
  res.sendFile(resolve(browserDistFolder, 'index.html'));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4200.
 */
const port = process.env['PORT'] || 4200;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});

export default app;  // For use with other setups (like Firebase Functions if needed)
