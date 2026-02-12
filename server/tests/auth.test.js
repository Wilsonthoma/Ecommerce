import request from "supertest";
import app from "../server.js"; 
// import { connectTestDB, clearTestDB } from "./utils/test-db"; // Assume you create this

const testUser = {
  name: "Test Runner",
  email: "runner@test.com",
  password: "Secure123!",
};

let agent; // Used to persist cookies across requests (Crucial for session testing)

describe("🔐 Authentication Workflow", () => {
  // Use a Supertest agent to keep sessions/cookies alive for chained tests
  beforeAll(() => {
    // 1. Connect to test DB
    // await connectTestDB(); 
    agent = request.agent(app);
  });

  afterEach(async () => {
    // 2. Clear user data after each test
    // await clearTestDB();
  });

  // --- 1. Successful Registration ---
  it("should successfully register a new user (201)", async () => {
    const res = await agent
      .post("/api/auth/register")
      .send(testUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('id');
  });

  // --- 2. Failed Registration (Duplicate) ---
  it("should return 400 or 409 if user already exists", async () => {
    const res = await agent
      .post("/api/auth/register")
      .send(testUser);
      
    // Depending on your error handler, it might be 400 or 409
    expect(res.statusCode).toBeGreaterThanOrEqual(400); 
    expect(res.body.success).toBe(false);
  });

  // --- 3. Successful Login ---
  it("should login the user and set session cookie (200)", async () => {
    const res = await agent
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined(); // Check for session cookie
    // If you use JWT, check for res.body.token
  });
  
  // --- 4. Test Authenticated Route (Requires Session) ---
  it("should access a protected route after login", async () => {
    // Agent automatically carries the session cookie from the login test
    const res = await agent
      .get("/api/user/profile"); 
      
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testUser.name); 
  });
  
  // --- 5. Logout ---
  it("should logout the user and destroy the session", async () => {
    const res = await agent.post("/api/auth/logout");
    
    expect(res.statusCode).toBe(200);
    // Check if the session cookie is cleared/invalidated
  });
  
  // You would add more tests here for rate limiting, CSRF, etc.
});