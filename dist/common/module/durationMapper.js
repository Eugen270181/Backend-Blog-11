"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.durationMapper = durationMapper;
function durationMapper(duration) {
    const units = {
        s: 'seconds',
        m: 'minutes',
        h: 'hours',
        d: 'days',
        M: 'months',
        y: 'years',
    };
    let durationObject = { seconds: 0, minutes: 0, hours: 0, days: 0, months: 0, years: 0 };
    const regex = /(\d+)([smhdMy])/g;
    let match;
    while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1], 10);
        const unit = units[match[2]];
        if (unit) {
            durationObject[unit] += value;
        }
    }
    return durationObject;
}
//# sourceMappingURL=durationMapper.js.map