const request = require("supertest");
const app = require("../index");

describe("Authentication API", () => {
    test("GET /api/auth/profile should reject unauthenticated request", async () => {
        const response = await request(app)
            .get("/api/auth/profile");

        expect(response.statusCode).toBe(401);
    });
});  