import {Response, Request} from 'express'
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {container} from "../../../composition-root";
import {DB} from "../../../common/module/db/DB";
import {TYPES} from "../../../ioc-types";

export const clearDBTestingController = async (req: Request, res: Response) => {

    const db = container.get<DB>(TYPES.DB)
    await db.drop();
    res.sendStatus(HttpStatus.NoContent)
}