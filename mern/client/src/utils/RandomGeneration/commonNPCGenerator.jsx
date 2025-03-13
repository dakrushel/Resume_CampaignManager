import { useState } from "react";

//This component is a monolithic combination of several .mjs files because it was easier to deal with than all of the
//troubleshooting required to get ES Modules to play nice with Jest and Cypress for containerization and testing.

/*
CONTENTS:
Global Variables (arrays)_
    Names_________________
    Descriptors___________
Races_____________________
RNGEsus___________________
Character Generation______
*/

//==================================== GLOBAL VARIABLES ====================================//
let character = {};

//Nearly all names were unabashedly taken from ChatGPT
//==================================== NPC NAMES ====================================
//Human names
const humanMNames = ["Aldric", "Thalion", "Earmon", "Fenris", "Cedric", "Alaric", "Dain", "Dyne", "Theron", "Orin", "Baelor", "Lucan", "Garrick", "Drostan", "Valen", "Leoric", "Draven", "Rowan", "Torin", "Evander"];
const humanFNames = ["Seraphine", "Thalia", "Tiffany", "Sarah", "Alysa", "Nyra", "Elysia", "Calista", "Tatiana", "Freya", "Lirael", "Eowyn", "Selene", "Aeliana", "Celeste", "Mirabel", "Marion", "Linnea", "Cerys", "Tamsin"];
const humanLastNames = ["Ashford", "Branwell", "Baker", "Hawke", "Eldridge", "Hales", "Marwick", "Drury", "Winthrop", "Grayson", "Haverly", "Colborn", "Hartsell", "Ashcombe", "Fenwick", "Soren", "Ellerslie", "Hargrave", "Casterly", "Alwood"]

//Dwarven names
const dwarvenMNames = ["Thrain", "Borin", "Durak", "Keldorn", "Grimnar", "Rurik", "Balin", "Thorgar", "Thorgrim", "Gromnir", "Korrin", "Nundak", "Dravin", "Kromak", "Marduk", "Orin", "Thorgar", "Varrik", "Galdur", "Feldak"];
const dwarvenFNames = ["Brynhild", "Tilda", "Elda", "Keldara", "Marda", "Ragna", "Thora", "Freya", "Hilda", "Vanya", "Orla", "Bruni", "Dagna", "Sigrid", "Frida", "Kora", "Ylva", "Helga", "Thalira", "Lagertha"];
const dwarvenLastNames = ["Stonefist", "Ironcrown", "Copperjaw", "Goldenflame", "Emberforge", "Thunderaxe", "Grimnar", "Flintbeard", "Frosthammer", "Firegaze", "Oakenshield", "Bolderbrow", "Blackstone", "Gemhunter", "Frostgrip", "Gravenspear", "Ashenforge", "Ironhelm", "Lonemountain"];

//Elven names
const elvenMNames = ["Legolas", "Aelion", "Elrond", "Elandor", "Caelum", "Faelar", "Lirael", "Sylas", "Varna", "Arannis", "Sylmorn", "Galadorn", "Aerendyl", "Lindir", "Finar", "Elrohir", "Dyne", "Thaloren", "Nymor", "Quindor"];
const elvenFNames = ["Arwen", "Lyriana", "Aerin", "Faelwen", "Iylana", "Serelis", "Aelora", "Sylvara", "Elowen", "Elandrai", "Maerwen", "Valindra", "Arannis", "Lotheille", "Amara", "Naerwen", "Seluna", "Sylara", "Thalindra", "Vael"];
const elvenLastNames = ["Autumnleaf", "Moonshadow", "Nightwind", "Starseer", "Windrunner", "Highglade", "Swiftbrook", "Dawnember", "Stormcloak", "Galewing", "Brightsong", "Evenstar", "Duskwind", "Starweaver", "Evergreen", "Featherlight", "Moonstrider", "Leafwhisper", "Dawnborn", "Stillwater"];

//Halfling names
const halflingMNames = ["Merric", "Tolin", "Fendrel", "Milo", "Finnigan", "Haldor", "Tobin", "Doran", "Jory", "Harlin", "Rorik", "Aldo", "Bryn", "Wilber", "Fenwick", "Collin", "Bodo", "Tomlin", "Rudi", "Bery"];
const halflingFNames = ["Rosie", "Elora", "Marigold", "Daisy", "Lila", "Brina", "Fira", "Ivy", "Tilly", "Willow", "Wren", "Robin", "Mabel", "Ruby", "Nessa", "Mira", "Saffy", "Wynona", "Brit", "Polly"];
const halflingLastNames = ["Greenbottle", "Underbough", "Hilltopple", "Fairwether", "Tealeaf", "Burrows", "Roundbarrel", "Fairstep", "Oakroot", "Bramblewine", "Proudfoot", "Meadogrove", "Appleseed", "Lightfood", "Thistlebrook", "Shortwick", "Longfern", "Honeybough", "Cook", "Fiddlewick"];

//Gnomish names
const gnomeMNames = ["Rimble", "Tinkertop", "Nixle", "Fizzwald", "Glim", "Zook", "Toddynock", "Wallybop", "Nackle", "Dimm", "Jebeddo", "Murnig", "Wep", "Quinlan", "Dimble", "Poggy", "Rumple", "Boffin", "Fitzle", "Simblewiz"];
const gnomeFNames = ["Nilly", "Tissa", "Mizzbelle", "Brilla", "Wrennie", "Poppy", "Vixie", "Quilla", "Nixie", "Bimpnottin", "Triss", "Tink", "Dapple", "Wixie", "Jinny", "Miri", "Zanna", "Pippie", "Ellywick", "Gibby"];
const gnomeLastNames = ["Whistlethorn", "Fidget", "Tumbleunder", "Nimthinble", "Coggs", "Bafflestone", "Timbersprocket", "Fizzlewisp", "Fixquicket", "Fendle", "Wobblecog", "Nackletack", "Fibblefen", "Loopy", "Copperknob", "Tobsgromet", "Mollyclocks", "Wingletot", "Puds", "Wubbles"];

//Tiefling names
//Tieflings are different; the may have a human surname, they may have a "Virtue" name, they may only have a first name
const tieflingMNames = ["Azzarion", "Baelthor", "Kazimel", "Malakir", "Zareketh", "Varrion", "Xorvus", "Jathren", "Kravok", "Ozarath", "Raithos", "Selvix", "Thravon", "Mordaius", "Zephrael", "Klyzor", "Draxxar", "Luthoran", "Vetherion", "Xarnath"];
const tieflingFNames = ["Orianna", "Kelira", "Zyreth", "Nyssara", "Velara", "Siraeth", "Xyphira", "Varith", "Morvella", "Thaliax", "Zevara", "Lythira", "Syrienne", "Xarissa", "Kalithra", "Maelara", "Vezarelle", "Phelaia", "Delvira", "Arvona"];
//0-6 good, 7-13 neutral, 14-20 evil
const tieflingVNames = ["Mercy", "Redemption", "Temperance", "Hope", "Valor", "Solace", "Righteous", "Justice", "Courage", "Silence", "Prestige", "Nowhere", "Balance", "Calm", "Torment", "Vengeance", "Wrath", "Despair", "Malice", "Fear", "Greed"];

//--------------------------------- Greenskins/Punching bags ---------------------------------
// //Orc names
// const orcNames = ["Grommash", "Throk", "Olog", "Grashnak", "Mokthar", "Durnok", "Hork", "Krub", "Rukhar", "Zogoth", "Grashnak", "Thrallok", "Volgak", "Garzum", "Thudfuk", "Drakul", "Grokkar", "Morgash", "Zrugak", "Tharnak"];
// const orcClans = ["Bludtoof", "Chompahs", "Smashfist", "Fistsmash", "Bonezcrush", "Bigax", "SkullzNclaw", "Stabblud", "Frustwoof", "RRoksmash", "Meanteef", "Warkill", "Dedfyr", "Maurblud", "Darkblak", "Fastkill", "Longkill", "Kylbash", "Krushax", "Dethstynk"];

// //Goblin names
// const goblinNames = ["Grubnash", "Snagtooth", "Worgle", "Krizzik", "Bogfizzle", "Drekthar", "Blukt", "Zogrok", "Krunkle", "Gizzik", "Skrag", "Nybles", "Glumwort", "Dribblespit", "Gnashwick", "Mugwark", "Greez", "Stinkfinger", "Zubgob", "Slizzik"];
// const goblinClans = ["Snotfang", "Rustclaw", "Cragtooth", "Mudspike", "Grimscuttle", "Splinterbone", "Bogsnout", "Blackfang", "Skulldugger", "Filthmire", "Bloodmuck", "Stenchgut", "Rothide", "Blisterfoot", "Ripsnarl", "Bonegrim", "Tatterhoods", "Threefang", "Bilepunch", "Gladspikes"];

// //Kobold names
// const koboldNames = ["Skrizzik", "Vrekka", "Zilkak", "Kraggit", "Nibbib", "Drizgar", "Dagron", "Thrikka", "Zekkis", "Blekka", "Rizzik", "Krizzix", "Vorkil", "Grelk", "Zarnak", "Triggis", "Blizrak", "Chorzik", "Gruzzle", "Thark"];
// const koboldClans = ["Fireclaw", "Goldenscale", "Emberfang", "Ashenwing", "Dragonfang", "Drakehord", "Thornscale", "Wrymclaw", "Dragonblood", "Bronzeclaw", "Starfang", "Moonwing", "Drakeshadow", "Thunderfang", "Blacktalon", "Firebreather", "Stormdrake", "Skyfire", "Burningmoon", "Sunkiller"];

// //Bugbear names
// const bugbearNames = ["Grukk", "Thragga", "Morgut", "Grolk", "Zrug", "Brakka", "Thrun", "Ruggak", "Ghrash", "Drekka", "Vrog", "Krund", "Grattok", "Snaggar", "Bruzga", "Toggrin", "Ddrummak", "Krugash", "Varkul", "Grummok"];
// const bugbearClans = ["Rockjaw", "Fistbiter", "Stompfoot", "Redhand", "Smashface", "Clubhead", "Fanggut", "Stonebash", "Nightfoot", "Frostclub", "Skullbasher", "Bonecrown", "Ripjaw", "Pigfoot", "Stumpfist", "Firegut", "Poisontooth", "Loudfoot", "Snapjaw", "Mountaincrack"];

// //Hobgoblins
// const hobgoblinNames = ["Vornak", "Gralmar", "Tharuk", "Kodrak", "Zulgor", "Brakar", "Rang-Gor", "Durnok", "Krulvar", "Voklar", "Grathor", "Rodrak", "Gromak", "Zagrov", "Vulkash", "Mordak", "Tarkhan", "Kravok", "Rugnar", "Zharog"];
// const hobgoblinClans = ["Ironmaw", "Bonecrusher", "Emberhide", "Bloodfist", "Deathclaw", "Thornmaul", "Grimfang", "Stonefist", "Blackskull", "Frosthide", "Blightfang", "Stormfury", "Nightmare", "Darkrage", "Allslayer", "Blazingaxe", "Stonejaw", "Stonejaw", "Bronzehelm", "Darkheart"];

// //Gnolls
// const gnollNames = ["Yiprak", "Gnarrl", "Barkak", "Snarrk", "Ritka", "Yekyek", "Krakrik", "Hrakka", "Grak", "Rikkik", "Snufak", "Yarpak", "Krukruk", "Yapnak", "Zakka", "Hrakkak", "Gnyip", "Chirrk", "Sniknik", "Rarrp"];
// const gnollClans = ["Yipfang", "Chompjaw", "Barkhide", "Rattleclaw", "Howlblood", "Snarltooth", "Hrakfan", "Chitteryip", "Yelpgrin", "Devourer", "Howler", "Gnashfur", "Clawback", "Krissfang", "Grukkmaw", "Shriekshriek", "Tearscream", "Greenclaw", "Snufflesnik", "Evergnaw"];


//====================================== RACES ======================================
// export const villainRaces = ["Human", "Elf", , "Dwarf", "Halfing", "Gnome", "Tiefling", "Orc", "Goblin", "Kobold", "Bugbear", "Hobgoblin", "Gnoll"];
// export const races = ["Human", "Elf", , "Dwarf", "Halfing", "Gnome", "Tiefling"];

//===================================== QUIRKS ======================================
const quirks = ["Nervous", "Mutters to themselves", "Collects oddities", "Fidgeter", "Superstitious", "Absent-minded", "Very literal", "Mischievous", "Dislikes mirrors", "Monotone", "Enthusiastic", "Easily distracted", "Suspicious", "Incorrigible Optimist", "Bashful", "Cantankerous", "Straight to the point", "Overly Formal", "Magical Thinker", "Very Friendly"];

//============================== DISTINGUISHING FEATURES ============================
//Female features start of array [0, 1], male features at end [.length-3 - .length-1]
const features = [["Long-haired", "Short-haired", "Shaved head"], ["Bulky", "Thin", "Buxom"], ["Missing limb(s) or phalange(s)"], ["Blind in one eye"], ["Powerfully ugly", "Fairest of the them all", "Plain-looking"], ["Short", "Tall"], ["Slightly hunched"], ["Facial scar"], ["Manicured"], ["Rugged"], ["Devilish grin"], ["Tattooed"], ["Fair-skinned", "Tanned"], ["Red-faced"], ["Bulky", "Thin", "Brawny"], ["Long-haired", "Short-haired", "Shaved head", "Bald"], ["Bearded", "Moustached", "Mutton chopped", "Goateed"]];

//====================================== VICES ======================================
const vices = ["Lust", "Gluttony", "Greed", "Sloth", "Wrath", "Envy", "Pride"];

//===================================== VIRTUES =====================================
const virtues = ["Chastity", "Temperance", "Charity", "Diligence", "Patience", "Kindness", "Humility"];

//================================ MOTIVATION/IDEALS ================================
const ideals = ["Morals", "Power", "Love", "Justice", "Wisdom", "Freedom", "Honor", "Peace", "Glory", "Wealth", "Family", "Loyalty", "Ambition", "Faith", "Courage", "Charity", "Order", "Creativity", "Resilience", "Unity"];

//console.log(quirks.length);
const classNames = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];


//================================= RACES =================================
//the race based fields such as name, age etc. are generated here
//the class based fields  will be displayed in the character component by the API

const PickANumber = (min, max) => {
    return (Math.floor(Math.random() * (max - min + 1) + min));
}

const RNGesusStats = () => {
    const stats = [];
    //Do character 6 times
    for (let i = 0; i < 6; i++) {
        
        //set variables
        const statRoll = [];
        let stat = 0;
        
        //Roll 4d6
        for (let j = 0; j < 4; j++) {
            statRoll.push(PickANumber(1, 6));
        }
        //Drop lowest
        statRoll.sort(function(a, b){return a - b});
        statRoll.shift();
        statRoll.forEach(function(roll) {
            stat += roll
        });
        stats.push(stat);
    }

    //Leave sorted stat array for archetypes
    //stats.sort(function(a, b){return a - b});
    return stats;
}

class BaseCharacter{
    constructor() {
        this.level = 1;

        const statsArray = RNGesusStats();
        this.stats = {
            strength: statsArray[0],
            dexterity: statsArray[1],
            constitution: statsArray[2],
            intelligence: statsArray[3],
            wisdom: statsArray[4],
            charisma: statsArray[5],
        };

        //randomly generated fields (some based on race)
        this.age = "";
        this.gender = "";
        this.alignment = "";
        this.quirks = "";
        this.features = "";
        this.vices = "";
        this.virtues = "";
        this.ideals = "";
        this.className = "";

        //race fields
        this.charName = "";
        // this.stats = RNGesusStats(); //aka ability scores
        this.age = null;
        this.race = "";
        this.size = "";
        this.speed = "";

        //optional fields for DM to fill in
        // this.inspiration = "";
        // this.condition = "";
        // this.image = "";
        // this.equipment = "";
        // this.coins = "";
        // this.appearance = "";
        // this.notes = "";
    }
}

//races here add to the ability scores (stats) depending on the race
class Human extends BaseCharacter {
    
    //No arg CTOR
    constructor() {
        super();

        // Loop through each property and apply +1
        for (let key of Object.keys(this.stats)) {
            this.stats[key] += 1;
        }
          
        this.charName = "";
        this.age = PickANumber(14, 70);
        this.race = "Human";
        this.size = "Medium";
        this.speed = 30;
    }
}

class Dwarf extends BaseCharacter {
    
    //No arg CTOR
    constructor() {
        super();

        this.stats.constitution += 2;

        this.charName = "";
        this.age = PickANumber(30, 350);
        this.race = "Dwarf";
        this.size = "Medium";
        this.speed = 25;
    }
}

class Elf extends BaseCharacter {
    
    //No arg CTOR
    constructor() {
        super();

        this.stats.dexterity += 2;

        this.charName = "";
        this.age = PickANumber(75, 750);
        this.race = "Elf";
        this.size = "Medium";
        this.speed = 30;
    }
}

class Halfling extends BaseCharacter {
    
    //No arg CTOR
    constructor() {
        super();

        this.stats.dexterity += 2;

        this.charName = "";
        this.age = PickANumber(14, 150);
        this.race = "Halfling";
        this.size = "Small";
        this.speed = 25;
    }
}

class Gnome extends BaseCharacter {
    
    //No arg CTOR
    constructor() {
        super();

        this.stats.intelligence += 2;

        this.charName = "";
        this.age = PickANumber(25, 400);
        this.race = "Gnome";
        this.size = "Small";
        this.speed = 25;
    }
}

class Tiefling extends BaseCharacter {
    
    //No arg CTOR
    constructor() {
        super();

        this.charisma += 2;

        this.charName = "";
        this.age = PickANumber(14, 70);
        this.race = "Tiefling";
        this.size = "Medium";
        this.speed = 30;
    }
}

const racesArray = [Human, Dwarf, Elf, Halfling, Gnome, Tiefling];
const racesList = racesArray.map(r => new r().race);

// const racesArray = [Human, Dwarf, Elf, Halfing, Gnome, Tiefling];

// const racesList = [];
// racesArray.forEach(function(template) {
//     const instance = new template();
//     racesList.push(instance.race)
// });

// export { racesArray, racesList, BaseCharacter };


//================================= RNGesus =================================
//this module has functions to generate random number(s) and stats (ability scores), simulating dice rolls

const PickSeveralNumbers = (min, max, count) => {
    let severalNumbers = [];

    //Array of all possible numbers
    let allNumbers = [];
    for (let i = min; i <= max; i++) {
        allNumbers.push(i);
    }

    //Randomly select a number from allNumbers 'count' times
    for (let i = 0; i < count; i++) {
        let randomIndex = Math.floor(Math.random() * allNumbers.length);
        //Push that number to severalNumber
        severalNumbers.push(allNumbers[randomIndex]);
        //Remove that number from allNumbers to prevent repeats
        allNumbers.splice(randomIndex, 1);
    }
    return severalNumbers;
}

const randGen = () => {
    character = new BaseCharacter();
    //Pick a race (object + base character)
    const charTemplate = racesArray[PickANumber(0, racesArray.length - 1)];
    character = new charTemplate();
    
    //Set variables
    // character.stats = RNGesusStats();
    let twoQuirks = PickSeveralNumbers(0, quirks.length - 1, 2);
    let twoVices = PickSeveralNumbers(0, vices.length - 1, 2);
    let threeIdeals = PickSeveralNumbers(0, ideals.length - 1, 3);
    
    //This might be nested in individual races but it's here for now
    const pickAlignment = () => {
        let type = PickANumber(1, 2) > 1 ? "Lawful" : "Chaotic";
        let alignment = PickANumber(1, 10); 

        if (alignment <= 4) return type + "-Good";
        if (alignment >=5 && alignment <= 9) return type + "-Neutral";
        if (alignment === 10) return type + "-Evil";
        }
    
    const pickName = (gender, race) => {
        //Validation
        if (gender !== "Male" && gender !== "Female" || !racesList.includes(race)) {
            return "";
        }

        //Variables
        let first = "";
        let last = "";
        switch(race) {
            case "Human":
                first = (gender === "Male") ? humanMNames[PickANumber(0, humanMNames.length - 1)] : humanFNames[PickANumber(0, humanFNames.length - 1)];
                last = humanLastNames[PickANumber(0, humanLastNames.length - 1)];
                break;
            case "Elf":
                first = (gender === "Male") ? elvenMNames[PickANumber(0, elvenMNames.length - 1)] : elvenFNames[PickANumber(0, elvenFNames.length - 1)];
                last = elvenLastNames[PickANumber(0, elvenLastNames.length - 1)];
                break;
            case "Dwarf":
                first = (gender === "Male") ? dwarvenMNames[PickANumber(0, dwarvenMNames.length - 1)] : dwarvenFNames[PickANumber(0, dwarvenFNames.length - 1)];
                last = dwarvenLastNames[PickANumber(0, dwarvenLastNames.length - 1)];
                break;
            case "Halfling":
                first = (gender === "Male") ? halflingMNames[PickANumber(0, halflingMNames.length - 1)] : halflingFNames[PickANumber(0, halflingFNames.length - 1)];
                last = halflingLastNames[PickANumber(0, halflingLastNames.length - 1)];
                break;
            case "Gnome":
                first = (gender === "Male") ? gnomeMNames[PickANumber(0, gnomeMNames.length - 1)] : gnomeFNames[PickANumber(0, gnomeFNames.length - 1)];
                last = gnomeLastNames[PickANumber(0, gnomeLastNames.length - 1)];
                break;
            case "Tiefling":
                first = (gender === "Male") ? tieflingMNames[PickANumber(0, tieflingMNames.length - 1)] : tieflingFNames[PickANumber(0, tieflingFNames.length - 1)];
                last = tieflingVNames[PickANumber(0, tieflingVNames.length - 1)];
                break;
            // case "Orc":
            //     first = orcNames[PickANumber(0, orcNames.length - 1)];
            //     last = orcClans[PickANumber(0, orcClans.length - 1)];
            //     break;
            // case "Goblin":
            //     first = goblinNames[PickANumber(0, goblinNames.length - 1)];
            //     last = goblinClans[PickANumber(0, goblinClans.length - 1)];
            //     break;
            // case "Kobold":
            //     first = koboldNames[PickANumber(0, koboldClans.length - 1)];
            //     last = koboldClans[PickANumber(0, koboldClans.length - 1)];
            //     break;
            // case "Hobgoblin":
            //     first = hobgoblinNames[PickANumber(0, hobgoblinNames.length - 1)];
            //     last = hobgoblinClans[PickANumber(0, hobgoblinClans.length - 1)];
            //     break;
            // case "Bugbear":
            //     first = bugbearNames[PickANumber(0, bugbearNames.length - 1)];
            //     last = bugbearClans[PickANumber(0, bugbearClans.length - 1)];
            //     break;
            // case "Gnoll":
            //     first = Arrays.gnollNames[PickANumber(0, Arrays.gnollNames.length - 1)];
            //     last = Arrays.gnollClans[PickANumber(0, Arrays.gnollClans.length - 1)];
            //     break;
        }

        return first + " " + last;
    }
    
    const pickFeatures = (numFeatures, gender) => {
        let selectFeatures = gender === "Male" ? PickSeveralNumbers(2, features.length - 1, numFeatures) : PickSeveralNumbers(0, features.length - 4, numFeatures);
        let featureString = "";

        for (let i = 0; i < selectFeatures.length; i++) {
            if (Array.isArray(features[selectFeatures[i]])) {
                featureString += features[selectFeatures[i]][PickANumber(0, features[selectFeatures[i]].length - 1)];
            } else {
                featureString += features[selectFeatures[i]];
            }
            if (i < selectFeatures.length - 1) featureString += ", ";
        }
        return featureString;
    }
    character.gender = PickANumber(1, 2) > 1 ? "Male" : "Female";
    character.race = racesList[PickANumber(0, racesList.length - 1)];
    character.charName = pickName(character.gender, character.race);
    character.alignment = pickAlignment();
    character.quirks = quirks[twoQuirks[0]] + ", " + quirks[twoQuirks[1]];
    character.features = pickFeatures(2, character.gender);
    
    //Vice and virtue arrays are synced; needs code to add conflicted if virtue index === vice index
    character.vices = (character.alignment.split("-")[1] === "Good" && PickANumber(1, 10) === 10) ? "Uncorruptible" : `${vices[twoVices[0]]}, ${vices[twoVices[1]]}`;
    character.virtues = (character.alignment.split("-")[1] === "Evil" && PickANumber(1, 10) === 10) ? "Irredeemable" : `${virtues[PickANumber(0, virtues.length - 1)]}`;
    character.ideals = `${ideals[threeIdeals[0]]} > ${ideals[threeIdeals[1]]} > ${ideals[threeIdeals[2]]}`;
    character.className = classNames[PickANumber(0, classNames.length - 1)];
    return character;
}


//Vices and virtues are synched so if they match, the character will be conflicted
//replace with a character component for UI???????????
const characterToString = (character) => {
    if (!(character instanceof BaseCharacter)) {
        throw new Error("Character must extend BaseCharacter");
    }
    return `Name :     ${character.charName}\n` +
           `Age:       ${character.age}\n` +
           `Race:      ${character.race}\n` +
           `Gender:    ${character.gender}\n` +
           `Alignment: ${character.alignment}\n` +
           `Str: ${character.strength} Dex: ${character.dexterity} Con: ${character.constitution} Int: ${character.intelligence} Wis: ${character.wisdom} Cha: ${character.charisma}\n\n` +
           `Size:      ${character.size}\n` +
           `Speed:     ${character.speed}\n` +
           `Quirks:    ${character.quirks}\n` +
           `Features:  ${character.features}\n` +
           `Vices:     ${character.vices}\n` +
           `Virtues:   ${character.virtues}\n` +
           `Ideals:    ${character.ideals}\n`+
           `Class:     ${character.className}\n`;
}
export{randGen, characterToString};

console.log(randGen());