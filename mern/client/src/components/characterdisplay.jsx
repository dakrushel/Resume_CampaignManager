/*====================================
*   Title: Character Main Display Page
*   Author: Grimm_mmirG
*   Date: 2025-26-02
======================================*/

import { useState } from "react";
import CharacterStats from "./characterstats";

const CharacterDisplay = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [characterLevel, setCharacterLevel] = useState(1);

  return (
    <div>
      {/* Render the CharacterStats component */}
      <CharacterStats
        onClassSelect={setSelectedClass}
        characterLevel={characterLevel}
        onLevelChange={setCharacterLevel}
      />
    </div>
  );
};

export default CharacterDisplay;