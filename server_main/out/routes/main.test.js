"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
describe('REST', () => {
    test('GET /settings', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)('http://localhost:8080')
            .get('/settings');
        //console.log(res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: '1', name: "P1" })]));
        expect(res.body.length).toEqual(5);
    }));
    test('GET html page', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)('http://localhost:8080')
            .get('/')
            .expect("Content-type", /html/);
        //console.log(res.body);
        expect(res.text).toMatch(/Pendulum/);
        expect(res.statusCode).toEqual(200);
    }));
});
//# sourceMappingURL=main.test.js.map