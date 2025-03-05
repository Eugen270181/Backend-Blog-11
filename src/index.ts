import {Request, Response} from 'express'
import {appConfig} from './common/settings/config'
import {initApp} from "./initApp";
import {routersPaths} from "./common/settings/paths";
import {db} from "./ioc";

const app = initApp()

app.get(routersPaths.common, (req:Request, res:Response) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(200).json({version: '1.0'})
})

const startApp = async () => {
    await db.run(appConfig.MONGO_URI)
    app.listen(appConfig.PORT, () => {
        console.log(`Example app listening on port ${appConfig.PORT}`)
    })
    return app
}

startApp();
