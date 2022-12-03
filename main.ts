import {PokemonTCG} from "pokemon-tcg-sdk-typescript";
import * as fs from "fs";
import os from "os";

let cardRegex: RegExp = /([0-9]+) ([A-Za-z' ]+) ([A-Za-z]+) ([0-9]+)/g;

let cardSets: {[key: string]: string} = {
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
}

let deckItem = {
    FaceURL: '',
    BackURL: 'https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg',
    NumWidth: 1,
    NumHeight: 1,
    BackIsHidden: true,
    UniqueBack: false,
    Type: 0
};

let customDeck: {[key: string]: typeof deckItem} = {
    1: deckItem
}

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
}

let cardData: Array<{count: number, data: PokemonTCG.Card}> = [];

let defaultData: PokemonTCG.Card;

let callbackRun: boolean = false;

function loadCards(callback: Function) {
    PokemonTCG.findCardByID(`swsh1-1`).then((value: PokemonTCG.Card) => {
        defaultData = value;
    })

    fs.readFile(process.argv[2], {encoding: "utf-8"}, (err, data) => {
        if (err) {
            throw err;
        }
        
        let cards: RegExpMatchArray[] = Array.from(data.matchAll(cardRegex));

        let promises: Promise<PokemonTCG.Card>[] = [];

        for (const [i, card] of cards.entries()) {
            let count: number = parseInt(card[1]);
            let set: string = cardSets[card[3]];
            let id: string = card[4];

            if (set == "sm1") {
                id = (parseInt(id) + 163).toString();
            }

            promises[i] = PokemonTCG.findCardByID(`${set}-${id}`);
            cardData[i] = {count: count, data: defaultData};
        }

        Promise.all(promises).then((values: PokemonTCG.Card[]) => {
            for (let [i, value] of values.entries()) {
                cardData[i].data = value;
            }

            callback();
        });
    });
}

function fillJson(callback: Function) {
    let deckJson = deckTemplate;
    deckJson.ObjectStates[0].DeckIDs = [];
    deckJson.ObjectStates[0].ContainedObjects = [];
    
    for (let [i, card] of cardData.entries()) {
        let cardItem = deckItem;
        cardItem.FaceURL = card.data.images.large;
        deckJson.ObjectStates[0].CustomDeck[i + 1] = {...cardItem};

        let cardObject = deckObject;
        cardObject.Nickname = card.data.name;
        cardObject.CustomDeck[i + 1] = {...cardItem};

        for (let j: number = 0; j < card.count; j++) {
            deckJson.ObjectStates[0].DeckIDs.push((i + 1) * 100)
            deckJson.ObjectStates[0].ContainedObjects.push({...cardObject});
        }
    }

    callback(deckJson);
}

loadCards(() => {
    fillJson((json: {}) => {
        fs.writeFile(`${os.homedir}/Documents/My Games/Tabletop Simulator/Saves/Saved Objects/${process.argv[2].split(".")[0]}.json`, JSON.stringify(json), () => {})
    })
});