const request = require("supertest");
const app = require("../app");

describe("Order API Tests", () => {
    it("should return all orders", async () => {
        const res = await request(app).get("/api/orders");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
    });
});
