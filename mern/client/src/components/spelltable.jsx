// /*=========================== 
// *   Title: PlayerCharacterStats
// *   Author: Grimm_mmirG
// *   Date: 2025-26-02
// =============================*/

import React, { useState, useEffect, useMemo } from "react";

const SpellTable = ({ selectedClass, characterLevel }) => {}
//   const [spellsByLevel, setSpellsByLevel] = useState({});
//   const [expandedLevels, setExpandedLevels] = useState({});
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch spells when selectedClass changes
//   useEffect(() => {
//     if (!selectedClass) {
//       setSpellsByLevel({});
//       return;
//     }

//     const fetchSpells = async () => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         /* Fetch spells for the selected class */
//         const response = await fetch(`https://www.dnd5eapi.co/api/classes/${selectedClass}/spells`);
//         if (!response.ok) throw new Error("Failed to fetch spells");
//         const data = await response.json();

//         /* Fetch details for each spell */
//         const spellDetails = await Promise.all(
//           data.results.map(async (spell) => {
//             const spellResponse = await fetch(`https://www.dnd5eapi.co${spell.url}`);
//             if (!spellResponse.ok) throw new Error("Failed to fetch spell details");
//             return spellResponse.json();
//           })
//         );

//         /* Group spells by level */
//         const groupedSpells = spellDetails.reduce((acc, spell) => {
//           acc[spell.level] = acc[spell.level] || [];
//           acc[spell.level].push(spell);
//           return acc;
//         }, {});

//         setSpellsByLevel(groupedSpells);
//       } catch (error) {
//         console.error("Error fetching spells:", error);
//         setError("Failed to load spells. Please try again later.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchSpells();
//   }, [selectedClass]); // Re-fetch spells when selectedClass changes

//   // Toggle expanded state for a specific spell level
//   const toggleLevel = (level) => {
//     setExpandedLevels((prev) => ({ ...prev, [level]: !prev[level] }));
//   };

//   // Map spell levels to the character levels at which they become available
//   const spellLevelAvailability = {
//     0: 1, // Cantrips (level 0) are available at character level 1
//     1: 1, // 1st-level spells at level 1
//     2: 3, // 2nd-level spells at level 3
//     3: 5, // 3rd-level spells at level 5
//     4: 7, // 4th-level spells at level 7
//     5: 9, // 5th-level spells at level 9
//     6: 11, // 6th-level spells at level 11
//     7: 13, // 7th-level spells at level 13
//     8: 15, // 8th-level spells at level 15
//     9: 17, // 9th-level spells at level 17
//   };

//   // Memoize filtered spells based on searchQuery and characterLevel
//   const filteredSpellsByLevel = useMemo(() => {
//     return Object.entries(spellsByLevel).reduce((acc, [level, spells]) => {
//       const filteredSpells = spells.filter(
//         (spell) =>
//           spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           level.toString().includes(searchQuery)
//       );

//       // Only include spells if the character has reached the required level
//       if (filteredSpells.length > 0 && characterLevel >= spellLevelAvailability[level]) {
//         acc[level] = filteredSpells;
//       }
//       return acc;
//     }, {});
//   }, [spellsByLevel, searchQuery, characterLevel]); // Re-run when characterLevel changes

//   return (
//     <div className="spell-table p-6 bg-white rounded-lg shadow-md">
//       {/* Search Input */}
//       <input
//         type="text"
//         placeholder="Search spells..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="w-full p-2 border rounded mb-4"
//       />
  
//       {/* Loading State */}
//       {isLoading && (
//         <p className="text-center text-gray-600">Loading spells...</p>
//       )}
  
//       {/* Error State */}
//       {error && (
//         <p className="text-center text-red-500">{error}</p>
//       )}
  
//       {/* No Spells Found */}
//       {!isLoading && !error && Object.entries(filteredSpellsByLevel).length === 0 && (
//         <p className="text-center text-gray-600">No spells found.</p>
//       )}
  
//       {/* Spell Levels */}
//       {Object.entries(filteredSpellsByLevel).map(([level, spells]) => (
//         <div key={level} className="mb-4">
//           <button
//             onClick={() => toggleLevel(level)}
//             className="w-full text-left p-2 bg-gray-200 rounded-lg"
//           >
//             <h3 className="font-bold">Level {level} Spells</h3>
//           </button>
//           {expandedLevels[level] && (
//             <div className="mt-2">
//               {spells.map((spell) => (
//                 <div key={spell.index} className="p-2 border-b">
//                   <h4 className="font-semibold">{spell.name}</h4>
//                   <p>{spell.desc}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

export default SpellTable;