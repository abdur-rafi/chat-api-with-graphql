"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
let app = express_1.default();
let port = 3000;
app.use('/', (req, res) => {
    res.send('Working');
});
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});
