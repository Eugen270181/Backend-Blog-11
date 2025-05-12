import {add} from "date-fns/add";
import {durationMapper} from "../module/durationMapper";

export const dateServices = {
    genAddDate(operationalDate: Date, timeFormatForAdd:string) {
        //проверяем входную строку, д.б например '1s 30m 2h 2d 3M 1Y' - 1 сек 30 мин 2 часа 2 дня 3 мес 1 год
        const regex = /^(?:\d+\s*[smhdMy])+$/;
        if (!regex.test(timeFormatForAdd)) {
            throw new Error("Invalid duration format");
        }

        return add(operationalDate, durationMapper(timeFormatForAdd))
    }
}