/*====================================
*   Title: Character Main Display Page
*   Author: Grimm_mmirG
*   Date: 2025-26-02
======================================*/

import { useState } from "react";
import CharacterStats from "./characterstats";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import { PropTypes } from "prop-types";

const CharacterDisplay = ({
  character,
  isNew,
  onCancel,
  refreshCharacters,
  campaignID,
}) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [characterLevel, setCharacterLevel] = useState(character?.level || 1);
  const token = useAuthToken();

  // Initialize spell state from character props or defaults
  const [spellSlots, setSpellSlots] = useState(character?.spellSlots || {});
  const [usedSlots, setUsedSlots] = useState(character?.usedSlots || {});
  const [preparedSpells, setPreparedSpells] = useState(
    character?.selectedSpells?.filter((s) => s.level > 0) || []
  );
  const [knownCantrips, setKnownCantrips] = useState(
    character?.selectedSpells?.filter((s) => s.level === 0) || []
  );

  if (!character) {
    return <div className="mt-16 p-6 text-center">Loading character...</div>;
  }

  const handleSpendSlot = (level) => {
    setUsedSlots((prev) => ({
      ...prev,
      [level]: (prev[level] || 0) + 1,
    }));
  };

  const handleResetSlots = () => {
    setUsedSlots({});
  };

  return (
    <div className="mt-16">
      <CharacterStats
        campaignID={campaignID}
        onClassSelect={setSelectedClass}
        characterLevel={characterLevel}
        onLevelChange={setCharacterLevel}
        displayedCharacter={{
          ...character,
          campaignID: campaignID,
          // Ensure classFeatures are in the correct format
          classFeatures: character.classFeatures?.map((f) =>
            typeof f === "string" ? f : f.name
          ),
        }}
        token={token}
        isNew={isNew}
        onCancel={onCancel}
        refreshCharacters={refreshCharacters}
        // Spell-related props
        spellSlots={spellSlots}
        usedSlots={usedSlots}
        onSpendSlot={handleSpendSlot}
        onResetSlots={handleResetSlots}
        preparedSpells={preparedSpells}
        knownCantrips={knownCantrips}
        onPrepareSpell={setPreparedSpells}
        onUnprepareSpell={(spell) => {
          setPreparedSpells((prev) =>
            prev.filter((s) => s.index !== spell.index)
          );
        }}
        onLearnCantrip={setKnownCantrips}
        onForgetCantrip={(cantrip) => {
          setKnownCantrips((prev) =>
            prev.filter((c) => c.index !== cantrip.index)
          );
        }}
      />
    </div>
  );
};

CharacterDisplay.propTypes = {
  character: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    race: PropTypes.string,
    class: PropTypes.string,
    level: PropTypes.number,
    alignment: PropTypes.string,
    stats: PropTypes.shape({
      strength: PropTypes.number,
      dexterity: PropTypes.number,
      constitution: PropTypes.number,
      intelligence: PropTypes.number,
      wisdom: PropTypes.number,
      charisma: PropTypes.number,
    }),
    campaignID: PropTypes.string.isRequired,
    speed: PropTypes.number,
    hitDice: PropTypes.string,
    proficiencies: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.string,
    size_description: PropTypes.string,
    languages: PropTypes.arrayOf(PropTypes.string),
    language_desc: PropTypes.string,
    traits: PropTypes.arrayOf(PropTypes.string),
    startingProficiencies: PropTypes.arrayOf(PropTypes.string),
    classProficiencies: PropTypes.arrayOf(PropTypes.string),
    classFeatures: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          index: PropTypes.string,
          name: PropTypes.string,
          url: PropTypes.string,
          level: PropTypes.number,
        }),
      ])
    ),
    selectedSpells: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        school: PropTypes.string,
        desc: PropTypes.string,
        index: PropTypes.string,
      })
    ),
    spellSlots: PropTypes.object,
    usedSlots: PropTypes.object,
  }).isRequired,
  isNew: PropTypes.bool,
  onCancel: PropTypes.func,
  refreshCharacters: PropTypes.func.isRequired,
  campaignID: PropTypes.string.isRequired,
};

export default CharacterDisplay;
