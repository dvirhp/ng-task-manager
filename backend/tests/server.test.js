import { test } from "node:test";
import assert from "node:assert";
import http from "node:http";
import app from "../dist/app.js";

test("Server should start and respond with 200 OK", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  const { port } = server.address();
  const response = await fetch(`http://localhost:${port}/api/health`);
  assert.ok(response, "No response from server");
  assert.strictEqual(response.status, 200, "Expected 200 OK from /api/health");

  server.close();
});
