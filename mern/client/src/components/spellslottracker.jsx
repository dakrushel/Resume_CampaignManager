/*======================================
*   Title: Spell Slot Tracker Logic Page 
*   Author: Grimm_mmirG
*   Date: 2025-26-02
========================================*/

import React from "react";

const SpellSlotTracker = ({ spellSlots, onSpendSlot }) => {
  return (
    <div className="spell-slot-tracker p-8 bg-cream border-brown text-brown border rounded-lg shadow-md flex flex-col items-center">
      {/* Heading */}
      <h3 className="text-2xl font-bold mb-6 text-center">Spell Slots</h3>

      {/* Spell Slot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl mx-auto">
        {Object.entries(spellSlots).map(([level, slots]) => (
          <div
            key={level}
            className="p-6 border border-brown rounded-lg shadow-sm hover:shadow-md transition-shadow bg-light-tan flex flex-col items-center"
          >
            {/* Spell Level */}
            <h4 className="text-xl font-semibold mb-3 text-center">Level {level}</h4>

            {/* Slots Available */}
            <p className="text-md mb-4 text-center">
              Slots: {slots.available} / {slots.max}
            </p>

            {/* Spend Slot Button */}
            <button
              type="button"
              onClick={() => onSpendSlot(level)}
              disabled={slots.available === 0}
              className="w-15 p-1 bg-goblin-green font-bold text-gold button rounded disabled:cursor-not-allowed transition-colors"
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