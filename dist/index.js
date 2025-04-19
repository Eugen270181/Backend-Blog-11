"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./common/settings/config");
const initApp_1 = require("./initApp");
const paths_1 = require("./common/settings/paths");
const ioc_1 = require("./ioc");
const DB_1 = require("./common/module/db/DB");
const app = (0, initApp_1.initApp)();
const dbInstance = ioc_1.ioc.getInstance(DB_1.DB);
app.get(paths_1.routersPaths.common, (req, res) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(200).json({ version: '1.0' });
});
const startApp = async () => {
    await dbInstance.run(config_1.appConfig.MONGO_URI);
    app.listen(config_1.appConfig.PORT, () => {
        console.log(`Example app listening on port ${config_1.appConfig.PORT}`);
    });
    return app;
};
startApp();
//# sourceMappingURL=index.js.map