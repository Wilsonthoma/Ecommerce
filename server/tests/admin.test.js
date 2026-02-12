const request = require("supertest");
const app = require("../app");

describe("Admin Endpoint Tests", () => {
    it("should return admins list", async () => {
        const res = await request(app).get("/api/admins");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
    });
});
