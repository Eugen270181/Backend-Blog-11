import {body} from "express-validator";

export class BlogValidation {
    nameValidator = body('name').isString().withMessage('not string')
        .trim().isLength({min: 1, max: 15}).withMessage('more then 15 or 0')

    descriptionValidator = body('description').isString().withMessage('not string')
        .trim().isLength({min: 1, max: 500}).withMessage('more then 500 or 0')

    websiteUrlValidator = body('websiteUrl').isString().withMessage('not string')
        .trim().isURL().withMessage('not url')
        .isLength({min: 1, max: 100}).withMessage('more then 100 or 0')
}