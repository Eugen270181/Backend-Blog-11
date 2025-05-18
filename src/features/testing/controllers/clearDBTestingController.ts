import {Response, Request} from 'express'
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {container} from "../../../composition-root";
import {DB} from "../../../common/module/db/DB";

export const clearDBTestingController = async (req: Request, res: Response) => {

    const db = container.get<DB>(DB)
    await db.drop();
    res.sendStatus(HttpStatus.NoContent)
}