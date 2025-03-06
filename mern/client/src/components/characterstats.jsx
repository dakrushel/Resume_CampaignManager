/*=========================== 
*   Title: PlayerCharacterStats
*   Author: Grimm_mmirG
*   Date: 2025-25-01
=============================*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import SpellSlotTracker from "./spellslottracker";
import SpellModal from "./spellmodal";

const CharacterStats = ({ onClassSelect, characterLevel, onLevelChange, onAddSpell, selectedSpells }) => {
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [spellSlots, setSpellSlots] = useState({});
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState(null);
  const [spellsByLevel, setSpellsByLevel] = useState({});
  const [error, setError] = useState(null);

  const [baseStats, setBaseStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const [character, setCharacter] = useState({
    name: "",
    alignment: "",
    race: "",
    class: "",
    speed: 0,
    hitDice: "",
    proficiencies: [],
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    size: "",
    size_description: "",
    languages: [],
    language_desc: "",
    traits: [],
    startingProficiencies: [],
    classProficiencies: [],
    level: 1, // Default level
    classFeatures: [],
  });

  const [showRaceDetails, setShowRaceDetails] = useState(false);
  const [showClassProficiencies, setShowClassProficiencies] = useState(false);
  const [showClassFeatures, setShowClassFeatures] = useState(false);

  // Fetch races and classes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [raceRes, classRes] = await Promise.all([
          axios.get("https://www.dnd5eapi.co/api/races"),
          axios.get("https://www.dnd5eapi.co/api/classes"),
        ]);
        setRaces(raceRes.data.results);
        setClasses(classRes.data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle race change
  const handleRaceChange = async (index) => {
    if (index === "") {
      setSelectedRace(null);
      setCharacter((prev) => ({
        ...prev,
        race: "",
        speed: 0,
        size: "",
        size_description: "",
        languages: [],
        language_desc: "",
        traits: [],
        stats: baseStats,
      }));
      return;
    }

    const raceDetails = await axios.get(`https://www.dnd5eapi.co/api/races/${index}`);
    setSelectedRace(raceDetails.data);
    setCharacter((prev) => ({
      ...prev,
      race: raceDetails.data.name,
      speed: raceDetails.data.speed,
      size: raceDetails.data.size,
      size_description: raceDetails.data.size_description,
      languages: raceDetails.data.languages.map((lang) => lang.name),
      language_desc: raceDetails.data.language_desc,
      traits: raceDetails.data.traits.map((trait) => trait.name),
      stats: { ...baseStats },
    }));
    applyRaceBonuses(raceDetails.data.ability_bonuses);
  };

  // Handle class change
  const handleClassChange = async (index) => {
    if (!index) {
      setSelectedClass(null);
      setCharacter((prev) => ({
        ...prev,
        class: "",
        hitDice: "",
        proficiencies: [],
        startingProficiencies: [],
        classProficiencies: [],
        classFeatures: [],
      }));
      onClassSelect("");
      return;
    }

    const classDetails = await axios.get(`https://www.dnd5eapi.co/api/classes/${index}`);
    setSelectedClass(classDetails.data.index);
    setCharacter((prev) => ({
      ...prev,
      class: classDetails.data.name,
      hitDice: `d${classDetails.data.hit_die}`,
      proficiencies: classDetails.data.proficiencies.map((p) => p.name),
      startingProficiencies: classDetails.data.proficiencies.map((p) => p.name),
      classProficiencies: classDetails.data.proficiency_choices.map((p) => p.desc),
    }));
    onClassSelect(classDetails.data.index);
  };

  // Apply race ability score bonuses
  const applyRaceBonuses = (abilityBonuses) => {
    const statMap = {
      str: "strength",
      dex: "dexterity",
      con: "constitution",
      int: "intelligence",
      wis: "wisdom",
      cha: "charisma",
    };
    const updatedStats = { ...baseStats };
    (abilityBonuses || []).forEach((bonus) => {
      const statKey = statMap[bonus.ability_score.index];
      if (statKey && updatedStats[statKey] !== undefined) {
        updatedStats[statKey] += bonus.bonus;
      }
    });

    setCharacter((prev) => ({
      ...prev,
      stats: updatedStats,
    }));
  };

  // Handle manual stat changes
  const handleStatChange = (stat, value) => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: parseInt(value) || 0,
      },
    }));
    setBaseStats((prev) => ({
      ...prev,
      [stat]: parseInt(value) || 0,
    }));
  };

  /* spell slots for a specific level wizard is the only implemented class currently */
  const wizardSpellSlots = {
    1:  { 0: 3, 1: 2 },
    2:  { 0: 3, 1: 3 },
    3:  { 0: 3, 1: 4, 2: 2 },
    4:  { 0: 4, 1: 4, 2: 3 },
    5:  { 0: 4, 1: 4, 2: 3 },
    6:  { 0: 4, 1: 4, 2: 3, 3: 2 },
    7:  { 0: 4, 1: 4, 2: 3, 3: 3 }, 
    8:  { 0: 4, 1: 4, 2: 3, 3: 3, 4: 1 }, 
    9:  { 0: 4, 1: 4, 2: 3, 3: 3, 4: 2 },
    10: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 }, 
    11: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    12: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    13: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, 
    14: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, 
    15: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, 
    16: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, 
    17: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
    18: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 }, 
    19: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 }, 
    20: { 0: 5, 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }, 
  };
  
  /* Calculate remaining spell slots for a specific level */
  const calculateRemainingSpellPoints = (level) => {
    const spellSlots = wizardSpellSlots[characterLevel] || {};
    const maxSpellPoints = spellSlots[level] || 0;
    const usedSpellPoints = selectedSpells.filter((spell) => spell.level === level).length;
    return maxSpellPoints - usedSpellPoints;
  };

  /* Update spell slots when character level or class changes adding more once approved  */
  useEffect(() => {
    if (selectedClass === "wizard") {
      setSpellSlots(wizardSpellSlots[characterLevel] || {});
    } else {
      setSpellSlots({});
    }
  }, [selectedClass, characterLevel]);

  const handleAddSpell = (spell) => {
    const updatedSpells = [...selectedSpells, { ...spell, level: selectedSpellLevel }];
    onAddSpell(updatedSpells); 
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSpells = async () => {
      try {
        const response = await fetch(`https://www.dnd5eapi.co/api/classes/${selectedClass}/spells`);
        if (!response.ok) throw new Error("Failed to fetch spells");
        const data = await response.json();
        const spellDetails = await Promise.all(
          (data.results || []).map(async (spell) => {
            const spellResponse = await fetch(`https://www.dnd5eapi.co${spell.url}`);
            if (!spellResponse.ok) throw new Error("Failed to fetch spell details");
            return spellResponse.json();
          })
        );        
          
        if (isMounted) {
          const groupedSpells = spellDetails.reduce((acc, spell) => {
            acc[spell.level] = acc[spell.level] || [];
            acc[spell.level].push(spell);
            return acc;
          }, {});
          setSpellsByLevel(groupedSpells);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching spells:", error);
        }
      }
    };   
    if (selectedClass) {
      fetchSpells();
    }   
    return () => { isMounted = false };
  }, [selectedClass]);

  /* Spending a spell slot */
  const handleSpendSlot = (level) => {
    setSelectedSpellLevel(level);
    setIsSpellModalOpen(true);
  };

  useEffect(() => {
    if (isSpellModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isSpellModalOpen]);

// Handle level change
const handleLevelChange = async (newLevel) => {
  setCharacter((prev) => ({
    ...prev,
    level: newLevel,
  }));
  onLevelChange(newLevel);

  if (selectedClass) {
    await fetchClassFeatures(selectedClass, newLevel);  //aparent that still works despite being out of scope...
  }
};

// Fetch class features
useEffect(() => {
  const abortController = new AbortController();

  const fetchClassFeatures = async (classIndex, level) => {
    try {
      const features = [];
      for (let i = 1; i <= level; i++) {
        const response = await axios.get(`https://www.dnd5eapi.co/api/2014/classes/${classIndex}/levels/${i}`, {
          signal: abortController.signal,
        });
        if (response.data.features) {
          features.push(...response.data.features.map((feature) => `Level ${i}: ${feature.name}`));
        }
      }

      setCharacter((prev) => ({
        ...prev,
        classFeatures: features,
      }));
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching class features:", error);
        setError("Failed to load class features. Please try again later.");
      }
    }
  };

  if (selectedClass) {
    fetchClassFeatures(selectedClass, character.level);
  }

  return () => {
    abortController.abort();
  };
}, [selectedClass, character.level]);

const inputBoxStyle = "rounded-lg outline-none bg-cream placeholder-yellow-700 w-full p-3 transition-colors"

return (
  <div className="p-6 max-w-6xl mx-auto bg-cream rounded-lg shadow-md shadow-amber-800 grid grid-cols-1 md:grid-cols-4 gap-6 text-brown">
    {/* Left Section - Race Details */}
    <div className="bg-light-tan p-6 rounded-lg shadow-md shadow-amber-800 col-span-1">
      <h2
        className="text-xl font-bold mb-4 cursor-pointer"
        onClick={() => setShowRaceDetails(!showRaceDetails)}
      >
        Race Details {showRaceDetails ? "▼" : "▲"}
      </h2>
      {showRaceDetails && (
        <div className="space-y-3">
          <p><strong>Size:</strong> {character.size}</p>
          <p><strong>Size Description:</strong> {character.size_description}</p>
          <p><strong>Languages:</strong> {character.languages.join(", ")}</p>
          <p><strong>Language Description:</strong> {character.language_desc}</p>
          <p><strong>Traits:</strong> {character.traits.join(", ")}</p>
        </div>
      )}
    </div>

    {/* Main Character Sheet Form */}
    <div className="bg-light-tan p-6 rounded-lg shadow-md shadow-amber-800 col-span-2">
      <h1 className="text-3xl font-bold mb-6 sancreek-regular">D&D Character Sheet</h1>
      <form className="space-y-6">
        {/* Character Name Input */}
        <div>
          <label className="block text-lg font-medium mb-2">Name:</label>
          <input
            type="text"
            className={inputBoxStyle}
            value={character.name}
            onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            placeholder="Enter character name"
          />
        </div>

        {/* Race Dropdown */}
        <div>
          <label className="block text-lg font-medium mb-2">Race:</label>
          <select
            className={inputBoxStyle}
            onChange={(e) => handleRaceChange(e.target.value || "")}
          >
            <option value="">Select a Race</option>
            {races.map((race) => (
              <option key={race.index} value={race.index}>
                {race.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Dropdown */}
        <div>
          <label className="block text-lg font-medium mb-2">Class:</label>
          <select
            className={inputBoxStyle}
            onChange={(e) => handleClassChange(e.target.value || "")}
          >
            <option value="">Select a Class</option>
            {classes.map((cls) => (
              <option key={cls.index} value={cls.index}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Input */}
        <div>
          <label className="block text-lg font-medium mb-2">Level:</label>
          <input
            type="number"
            className={inputBoxStyle}
            value={characterLevel}
            onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
          />
        </div>

        {/* Spell Slot Tracker */}
        <SpellSlotTracker spellSlots={spellSlots} onSpendSlot={handleSpendSlot} />

        {/* Spell Modal */}
        {isSpellModalOpen && (
          <SpellModal
            level={selectedSpellLevel}
            spells={spellsByLevel[selectedSpellLevel] || []}
            onAddSpell={handleAddSpell}
            onClose={() => setIsSpellModalOpen(false)}
            remainingSpellPoints={calculateRemainingSpellPoints(selectedSpellLevel)}
            selectedSpells={selectedSpells}
          />
        )}

        {/* Stats Inputs */}
        <div>
          <label className="block text-lg font-medium mb-2">Stats:</label>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(character.stats).map((stat) => (
              <div key={stat}>
                <label className="block text-sm font-medium mb-1">
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}:
                </label>
                <input
                  type="number"
                  className={inputBoxStyle}
                  value={character.stats[stat]}
                  onChange={(e) => handleStatChange(stat, e.target.value)}
                  placeholder={`Enter ${stat}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Speed and Passive Perception Inputs */}
        <div className="flex items-center space-x-6">
          <div>
            <label className="block text-sm font-medium mb-1">Speed:</label>
            <input
              type="text"
              className={inputBoxStyle}
              value={character.speed}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passive Perception:</label>
            <input
              type="text"
              className={inputBoxStyle}
              value={10 + Math.floor((character.stats.wisdom - 10) / 2)}
              readOnly
            />
          </div>
        </div>

        {/* Hit Dice Input */}
        <div>
          <label className="block text-lg font-medium mb-2">Hit Dice:</label>
          <input
            type="text"
            className={inputBoxStyle}
            value={character.hitDice}
            readOnly
          />
        </div>
      </form>
    </div>
  
      {/* Right Section - Class Proficiencies and Features */}
      <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
        {/* Class Proficiencies */}
        <div className="mb-6">
          <h2
            className="text-xl font-bold mb-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
            onClick={() => setShowClassProficiencies(!showClassProficiencies)}
          >
            Class Proficiencies {showClassProficiencies ? "▼" : "▲"}
          </h2>
          {showClassProficiencies && (
            <div className="space-y-3 text-gray-700">
              <p><strong className="text-gray-800">Starting Proficiencies:</strong> {character.startingProficiencies.join(", ")}</p>
              <p><strong className="text-gray-800">Class Proficiency Choices:</strong> {character.classProficiencies.join(", ")}</p>
            </div>
          )}
        </div>
  
        {/* Class Features */}
        <div>
          <h2
            className="text-xl font-bold mb-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
            onClick={() => setShowClassFeatures(!showClassFeatures)}
          >
            Class Features {showClassFeatures ? "▼" : "▲"}
          </h2>
          {showClassFeatures && (
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {character.classFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};  

export default CharacterStats;