import { test } from "node:test";
import assert from "node:assert";
import app from "../src/app.js";
import http from "node:http";

// Helper to start and stop the server during the test
test("Server should start and respond with status 200", async (t) => {
  const server = http.createServer(app);

  // Start the server on a random available port
  await new Promise((resolve) => server.listen(0, resolve));

  const { port } = server.address();
  const response = await fetch(`http://localhost:${port}/api/health`).catch(() => null);

  assert.ok(response, "No response from server");
  assert.strictEqual(response.status, 200, "Expected HTTP 200 status");

  server.close();
});
