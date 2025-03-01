/*=============================================
*   Title: Player Character Stats Logic (Heavy)
*   Author: Grimm_mmirG
*   Date: 2025-26-02
===============================================*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import SpellSlotTracker from "./spellslottracker";
import SpellModal from "./spellmodal";
import { wizardSpellSlots } from "./spelldata";

{/* CharacterStats use states, spells included */}
const CharacterStats = ({ onClassSelect, characterLevel, onLevelChange }) => {
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [spellSlots, setSpellSlots] = useState({});
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState(null);
  const [spellsByLevel, setSpellsByLevel] = useState({});
  const [error, setError] = useState(null);
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [selectedSpellForDescription, setSelectedSpellForDescription] = useState(null); // Track selected spell for description

  {/* Base Stats for character */}
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

  {/* Fetch races and classes on mount */} 
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

  /* Handle race change */ 
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
  
  {/* Fetch the race details from DnDAPI */}
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

  /* Handle class change */
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

      {/* Fetch the class details from DnDAPI */}
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

  /* Apply race ability score bonuses when race is chosen */ 
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

  /* Handle manual stat changes for player input */ 
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

  /* Calculate remaining spell slots for a specific level */
  const calculateRemainingSpellPoints = (level) => {
    const spellSlots = wizardSpellSlots[characterLevel] || {};
    const maxSpellPoints = spellSlots[level] || 0;
    const usedSpellPoints = selectedSpells.filter((spell) => spell.level === level).length;
    return maxSpellPoints - usedSpellPoints;
  };

  /* Update spell slots when character level or class changes */
  useEffect(() => {
    if (selectedClass === "wizard") {
      setSpellSlots(wizardSpellSlots[characterLevel] || {});
    } else {
      setSpellSlots({});
    }
  }, [selectedClass, characterLevel]);

  /* Add a spell to the selected spells list and reduce spell slots */
  const addSpellToCharacter = (spell) => {
    /* Check if the spell is already in the selected spells list */ 
    const isSpellAlreadyAdded = selectedSpells.some(
      (selectedSpell) => selectedSpell.name === spell.name
    );
    /* Alert if the selected spell is already chosen */
    if (isSpellAlreadyAdded) {
      alert(`You can only add one instance of ${spell.name}.`);
      return;
    }

    /* Logic for calculating remainign spell points */
    const remainingPoints = calculateRemainingSpellPoints(spell.level);
    if (remainingPoints > 0) {
      setSelectedSpells((prev) => [...prev, spell]);
      setSpellSlots((prev) => ({
        ...prev,
        [spell.level]: (prev[spell.level] || 0) - 1,
      }));
    } else {
      alert(`No remaining spell points for level ${spell.level} spells.`);
    }
  };

  /* Remove a spell from the selected spells list and restore spell slots */
  const removeSpellFromCharacter = (spellIndex) => {
    const spellToRemove = selectedSpells[spellIndex];
    setSelectedSpells((prev) => prev.filter((_, index) => index !== spellIndex));
    setSpellSlots((prev) => ({
      ...prev,
      [spellToRemove.level]: (prev[spellToRemove.level] || 0) + 1,
    }));
  };

  /* Fetch all spells from the selected class if the selected class has access to spells */
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
    return () => {
      isMounted = false;
    };
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

  {/* Spell description names need their own return code */}
  const SpellDescriptionModal = ({ spell, onClose }) => {
    if (!spell) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-xl mb-4">{spell.name}</h3>
          <p className="text-gray-700">{spell.desc || "No description available."}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  /* Handle level change */
  const handleLevelChange = async (newLevel) => {
    setCharacter((prev) => ({
      ...prev,
      level: newLevel,
    }));
    onLevelChange(newLevel);

    if (selectedClass) {
      await fetchClassFeatures(selectedClass, newLevel);
    }
  };

  /* Fetch class features into the list when level changes*/
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

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Section - Race Details */}
      <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
        <h2
          className="text-xl font-bold mb-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
          onClick={() => setShowRaceDetails(!showRaceDetails)}
        >
          Race Details {showRaceDetails ? "▼" : "▲"}
        </h2>
        {showRaceDetails && (
          <div className="space-y-3 text-gray-700">
            <p><strong className="text-gray-800">Size:</strong> {character.size}</p>
            <p><strong className="text-gray-800">Size Description:</strong> {character.size_description}</p>
            <p><strong className="text-gray-800">Languages:</strong> {character.languages.join(", ")}</p>
            <p><strong className="text-gray-800">Language Description:</strong> {character.language_desc}</p>
            <p><strong className="text-gray-800">Traits:</strong> {character.traits.join(", ")}</p>
          </div>
        )}
      </div>

      {/* Main Character Sheet Form */}
      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">D&D Character Sheet</h1>
        <form className="space-y-6">
          {/* Character Name Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Name:</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
              value={character.name}
              onChange={(e) => setCharacter({ ...character, name: e.target.value })}
              placeholder="Enter character name"
            />
          </div>

          {/* Race Dropdown */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Race:</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
              onChange={(e) => handleRaceChange(e.target.value || "")}
            >
              <option value="">Select a Race</option>
              {races.map((race) => (
                <option key={race.index} value={race.index} className="text-gray-700">
                  {race.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Dropdown */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Class:</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
              onChange={(e) => handleClassChange(e.target.value || "")}
            >
              <option value="">Select a Class</option>
              {classes.map((cls) => (
                <option key={cls.index} value={cls.index} className="text-gray-700">
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Level:</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
              value={characterLevel}
              onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
          </div>

          {/* Spell Slot Tracker */}
          <SpellSlotTracker
            spellSlots={spellSlots}
            onSpendSlot={handleSpendSlot}
          />

          {/* Spell Modal */}
          {isSpellModalOpen && (
            <SpellModal
              level={selectedSpellLevel}
              spells={spellsByLevel[selectedSpellLevel] || []}
              onAddSpell={addSpellToCharacter}
              onClose={() => setIsSpellModalOpen(false)}
              remainingSpellPoints={calculateRemainingSpellPoints(selectedSpellLevel)}
              selectedSpells={selectedSpells}
            />
          )}

          {/* Display Selected Spells */}
          <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">Selected Spells</h2>
            {/* Display Remaining Spell Points for Each Level */}
            {Object.keys(spellSlots).map((level) => (
              <div key={level} className="mb-4">
                <h3 className="font-bold">Level {level} Spells</h3>
                <p>Remaining Points: {calculateRemainingSpellPoints(parseInt(level))}</p>
              </div>
            ))}
            {/* Display Selected Spells */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSpells.map((spell, index) => (
                <div key={index} className="p-4 border rounded shadow flex justify-between items-center">
                  <div>
                    <h3
                      className="font-bold cursor-pointer hover:text-blue-600"
                      onClick={() => setSelectedSpellForDescription(spell)}
                    >
                      {spell.name}
                    </h3>
                    <p>Level: {spell.level}</p>
                    <p>School: {spell.school.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpellFromCharacter(index)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Spell Description Modal */}
          {selectedSpellForDescription && (
            <SpellDescriptionModal
              spell={selectedSpellForDescription}
              onClose={() => setSelectedSpellForDescription(null)}
            />
          )}

          {/* Stats Inputs */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Stats:</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(character.stats).map((stat) => (
                <div key={stat}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}:
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Speed:</label>
              <input
                type="text"
                className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                value={character.speed}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Passive Perception:</label>
              <input
                type="text"
                className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                value={10 + Math.floor((character.stats.wisdom - 10) / 2)}
                readOnly
              />
            </div>
          </div>

          {/* Hit Dice Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Hit Dice:</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
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