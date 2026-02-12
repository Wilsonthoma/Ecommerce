
const request = require("supertest");
const app = require("../app");

describe("Product API Tests", () => {
    it("should return all products", async () => {
        const res = await request(app).get("/api/products");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
    });

    it("should create a product", async () => {
        const res = await request(app)
            .post("/api/products")
            .send({ name: "Sample Product", price: 199 });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
    });
});
