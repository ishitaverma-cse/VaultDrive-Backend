const request = require("supertest");
const app = require("../index");

describe("File API", () => {
    test("GET /api/files should reject unauthenticated request", async () => {
        const response = await request(app)
            .get("/api/files");

        expect(response.statusCode).toBe(401);
    });
});