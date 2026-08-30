const request = require("supertest");
const app = require("../index");

describe("Folder API", () => {
    test("GET /api/folders should reject unauthenticated request", async () => {
        const response = await request(app)
            .get("/api/folders");

        expect(response.statusCode).toBe(401);
    });
});