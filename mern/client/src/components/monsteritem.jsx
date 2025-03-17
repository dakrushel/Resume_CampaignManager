// import { useState, useEffect } from "react";
// import PropTypes from "prop-types";

// export default function MonsterItem({ monsterName, id, onRemove }) {
//   const [monster, setMonster] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expanded, setExpanded] = useState(false);

//   useEffect(() => {
//     const fetchMonsterDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`https://www.dnd5eapi.co/api/monsters/${monsterName}`);
//         if (!response.ok) throw new Error("Failed to fetch monster details.");

//         const data = await response.json();
//         setMonster(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMonsterDetails();
//   }, [monsterName]);

//   if (loading) return <li>Loading {monsterName}...</li>;
//   if (error) return <li>Error loading {monsterName}: {error}</li>;

//   return (
//     <li className="border border-brown bg-cream p-3 rounded-md shadow-md">
//       <button onClick={() => setExpanded(!expanded)} className="text-lg font-semibold flex items-center">
//         {expanded ? "▲" : "▼"} {monster?.name || "Unknown"}
//       </button>
//       {expanded && monster && (
//         <div className="mt-2 p-2 bg-light-tan rounded-md">
//           <p><strong>Type:</strong> {monster.type || "Unknown"}, <strong>Size:</strong> {monster.size || "Unknown"}, <strong>Alignment:</strong> {monster.alignment || "Unknown"}</p>
//           <p><strong>Armor Class:</strong> {monster.armor_class || "N/A"}, <strong>Hit Points:</strong> {monster.hit_points || "N/A"}, <strong>Speed:</strong> {monster.speed?.walk || "N/A"}</p>
          
//           {/* Ability Scores */}
//           <div className="mt-2">
//             <h3 className="font-bold">Stats</h3>
//             <p>STR: {monster.strength}, DEX: {monster.dexterity}, CON: {monster.constitution}</p>
//             <p>INT: {monster.intelligence}, WIS: {monster.wisdom}, CHA: {monster.charisma}</p>
//           </div>

//           {/* Abilities */}
//           {monster.special_abilities && (
//             <div className="mt-2">
//               <h3 className="font-bold">Abilities</h3>
//               <ul>
//                 {monster.special_abilities.map((ability, index) => (
//                   <li key={index}><strong>{ability.name}:</strong> {ability.desc}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Actions */}
//           {monster.actions && (
//             <div className="mt-2">
//               <h3 className="font-bold">Actions</h3>
//               <ul>
//                 {monster.actions.map((action, index) => (
//                   <li key={index}><strong>{action.name}:</strong> {action.desc}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Legendary Actions */}
//           {monster.legendary_actions && (
//             <div className="mt-2">
//               <h3 className="font-bold">Legendary Actions</h3>
//               <ul>
//                 {monster.legendary_actions.map((action, index) => (
//                   <li key={index}><strong>{action.name}:</strong> {action.desc}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <button onClick={() => onRemove(id)} className="mt-2 bg-cancel-red text-gold px-3 py-1 rounded">
//             Remove
//           </button>
//         </div>
//       )}
//     </li>
//   );
// }

// MonsterItem.propTypes = {
//   monsterName: PropTypes.string.isRequired,
//   onRemove: PropTypes.func.isRequired,
//   id: PropTypes.string.isRequired,
// };


import { useState, useEffect } from "react";
// import MonstersLookup from "./MonstersLookup";
import PropTypes from "prop-types";

export default function Monster ({ monsterName, id, onRemove }) {
    const [expanded, setExpanded] = useState(false);
    const [monster, setMonster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchMonsterDetails = async () => {
        try {
          setLoading(true);
          setError(null);

          monsterName = monsterName.replaceAll(" ", "-");

          const response = await fetch(`https://www.dnd5eapi.co/api/monsters/${monsterName}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch monster details: ${response.statusText}`);
          }

          const data = await response.json();
          setMonster(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMonsterDetails();
    }, [monsterName]);
    
    const toggleDetails = () => {
        setExpanded(!expanded);
    };

    //Because most of the time you'll just want the ac value
    const getArmorClassValue = (armorClass) => {
        if (!armorClass) return "Unknown";

        if (Array.isArray(armorClass)) {
            return armorClass[0]?.value || "Unknown";
        }

        return armorClass;
    }

    const renderArmorClass = (armorClass) => {
        if (!armorClass) return "Unknown";
    
        if (Array.isArray(armorClass)) {
          return armorClass.map((ac, index) => (
            <div key={index}>
              <p>
                <strong>Value:</strong> {ac.value || "Unknown"}
              </p>
              {ac.type && <p><strong>Type:</strong> {ac.type}</p>}
              {ac.armor && (
                <p>
                  <strong>Armor:</strong>{" "}
                  {Array.isArray(ac.armor)
                    ? ac.armor.map((armorPiece, idx) => (
                        <span key={idx}>{armorPiece.name || "Unnamed Armor"}{idx < ac.armor.length - 1 ? ", " : ""}</span>
                      ))
                    : ac.armor}
                </p>
              )}
            </div>
          ));
        }
    
        // If armor_class is not an array, just display the value
        return <p><strong>Armor Class:</strong> {armorClass}</p>;
      };

      const getSpeedString = (speed) => {
        if (typeof speed === "string") {
          return speed;
        }
        if (typeof speed === "object" && speed !== null) {
          return Object.entries(speed)
            .map(([type, value]) => `${type}: ${value}`)
            .join(", ");
        }
      }

    if (loading) {
      return <li>Wrangling {monsterName}..</li>
    }

    if (error) {
      return <li>Failed to wrangle {monsterName}, I rolled a 1 -- {error}</li>
    }
    return (
      <li className="monster-item"
      style={{ marginBottom: "10px", paddingBottom: "2px", paddingTop: "2px", paddingLeft: "5px", paddingRight: "5px", border: "2px solid #e9bf69", backgroundColor: "#F4CE88", borderRadius: "5px" }}>
          <div className="monster-summary">
              <span>{monster.name}</span>
              <span>AC:{getArmorClassValue(monster.armor_class)}</span>
              <span>HP: {monster.hit_points}</span>
              <span>Speed: {getSpeedString(monster.speed)}</span>
              <button
                  className="chevron-button"
                  onClick={toggleDetails}
                  aria-label={expanded ? `Collapse ${monster.name}` : `Expand ${monster.name}`}
                  >{expanded ? "▲" : "▼"}
              </button>
              <button
                  onClick={() => onRemove(id)}
                  className="mt-2 bg-cancel-red text-gold px-3 py-1 rounded"
                  // aria-label={`Remove ${monster.name}`}
                  // style={{
                  //   background: "#105b10",
                  //   color: "#FFB325",
                  //   border: "1px solid #193E19",
                  //   padding: "5px",
                  //   marginRight: "5px",
                  //   cursor: "pointer",
                  >Remove
              </button>
          </div>
          {expanded && (
              <div className="monster-details">
                  <h2>{monster.name}</h2>
                  <p><strong>Size:</strong> {monster.size || "Unknown"}</p>
                  <p><strong>Type:</strong> {monster.type || "Unknown"}</p>
                  <p><strong>Alignment:</strong> {monster.alignment || "Unknown"}</p>
                  <p><strong>Armor Class:</strong></p>
                  {renderArmorClass(monster.armor_class)}
                  <p><strong>Hit Points:</strong> {monster.hit_points || "Unknown"}</p>
                  <p><strong>Challenge Rating:</strong> {monster.challenge_rating || "Unknown"}</p>
                  {monster.actions?.length > 0 && (
                    <>
                      <p><strong>Actions:</strong></p>
                      <ul>
                        {monster.actions.map((action, index) => (
                          <li key={index}>
                            <strong>{action.name}:</strong> {action.desc}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {monster.special_abilities?.length > 0 && (
                    <>
                      <p><strong>Special Abilities:</strong></p>
                      <ul>
                        {monster.special_abilities.map((ability, index) => (
                          <li key={index}>
                            <strong>{ability.name}:</strong> {ability.desc}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
              </div>
          )}
      </li>
    )
}

Monster.propTypes = {
  monsterName: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
}