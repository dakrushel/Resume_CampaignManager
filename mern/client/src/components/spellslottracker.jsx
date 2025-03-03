/*=========================== 
*   Title: PlayerCharacterStats
*   Author: Grimm_mmirG
*   Date: 2025-26-02
=============================*/

import React from "react";

const SpellSlotTracker = ({ spellSlots, onSpendSlot }) => {
  return (
    <div className="spell-slot-tracker p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
      {/* Heading */}
      <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">Spell Slots</h3>

      {/* Spell Slot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl mx-auto">
        {Object.entries(spellSlots).map(([level, slots]) => (
          <div
            key={level}
            className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50 flex flex-col items-center"
          >
            {/* Spell Level */}
            <h4 className="text-xl font-semibold text-gray-700 mb-3 text-center">Level {level}</h4>

            {/* Slots Available */}
            <p className="text-md text-gray-600 mb-4 text-center">
              Slots: {slots.available} / {slots.max}
            </p>

            {/* Spend Slot Button */}
            <button
              type="button"
              onClick={() => onSpendSlot(level)}
              disabled={slots.available === 0}
              className="w-15 p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Spend Slot
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpellSlotTracker;