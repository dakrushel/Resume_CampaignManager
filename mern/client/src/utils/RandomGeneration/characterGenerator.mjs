import * as Arrays from './arrays.mjs';
import { racesArray, racesList, BaseCharacter } from './races.mjs';
import { PickANumber, PickSeveralNumbers } from './rnGesus.mjs';

//rnGesus > (races and class) and arrays > characterGenerator > return character 
//generates random race, quirks, vices, virtues, ideals, alignment, name, features, class, gender
//call and return this to src/components character component to write to database as needed
const randGen = () => {
    //Pick a race (object + base character)
    const charTemplate = racesArray[PickANumber(0, racesArray.length - 1)];
    const character = new charTemplate();
    
    //Set variables
    // character.stats = RNGesusStats();
    let twoQuirks = PickSeveralNumbers(0, Arrays.quirks.length - 1, 2);
    let twoVices = PickSeveralNumbers(0, Arrays.vices.length - 1, 2);
    let threeIdeals = PickSeveralNumbers(0, Arrays.ideals.length - 1, 3);
    
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
                first = (gender === "Male") ? Arrays.humanMNames[PickANumber(0, Arrays.humanMNames.length - 1)] : Arrays.humanFNames[PickANumber(0, Arrays.humanFNames.length - 1)];
                last = Arrays.humanLastNames[PickANumber(0, Arrays.humanLastNames.length - 1)];
                break;
            case "Elf":
                first = (gender === "Male") ? Arrays.elvenMNames[PickANumber(0, Arrays.elvenMNames.length - 1)] : Arrays.elvenFNames[PickANumber(0, Arrays.elvenFNames.length - 1)];
                last = Arrays.elvenLastNames[PickANumber(0, Arrays.elvenLastNames.length - 1)];
                break;
            case "Dwarf":
                first = (gender === "Male") ? Arrays.dwarvenMNames[PickANumber(0, Arrays.dwarvenMNames.length - 1)] : Arrays.dwarvenFNames[PickANumber(0, Arrays.dwarvenFNames.length - 1)];
                last = Arrays.dwarvenLastNames[PickANumber(0, Arrays.dwarvenLastNames.length - 1)];
                break;
            case "Halfling":
                first = (gender === "Male") ? Arrays.halflingMNames[PickANumber(0, Arrays.halflingMNames.length - 1)] : Arrays.halflingFNames[PickANumber(0, Arrays.halflingFNames.length - 1)];
                last = Arrays.halflingLastNames[PickANumber(0, Arrays.halflingLastNames.length - 1)];
                break;
            case "Gnome":
                first = (gender === "Male") ? Arrays.gnomeMNames[PickANumber(0, Arrays.gnomeMNames.length - 1)] : Arrays.gnomeFNames[PickANumber(0, Arrays.gnomeFNames.length - 1)];
                last = Arrays.gnomeLastNames[PickANumber(0, Arrays.gnomeLastNames.length - 1)];
                break;
            case "Tiefling":
                first = (gender === "Male") ? Arrays.tieflingMNames[PickANumber(0, Arrays.tieflingMNames.length - 1)] : Arrays.tieflingFNames[PickANumber(0, Arrays.tieflingFNames.length - 1)];
                last = Arrays.tieflingVNames[PickANumber(0, Arrays.tieflingVNames.length - 1)];
                break;
            // case "Orc":
            //     first = Arrays.orcNames[PickANumber(0, Arrays.orcNames.length - 1)];
            //     last = Arrays.orcClans[PickANumber(0, Arrays.orcClans.length - 1)];
            //     break;
            // case "Goblin":
            //     first = Arrays.goblinNames[PickANumber(0, Arrays.goblinNames.length - 1)];
            //     last = Arrays.goblinClans[PickANumber(0, Arrays.goblinClans.length - 1)];
            //     break;
            // case "Kobold":
            //     first = Arrays.koboldNames[PickANumber(0, Arrays.koboldClans.length - 1)];
            //     last = Arrays.orcClans[PickANumber(0, Arrays.orcClans.length - 1)];
            //     break;
            // case "Hobgoblin":
            //     first = Arrays.hobgoblinNames[PickANumber(0, Arrays.hobgoblinNames.length - 1)];
            //     last = Arrays.hobgoblinClans[PickANumber(0, Arrays.hobgoblinClans.length - 1)];
            //     break;
            // case "Bugbear":
            //     first = Arrays.bugbearNames[PickANumber(0, Arrays.bugbearNames.length - 1)];
            //     last = Arrays.bugbearClans[PickANumber(0, Arrays.bugbearClans.length - 1)];
            //     break;
            // case "Gnoll":
            //     first = Arrays.gnollNames[PickANumber(0, Arrays.gnollNames.length - 1)];
            //     last = Arrays.gnollClans[PickANumber(0, Arrays.gnollClans.length - 1)];
            //     break;
        }
        return first + " " + last;
    }
    const pickFeatures = (numFeatures) => {
        let selectFeatures = character.gender === "Male" ? PickSeveralNumbers(2, Arrays.features.length - 1, numFeatures) : PickSeveralNumbers(0, Arrays.features.length - 4, numFeatures);
        let featureString = "";

        for (let i = 0; i < selectFeatures.length; i++) {
            if (Array.isArray(Arrays.features[selectFeatures[i]])) {
                featureString += Arrays.features[selectFeatures[i]][PickANumber(0, Arrays.features[selectFeatures[i]].length - 1)];
            } else {
                featureString += Arrays.features[selectFeatures[i]];
            }
            if (i < selectFeatures.length - 1) featureString += ", ";
        }
        return featureString;
    }




    // character.race = Arrays.races[PickANumber(0, Arrays.races.length - 1)];
    character.gender = PickANumber(1, 2) > 1 ? "Male" : "Female";
    character.charName = pickName(character.gender, character.race);
    character.alignment = pickAlignment();
    character.quirks = Arrays.quirks[twoQuirks[0]] + ", " + Arrays.quirks[twoQuirks[1]];
    character.features = pickFeatures(2);
    
    //Vice and virtue arrays are synced; needs code to add conflicted if virtue index === vice index
    character.vices = (character.alignment.split("-")[1] === "Good" && PickANumber(1, 10) === 10) ? "Uncorruptible" : `${Arrays.vices[twoVices[0]]}, ${Arrays.vices[twoVices[1]]}`;
    character.virtues = (character.alignment.split("-")[1] === "Evil" && PickANumber(1, 10) === 10) ? "Irredeemable" : `${Arrays.virtues[PickANumber(0, Arrays.virtues.length - 1)]}`;
    character.ideals = `${Arrays.ideals[threeIdeals[0]]} > ${Arrays.ideals[threeIdeals[1]]} > ${Arrays.ideals[threeIdeals[2]]}`;
    character.className = Arrays.classNames[PickANumber(0, Arrays.classNames.length - 1)];
    return character;
}


//Vices and virtues are synched so if they match, the character will be conflicted
//replace with a character component for UI???????????
const characterToString = (character) => {
    if (!(character instanceof BaseCharacter)) {
        throw new Error("Character must extend BaseCharacter");
    }
    return `Name:      ${character.charName}\n` +
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

const test = randGen();
console.log(randGen());