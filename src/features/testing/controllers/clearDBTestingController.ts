import {Response, Request} from 'express'
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {db} from "../../../ioc";
export const clearDBTestingController = async (req: Request, res: Response) => {
    await db.drop();
    res.sendStatus(HttpStatus.NoContent)
}