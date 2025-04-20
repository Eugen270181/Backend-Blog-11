import {randomUUID, UUID} from "crypto";

export const RandomCodeServices = {
     genRandomCode():UUID {
         const code= randomUUID();
        return code
    }
}