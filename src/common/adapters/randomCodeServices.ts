import {randomUUID, UUID} from "crypto";

export const RandomCodeServices = {
     genRandomCode():UUID {
         const code= randomUUID();
         console.log(this)
        return code
    }
}