"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const PORT = 90 || parseInt(process.env.PORT);
index_1.app.listen(PORT, () => {
    console.log(`Server is running succesfully at ${PORT}`);
});
//# sourceMappingURL=main.js.map