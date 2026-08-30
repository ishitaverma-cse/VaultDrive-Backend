const request = require("supertest");
const app = require("../index");

describe("Share API", () => {
    test("POST /api/share/:fileId should reject unauthenticated request", async () => {
        const response = await request(app)
            .post("/api/share/1");

        expect(response.statusCode).toBe(401);
    });
});

describe("Signed URL API", () => {
    test("POST /api/files/:fileId/signed-url should reject unauthenticated request", async () => {
        const response = await request(app)
            .post("/api/files/1/signed-url");

        expect(response.statusCode).toBe(401);
    });
});

describe("Trash API", () => {
    test("POST /api/trash should reject unauthenticated request", async () => {
        const response = await request(app)
            .post("/api/trash");

        expect(response.statusCode).toBe(401);
    });

    test("POST /api/trash/:type/:id/restore should reject unauthenticated request", async () => {
        const response = await request(app)
            .post("/api/trash/file/1/restore");

        expect(response.statusCode).toBe(401);
    });
});