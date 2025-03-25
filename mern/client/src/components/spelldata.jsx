/*=============================================== 
*   Title: Spell data tables for spell slot logic
*   Author: Grimm_mmirG
*   Date: 2025-26-02
=================================================*/

// Existing wizard spell slots (unchanged)
export const wizardSpellSlots = {
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

export const bardSpellSlots = {
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
    
export const clericSpellSlots = {
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
    
export const druidSpellSlots = {
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
    
export const sorcererSpellSlots = {
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
    
export const warlockSpellSlots = {
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
    
export const paladinSpellSlots = {
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
    
export const rangerSpellSlots = {
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

// Spell slots for other core classes (expanded)
export const classSpellSlots = {
  wizard: wizardSpellSlots,
  bard: bardSpellSlots, 
  cleric: clericSpellSlots,
  druid: druidSpellSlots,
  sorcerer: sorcererSpellSlots,
  warlock: warlockSpellSlots,
  paladin: paladinSpellSlots,
  ranger: rangerSpellSlots
};

/**
 * Gets spell slots for a class and level from local data
 * @param {string} className - Lowercase class name (e.g. 'wizard')
 * @param {number} level - Character level (1-20)
 * @returns {Object} Object with spell slots by level
 */
export const getLocalSpellSlots = (className, level) => {
  const normalizedClass = className.toLowerCase();
  
  if (!classSpellSlots[normalizedClass]) {
    return {};
  }

  // Get slots for the exact level or highest available below it
  let effectiveLevel = Math.min(level, 20);
  while (effectiveLevel > 0 && !classSpellSlots[normalizedClass][effectiveLevel]) {
    effectiveLevel--;
  }
  
  return {...classSpellSlots[normalizedClass][effectiveLevel]} || {};
};

export const SpellSlotTable = ({ 
  className, 
  level, 
  onSpendSlot, 
  usedSlots = {}, 
  onResetSlots 
}) => {
  const slots = getLocalSpellSlots(className, level);

  if (Object.keys(slots).length === 0) {
    return <p className="text-yellow-800">No spell slots available</p>;
  }

  return (
    <div className="overflow-x-auto mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Spell Slots</h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            onResetSlots?.();
          }}
          className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm"
        >
          Reset All Slots
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-yellow-200">
            <th className="p-2 border border-yellow-300">Spell Level</th>
            <th className="p-2 border border-yellow-300">Total</th>
            <th className="p-2 border border-yellow-300">Used</th>
            <th className="p-2 border border-yellow-300">Remaining</th>
            <th className="p-2 border border-yellow-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(slots)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([spellLevel, totalSlots]) => {
              const levelNum = parseInt(spellLevel);
              const used = usedSlots[levelNum] || 0;
              const remaining = totalSlots - used;

              return (
                <tr key={spellLevel} className="bg-yellow-100 even:bg-yellow-50">
                  <td className="p-2 border border-yellow-300 text-center">
                    {levelNum === 0 ? "Cantrips" : `Level ${levelNum}`}
                  </td>
                  <td className="p-2 border border-yellow-300 text-center">
                    {levelNum === 0 ? "∞" : totalSlots}
                  </td>
                  <td className="p-2 border border-yellow-300 text-center">
                    {levelNum === 0 ? "-" : used}
                  </td>
                  <td className="p-2 border border-yellow-300 text-center">
                    {levelNum === 0 ? "∞" : remaining}
                  </td>
                  <td className="p-2 border border-yellow-300 text-center">
                    {levelNum > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onSpendSlot(levelNum);
                        }}
                        className={`px-2 py-1 rounded text-sm ${
                          remaining <= 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-red-100 hover:bg-red-200 text-red-800'
                        }`}
                        disabled={remaining <= 0}
                      >
                        Use Slot
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};