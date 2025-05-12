import {randomUUID, UUID} from "crypto";

export const codeServices = {
     genRandomCode():UUID {
        return randomUUID()
    }
}