"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pokemon_tcg_sdk_typescript_1 = require("pokemon-tcg-sdk-typescript");
const fs = __importStar(require("fs"));
const os_1 = __importDefault(require("os"));
let cardRegex = /([0-9]+) ([A-Za-z' ]+) ([A-Za-z]+) ([0-9]+)/g;
let cardSets = {
    "PR-SW": "swshp",
    "SSH": "swsh1",
    "RCL": "swsh2",
    "DAA": "swsh3",
    "CPA": "swsh35",
    "VIV": "swsh4",
    "SHF": "swsh45",
    "BST": "swsh5",
    "CRE": "swsh6",
    "EVS": "swsh7",
    "CEL": "cel25",
    "FST": "swsh8",
    "FUT20": "fut20",
    "BRS": "swsh9",
    "ASR": "swsh10",
    "PGO": "pgo",
    "LOR": "swsh11",
    "SIT": "swsh12",
    "SWSHEnergy": "sm1",
    "Energy": "sm1"
};
let deckItem = {
    FaceURL: '',
    BackURL: 'https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg',
    NumWidth: 1,
    NumHeight: 1,
    BackIsHidden: true,
    UniqueBack: false,
    Type: 0
};
let customDeck = {
    1: deckItem
};
let deckObject = {
    Name: 'CardCustom',
    Transform: {
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 180,
        rotZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1
    },
    Nickname: '',
    Description: '',
    GMNotes: '',
    AltLookAngle: { x: 0, y: 0, z: 0 },
    ColorDiffuse: { r: 0.713235259, g: 0.713235259, b: 0.713235259 },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: true,
    Hands: true,
    CardID: 100,
    SidewaysCard: false,
    CustomDeck: customDeck,
    LuaScript: '',
    LuaScriptState: '',
    XmlUI: ''
};
let deckTemplate = {
    SaveName: '',
    Date: '',
    VersionNumber: '',
    GameMode: '',
    GameType: '',
    GameComplexity: '',
    Tags: [],
    Gravity: 0.5,
    PlayArea: 0.5,
    Table: '',
    Sky: '',
    Note: '',
    TabStates: {},
    LuaScript: '',
    LuaScriptState: '',
    XmlUI: '',
    ObjectStates: [
        {
            Name: 'Deck',
            Transform: {
                posX: 0,
                posY: 0,
                posZ: 0,
                rotX: 0,
                rotY: 180,
                rotZ: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1
            },
            Nickname: '',
            Description: '',
            GMNotes: '',
            AltLookAngle: { x: 0, y: 0, z: 0 },
            ColorDiffuse: { r: 0.713235259, g: 0.713235259, b: 0.713235259 },
            LayoutGroupSortIndex: 0,
            Value: 0,
            Locked: false,
            Grid: true,
            Snap: true,
            IgnoreFoW: false,
            MeasureMovement: false,
            DragSelectable: true,
            Autoraise: true,
            Sticky: true,
            Tooltip: true,
            GridProjection: false,
            HideWhenFaceDown: true,
            Hands: false,
            SidewaysCard: false,
            DeckIDs: [
                0
            ],
            CustomDeck: customDeck,
            LuaScript: '',
            LuaScriptState: '',
            XmlUI: '',
            ContainedObjects: [
                deckObject
            ]
        }
    ]
};
let cardData = [];
let defaultData;
let callbackRun = false;
function loadCards(callback) {
    pokemon_tcg_sdk_typescript_1.PokemonTCG.findCardByID(`swsh1-1`).then((value) => {
        defaultData = value;
    });
    fs.readFile(process.argv[2], { encoding: "utf-8" }, (err, data) => {
        if (err) {
            throw err;
        }
        let cards = Array.from(data.matchAll(cardRegex));
        let promises = [];
        for (const [i, card] of cards.entries()) {
            let count = parseInt(card[1]);
            let set = cardSets[card[3]];
            let id = card[4];
            if (set == "sm1") {
                id = (parseInt(id) + 163).toString();
            }
            promises[i] = pokemon_tcg_sdk_typescript_1.PokemonTCG.findCardByID(`${set}-${id}`);
            cardData[i] = { count: count, data: defaultData };
        }
        Promise.all(promises).then((values) => {
            for (let [i, value] of values.entries()) {
                cardData[i].data = value;
            }
            callback();
        });
    });
}
function fillJson(callback) {
    let deckJson = deckTemplate;
    deckJson.ObjectStates[0].DeckIDs = [];
    deckJson.ObjectStates[0].ContainedObjects = [];
    for (let [i, card] of cardData.entries()) {
        let cardItem = deckItem;
        cardItem.FaceURL = card.data.images.large;
        deckJson.ObjectStates[0].CustomDeck[i + 1] = Object.assign({}, cardItem);
        let cardObject = deckObject;
        cardObject.Nickname = card.data.name;
        cardObject.CustomDeck[i + 1] = Object.assign({}, cardItem);
        for (let j = 0; j < card.count; j++) {
            deckJson.ObjectStates[0].DeckIDs.push((i + 1) * 100);
            deckJson.ObjectStates[0].ContainedObjects.push(Object.assign({}, cardObject));
        }
    }
    callback(deckJson);
}
loadCards(() => {
    fillJson((json) => {
        fs.writeFile(`${os_1.default.homedir}/Documents/My Games/Tabletop Simulator/Saves/Saved Objects/${process.argv[2].split(".")[0]}.json`, JSON.stringify(json), () => { });
    });
});
