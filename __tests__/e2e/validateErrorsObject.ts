import {OutputErrorsType} from "../../src/common/types/outputErrors.type";

export const validateErrorsObject = (errorsObj: OutputErrorsType,
                                     expectedErrorsFields: Array<string>) => {

    const expectedErrorsFieldsSet = new Set(expectedErrorsFields);
    const recivedErrorsFieldsSet = new Set(
        errorsObj.errorsMessages.map(error => error.field)
    );

    expect(expectedErrorsFieldsSet).toEqual(recivedErrorsFieldsSet)

}