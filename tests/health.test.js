const request = require("supertest");
const app = require("../index");

describe("Health Check API", () => {
    test("GET / should return backend running message", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            message: "File Management System Backend is running!"
        });
    });
});