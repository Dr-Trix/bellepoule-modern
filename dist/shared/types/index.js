"use strict";
/**
 * BellePoule Modern - Type Definitions
 * Based on the original BellePoule C++ codebase
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.PhaseType = exports.MatchStatus = exports.FencerStatus = exports.Gender = exports.Weapon = void 0;
// ============================================================================
// Enums
// ============================================================================
var Weapon;
(function (Weapon) {
    Weapon["EPEE"] = "E";
    Weapon["FOIL"] = "F";
    Weapon["SABRE"] = "S";
    Weapon["LASER"] = "L";
})(Weapon || (exports.Weapon = Weapon = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "M";
    Gender["FEMALE"] = "F";
    Gender["MIXED"] = "X";
})(Gender || (exports.Gender = Gender = {}));
var FencerStatus;
(function (FencerStatus) {
    FencerStatus["QUALIFIED"] = "Q";
    FencerStatus["ELIMINATED"] = "E";
    FencerStatus["ABANDONED"] = "A";
    FencerStatus["EXCLUDED"] = "X";
    FencerStatus["NOT_CHECKED_IN"] = "N";
    FencerStatus["CHECKED_IN"] = "P";
    FencerStatus["FORFAIT"] = "F";
})(FencerStatus || (exports.FencerStatus = FencerStatus = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["NOT_STARTED"] = "not_started";
    MatchStatus["IN_PROGRESS"] = "in_progress";
    MatchStatus["FINISHED"] = "finished";
    MatchStatus["CANCELLED"] = "cancelled";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
var PhaseType;
(function (PhaseType) {
    PhaseType["CHECKIN"] = "checkin";
    PhaseType["POOL"] = "pool";
    PhaseType["DIRECT_ELIMINATION"] = "direct_elimination";
    PhaseType["CLASSIFICATION"] = "classification";
})(PhaseType || (exports.PhaseType = PhaseType = {}));
var Category;
(function (Category) {
    Category["U11"] = "U11";
    Category["U13"] = "U13";
    Category["U15"] = "U15";
    Category["U17"] = "U17";
    Category["U20"] = "U20";
    Category["SENIOR"] = "SEN";
    Category["V1"] = "V1";
    Category["V2"] = "V2";
    Category["V3"] = "V3";
    Category["V4"] = "V4";
})(Category || (exports.Category = Category = {}));
//# sourceMappingURL=index.js.map