const request = require("supertest");
const app = require("../index");

describe("Permission API", () => {
    test("POST /api/permissions/:fileId should reject unauthenticated request", async () => {
        const response = await request(app)
            .post("/api/permissions/1");

        expect(response.statusCode).toBe(401);
    });
});