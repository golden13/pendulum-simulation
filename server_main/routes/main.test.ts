import request from "supertest";
import dotenv from 'dotenv';
import assert from "assert";

dotenv.config();

describe('REST', () => {
  
    test('GET /settings', async () => {
        const res = await request('http://localhost:8080')
            .get('/settings');

        //console.log(res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({id:'1', name: "P1"})]));
        expect(res.body.length).toEqual(5);
    });

    test('GET html page', async () => {
        const res = await request('http://localhost:8080')
            .get('/')
            .expect("Content-type",/html/);

        //console.log(res.body);
        expect(res.text).toMatch(/Pendulum/);
        expect(res.statusCode).toEqual(200);
    });
});