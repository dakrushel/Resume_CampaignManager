/*=============================================
*   Title: Player Character Stats Logic (Heavy)
*   Author: Grimm_mmirG
*   Date: 2025-26-02
===============================================*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import SpellSlotTracker from "./spellslottracker";
import SpellModal from "./spellmodal";
import {
  wizardSpellSlots,
  sorcerorSpellSlots,
  bardSpellSlots,
  druidSpellSlots,
  paladinSpellSlots,
  clericSpellSlots,
} from "./spelldata";
import PropTypes from "prop-types";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import { createCharacter, modifyCharacter } from "./characterAPIs/pcMongoAPIs";

{
  /* CharacterStats use states, spells included */
}
// Modified component signature
const CharacterStats = ({
  onClassSelect,
  characterLevel,
  onLevelChange,
  displayedCharacter,
  isNew,
  onCancel,
  refreshCharacters,
}) => {
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
  const [selectedSpellForDescription, setSelectedSpellForDescription] =
    useState(null);
  const [initialCharacter, setInitialCharacter] = useState({});
  const [saving, setSaving] = useState(false);
  const token = useAuthToken();

  // Base Stats for character
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
    alignment: "Neutral",
    race: "",
    class: "",
    speed: 0,
    hitDice: "",
    proficiencies: [],
    stats: { ...baseStats },
    size: "",
    size_description: "",
    languages: [],
    language_desc: "",
    traits: [],
    startingProficiencies: [],
    classProficiencies: [],
    level: 1,
    classFeatures: [],
  });

  const [showRaceDetails, setShowRaceDetails] = useState(false);
  const [showClassProficiencies, setShowClassProficiencies] = useState(false);
  const [showClassFeatures, setShowClassFeatures] = useState(false);

  // Form input styling
  const formStyle =
    "w-full p-3 border border-brown rounded-lg outline-none bg-cream focus:shadow-amber-800 placeholder-yellow-700 focus:shadow-sm transition-colors";

  // New useEffect for initialization
  useEffect(() => {
    if (displayedCharacter && Object.keys(displayedCharacter).length > 0) {
      setCharacter(displayedCharacter);
      setInitialCharacter(displayedCharacter);
      if (displayedCharacter.selectedSpells) {
        setSelectedSpells(displayedCharacter.selectedSpells);
      }
      if (displayedCharacter.class) {
        setSelectedClass(displayedCharacter.class.toLowerCase());
      }
    }
  }, [displayedCharacter]);

  {
    /* Fetch races and classes on mount */
  }
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

    {
      /* Fetch the race details from DnDAPI */
    }
    const raceDetails = await axios.get(
      `https://www.dnd5eapi.co/api/races/${index}`
    );
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

    {
      /* Fetch the class details from DnDAPI */
    }
    const classDetails = await axios.get(
      `https://www.dnd5eapi.co/api/classes/${index}`
    );
    setSelectedClass(classDetails.data.index);
    setCharacter((prev) => ({
      ...prev,
      class: classDetails.data.name,
      hitDice: `d${classDetails.data.hit_die}`,
      proficiencies: classDetails.data.proficiencies.map((p) => p.name),
      startingProficiencies: classDetails.data.proficiencies.map((p) => p.name),
      classProficiencies: classDetails.data.proficiency_choices.map(
        (p) => p.desc
      ),
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
    const spellSlots = getClassSpellSlots(selectedClass, characterLevel);
    const maxSpellPoints = spellSlots[level] || 0;
    const usedSpellPoints = selectedSpells.filter(
      (spell) => spell.level === level
    ).length;
    return maxSpellPoints - usedSpellPoints;
  };

  /* Update spell slots when character level or class changes */
  useEffect(() => {
    if (
      ["wizard", "sorcerer", "bard", "cleric", "paladin", "druid"].includes(
        selectedClass
      )
    ) {
      setSpellSlots(getClassSpellSlots(selectedClass, characterLevel));
    } else {
      setSpellSlots({});
    }
  }, [selectedClass, characterLevel]);

  // Helper function to get spell slots based on imported data
  const getClassSpellSlots = (className, level) => {
    switch (className) {
      case "wizard":
        return wizardSpellSlots[level] || {};
      case "sorcerer":
        return sorcerorSpellSlots[level] || {}; // Note: Check if it's "sorceror" or "sorcerer" in your data
      case "bard":
        return bardSpellSlots[level] || {};
      case "cleric":
        return clericSpellSlots[level] || {}; // Make sure you're importing this
      case "druid":
        return druidSpellSlots[level] || {};
      case "paladin":
        return paladinSpellSlots[level] || {};
      default:
        return {};
    }
  };

  /* Add a spell to the selected spells list and reduce spell slots */
  const addSpellToCharacter = (spell) => {
    const remainingPoints = calculateRemainingSpellPoints(spell.level);

    if (remainingPoints <= 0) {
      alert(`No remaining spell slots for level ${spell.level} spells.`);
      return;
    }

    const isSpellAlreadyAdded = selectedSpells.some(
      (s) => s.name === spell.name && s.level === spell.level
    );

    if (isSpellAlreadyAdded) {
      alert(`You already have ${spell.name} prepared.`);
      return;
    }

    setSelectedSpells((prev) => [...prev, spell]);
    setSpellSlots((prev) => ({
      ...prev,
      [spell.level]: (prev[spell.level] || 0) - 1,
    }));
  };

  const validateSpellSlots = () => {
    return Object.entries(spellSlots).every(([level, remaining]) => {
      const usedSpells = selectedSpells.filter(
        (s) => s.level === parseInt(level)
      ).length;
      const maxSlots = getClassSpellSlots(selectedClass, character.level)[
        level
      ];
      return usedSpells <= maxSlots;
    });
  };

  // Then add this check at start of handleSaveCharacter:
  if (!validateSpellSlots()) {
    setError("Invalid spell selection - exceeds available slots");
    setSaving(false);
    return;
  }

  /* Remove a spell from the selected spells list and restore spell slots */
  const removeSpellFromCharacter = (spellIndex) => {
    const spellToRemove = selectedSpells[spellIndex];
    setSelectedSpells((prev) =>
      prev.filter((_, index) => index !== spellIndex)
    );
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
        const response = await fetch(
          `https://www.dnd5eapi.co/api/classes/${selectedClass}/spells`
        );
        if (!response.ok) throw new Error("Failed to fetch spells");
        const data = await response.json();
        const spellDetails = await Promise.all(
          (data.results || []).map(async (spell) => {
            const spellResponse = await fetch(
              `https://www.dnd5eapi.co${spell.url}`
            );
            if (!spellResponse.ok)
              throw new Error("Failed to fetch spell details");
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

  {
  }
  /* Handle level change */
  const handleLevelChange = async (newLevel) => {
    const clampedLevel = Math.min(Math.max(newLevel, 1), 20);
    setCharacter((prev) => ({
      ...prev,
      level: clampedLevel,
    }));
    onLevelChange(clampedLevel);

    if (selectedClass) {
      try {
        const features = await fetchClassFeatures(selectedClass, clampedLevel);
        setCharacter((prev) => ({
          ...prev,
          classFeatures: features,
        }));
      } catch (error) {
        console.error("Error loading class features:", error);
        setError("Failed to load class features");
      }
    }
  };

  /* Fetch class features into the list when level changes*/
  useEffect(() => {
    const abortController = new AbortController();

    const fetchClassFeatures = async (classIndex, level) => {
      try {
        const features = [];
        for (let i = 1; i <= level; i++) {
          const response = await axios.get(
            `https://www.dnd5eapi.co/api/classes/${classIndex}/levels/${i}`
          );
          if (response.data.features) {
            features.push(
              ...response.data.features.map(
                (feature) => `Level ${i}: ${feature.name}`
              )
            );
          }
        }
        return features;
      } catch (error) {
        console.error("Error fetching class features:", error);
        throw error;
      }
    };

    if (selectedClass) {
      fetchClassFeatures(selectedClass, character.level)
        .then((features) => {
          setCharacter((prev) => ({
            ...prev,
            classFeatures: features,
          }));
        })
        .catch(console.error);
    }
  }, [selectedClass, character.level]);

  const validateCharacter = () => {
    const requiredFields = ["name", "race", "class", "level", "stats"];

    for (const field of requiredFields) {
      if (!character[field]) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }

    if (!window.localStorage.getItem("selectedCampaign")) {
      return "Please select a campaign first";
    }

    // Validate stats
    for (const [stat, value] of Object.entries(character.stats)) {
      if (value < 1 || value > 20) {
        return `${stat} must be between 1-20`;
      }
    }

    return null;
  };

  const validateSpells = (spells) => {
    return spells.every(spell => {
      return (
        typeof spell.name === "string" &&
        typeof spell.level === "number" &&
        typeof spell.school === "string" &&
        typeof spell.desc === "string" // Ensure desc is string
      );
    });
  };

  // New save function
  const handleSaveCharacter = async () => {
    if (saving) return;
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }
  
    const campaignID = window.localStorage.getItem("selectedCampaign");
    if (!campaignID) {
      setError("Please select a campaign first");
      return;
    }
  
    setSaving(true);
    setError(null);
  
    try {
      // Format spells to match backend expectations
      const formattedSpells = selectedSpells.map(spell => {
        // Handle school format - ensure we send string to backend
        const schoolName = spell.school?.name || spell.school || "Unknown";
        
        return {
          name: spell.name || "Unnamed Spell",
          level: spell.level || 0,
          school: schoolName, // Send as string to backend
          desc: Array.isArray(spell.desc) 
            ? spell.desc.join("\n\n") 
            : spell.desc || spell.description || ""
        };
      });
  
      const characterToSave = {
        name: character.name || "",
        race: character.race || "",
        class: character.class || "",
        level: character.level || 1,
        stats: character.stats || baseStats,
        speed: character.speed || 30,
        hitDice: character.hitDice || "d6",
        campaignID,
        alignment: character.alignment || "Neutral",
        size: character.size || "Medium",
        languages: character.languages || [],
        traits: character.traits || [],
        selectedSpells: formattedSpells,
        _id: character._id === 'new' ? undefined : character._id // Handle new character ID
      };
  
      // Validate spells before sending
      const validateSpells = (spells) => {
        return spells.every(spell => {
          return (
            typeof spell.name === "string" &&
            typeof spell.level === "number" &&
            typeof spell.school === "string" &&
            typeof spell.desc === "string"
          );
        });
      };
  
      if (!validateSpells(formattedSpells)) {
        setError("Invalid spell data format");
        setSaving(false);
        return;
      }
  
      console.log("Sending character data:", characterToSave);
  
      let response;
    if (character._id && character._id !== 'new') {
      // Update existing
      response = await modifyCharacter(character._id, characterToSave, token);
    } else {
      // Create new
      response = await createCharacter(characterToSave, token); 
    }
  
      // Update local state with normalized spells (convert school back to object format)
      const normalizedResponse = {
        ...response,
        selectedSpells: response.selectedSpells?.map(spell => ({
          ...spell,
          school: { name: spell.school } // Convert string back to object
        })) || []
      };
  
      setCharacter(normalizedResponse);
      setInitialCharacter(normalizedResponse);
      
      alert(`Character ${character._id ? "updated" : "created"} successfully!`);
      if (refreshCharacters) await refreshCharacters();
  
      return normalizedResponse;
    } catch (error) {
      console.error("Save error:", error);
      setError(error.message || "Failed to save character");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Spell Description Modal component
  const SpellDescriptionModal = ({ spell, onClose }) => {
    if (!spell) return null;

    return (
      <div className="fixed inset-0 bg-tan bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-light-tan p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-xl mb-4">{spell.name}</h3>
          <p>{spell.desc || "No description available."}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 p-2 bg-goblin-green text-gold rounded button"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Main component return with all styling applied
  return (
    <div className="p-6 max-w-6xl mx-auto bg-cream rounded-lg shadow-lg shadow-amber-800 text-brown grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Section - Race Details */}
      <div className="bg-light-tan p-6 rounded-lg shadow-md shadow-amber-800 col-span-1">
        <h2
          className="button text-xl hover:underline font-bold mb-4 cursor-pointer transition-colors"
          onClick={() => setShowRaceDetails(!showRaceDetails)}
        >
          Race Details {showRaceDetails ? "▲" : "▼"}
        </h2>
        {showRaceDetails && (
          <div className="space-y-3">
            <p>
              <strong>Size:</strong> {character.size}
            </p>
            <p>
              <strong>Size Description:</strong> {character.size_description}
            </p>
            <p>
              <strong>Languages:</strong> {character.languages.join(", ")}
            </p>
            <p>
              <strong>Language Description:</strong> {character.language_desc}
            </p>
            <p>
              <strong>Traits:</strong> {character.traits.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Main Character Sheet Form */}
      <div className="bg-light-tan p-6 rounded-lg shadow-md col-span-2">
        <h1 className="text-3xl font-bold mb-6 sancreek-regular">
          D&D Character Sheet
        </h1>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveCharacter();
          }}
        >
          {/* Character Name Input */}
          <div>
            <label className="block text-lg font-medium mb-2">Name:</label>
            <input
              type="text"
              className={formStyle}
              value={character.name}
              onChange={(e) =>
                setCharacter({ ...character, name: e.target.value })
              }
              placeholder="Enter character name"
            />
          </div>
          {/* Race Dropdown */}
          <div>
            <label className="block text-lg font-medium mb-2">Race:</label>
            <select
              className={formStyle}
              value={
                races.find((race) => race.name === character.race)?.index || ""
              }
              onChange={(e) => handleRaceChange(e.target.value)}
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
              className={formStyle}
              value={
                classes.find((cls) => cls.name === character.class)?.index || ""
              }
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
              className={formStyle}
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
              remainingSpellPoints={calculateRemainingSpellPoints(
                selectedSpellLevel
              )}
              selectedSpells={selectedSpells}
            />
          )}
          {/* Display Selected Spells */}
          <div className="p-6 max-w-4xl mx-auto bg-cream rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">Selected Spells</h2>
            {/* Display Remaining Spell Points for Each Level */}
            {Object.keys(spellSlots || {}).map((level) => (
              <div key={level} className="mb-4">
                <h3 className="font-bold">Level {level} Spells</h3>
                <p>
                  Remaining Points:{" "}
                  {calculateRemainingSpellPoints(parseInt(level))}
                </p>
              </div>
            ))}
            {/* Display Selected Spells */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSpells.map((spell, index) => (
                <div
                  key={index}
                  className="p-4 border rounded shadow flex justify-between items-center"
                >
                  <div>
                    <h3
                      className="font-bold cursor-pointer hover:text-yellow-700"
                      onClick={() => setSelectedSpellForDescription(spell)}
                    >
                      {spell.name}
                    </h3>
                    <p>Level: {spell.level}</p>
                    <p>
                      School: {spell.school ? spell.school.name : "Unknown"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpellFromCharacter(index)}
                    className="p-2 bg-cancel-red text-gold rounded button"
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
            <label className="block text-lg font-medium mb-2">Stats:</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(character.stats).map((stat) => (
                <div key={stat}>
                  <label className="block text-sm font-medium mb-1">
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}:
                  </label>
                  <input
                    type="number"
                    className={formStyle}
                    value={character.stats[stat]}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    placeholder={`Enter ${stat}`}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Speed and Passive Perception Inputs */}
          <div className="flex items-center space-x-24 pr-1">
            <div>
              <label className="block text-sm font-medium mb-1">Speed:</label>
              <input
                type="text"
                className={formStyle}
                value={character.speed}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Passive Perception:
              </label>
              <input
                type="text"
                className={formStyle}
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
              className={formStyle}
              value={character.hitDice}
              readOnly
            />
          </div>
          {/* Save and Cancel buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className={`px-4 py-2 rounded ${
                saving
                  ? "bg-tan text-brown"
                  : "bg-goblin-green button text-gold"
              }`}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-0 bg-cancel-red text-gold px-4 py-2 rounded shadow-sm shadow-amber-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Right Section - Class Proficiencies and Features */}
      <div className="bg-light-tan p-6 rounded-lg shadow-md col-span-1">
        {/* Class Proficiencies */}
        <div className="mb-6">
          <h2
            className="text-xl font-bold hover:underline mb-4 button cursor-pointer transition-colors"
            onClick={() => setShowClassProficiencies(!showClassProficiencies)}
          >
            Class Proficiencies {showClassProficiencies ? "▲" : "▼"}
          </h2>
          {showClassProficiencies && (
            <div className="space-y-3 text-brown">
              <p>
                <strong>Starting Proficiencies:</strong>{" "}
                {character.startingProficiencies.join(", ")}
              </p>
              <p>
                <strong>Class Proficiency Choices:</strong>{" "}
                {character.classProficiencies.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Class Features */}
        <div>
          <h2
            className="text-xl font-bold mb-4 button hover:underline cursor-pointer transition-colors"
            onClick={() => setShowClassFeatures(!showClassFeatures)}
          >
            Class Features {showClassFeatures ? "▲" : "▼"}
          </h2>
          {showClassFeatures && (
            <ul className="list-disc pl-5 space-y-2">
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

CharacterStats.propTypes = {
  onClassSelect: PropTypes.func.isRequired,
  characterLevel: PropTypes.number.isRequired,
  onLevelChange: PropTypes.func.isRequired,
  displayedCharacter: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    class: PropTypes.string,
    level: PropTypes.number,
    selectedSpells: PropTypes.array,
    // Add other character properties as needed
  }),
  isNew: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  refreshCharacters: PropTypes.func,
};

// CharacterStats.defaultProps = {
//   displayedCharacter: {},
//   isNew: false,
//   refreshCharacters: () => {},
// };
