"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kayak = exports.KayakStatus = void 0;
var KayakStatus;
(function (KayakStatus) {
    KayakStatus["AVAILABLE"] = "AVAILABLE";
    KayakStatus["IN_USE"] = "IN_USE";
    KayakStatus["MAINTENANCE"] = "MAINTENANCE";
    KayakStatus["ALERT"] = "ALERT";
})(KayakStatus || (exports.KayakStatus = KayakStatus = {}));
class Kayak {
    id;
    code;
    name;
    status;
    active;
    createdAt;
    updatedAt;
}
exports.Kayak = Kayak;
//# sourceMappingURL=kayak.entity.js.map