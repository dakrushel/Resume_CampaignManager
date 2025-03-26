/*====================================
*   Title: Character Main Display Page
*   Author: Grimm_mmirG
*   Date: 2025-26-02
======================================*/

import { useState } from "react";
import CharacterStats from "./characterstats";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import { PropTypes } from "prop-types";

const CharacterDisplay = ({ character, isNew, onCancel, refreshCharacters }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [characterLevel, setCharacterLevel] = useState(1);
  const token = useAuthToken(); // Get the authentication token

  return (
    <div>
      {/* Render the CharacterStats component */}
      <CharacterStats
        onClassSelect={setSelectedClass}
        characterLevel={characterLevel}
        onLevelChange={setCharacterLevel}
        displayedCharacter={character}
        token={token}
        isNew={isNew}
        onCancel={onCancel}
        refreshCharacters={refreshCharacters}  // Pass it down
      />

    </div>
  );
};

CharacterDisplay.propTypes = {
  character: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    selectedSpells: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        school: PropTypes.shape({
          name: PropTypes.string.isRequired,
        }).isRequired,
      })
    ),
  }).isRequired,
  isNew: PropTypes.bool,
  onCancel: PropTypes.func,
  refreshCharacters: PropTypes.func.isRequired,
};

export default CharacterDisplay;