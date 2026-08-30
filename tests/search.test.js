const request = require("supertest");
const app = require("../index");

describe("Search API", () => {
    test("GET /api/files/search should reject unauthenticated request", async () => {
        const response = await request(app)
            .get("/api/files/search?q=internship");

        expect(response.statusCode).toBe(401);
    });
});