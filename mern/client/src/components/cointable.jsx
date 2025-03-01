/*=========================================
*   Title: PlayerCharacterStats
*   Author: Grimm_mmirG
*   Date: 2025-25-01
*
*   This is for individual Gold per player
*
===========================================*/

const rollDice = (numDice, dieSize) => {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }
    return total;
  };
  
  export const rollCoinTable = (cr) => {
    const roll = Math.floor(Math.random() * 100) + 1; // d100 roll
  
    if (cr <= 4) {
      // CR 0-4 coin table
      if (roll <= 30) return `${rollDice(5, 6)} Copper`;   // Roll 5d6 for Copper
      if (roll <= 60) return `${rollDice(4, 6)} Silver`;   // Roll 4d6 for Silver
      if (roll <= 70) return `${rollDice(3, 6)} Electrum`; // Roll 3d6 for Electrum
      if (roll <= 95) return `${rollDice(3, 6)} Gold`;     // Roll 3d6 for Gold
      return `${rollDice(1, 6)} Platinum`;                 // Roll 1d6 for Platinum
    } else if (cr <= 10) {
      // CR 5-10 coin table
      if (roll <= 30) return `${rollDice(4, 6) * 100} Copper and ${rollDice(1, 6) * 10} Electrum`; // Roll 4d6*100 for Copper, 1d6*10 for Electrum
      if (roll <= 60) return `${rollDice(6, 6) * 10} Silver and ${rollDice(2, 6) * 10} Gold`; // Roll 6d6*10 for Silver, 2d6*10 for Gold
      if (roll <= 70) return `${rollDice(1, 6) * 10} Electrum and ${rollDice(2, 6) * 10} Gold`; // Roll 1d6*10 for Electrum, 2d6*10 for Gold
      if (roll <= 95) return `${rollDice(4, 6) * 100} Gold`; // Roll 4d6*100 for Gold
      return `${rollDice(2, 6) * 10} Gold and ${rollDice(3, 6)} Platinum`; // Roll 2d6*10 for Gold, 3d6 for Platinum
    } else if (cr <= 16) {
      // CR 11-16 coin table
      if (roll <= 20) return `${rollDice(4, 6) * 100} Silver and ${rollDice(1, 6) * 100} Gold`; // Roll 4d6*100 for Silver, 1d6*100 for Gold
      if (roll <= 35) return `${rollDice(1, 6) * 100} Electrum and ${rollDice(1, 6) * 100} Gold`; // Roll 1d6*100 for Electrum, 1d6*100 for Gold
      if (roll <= 75) return `${rollDice(2, 6) * 100} Gold and ${rollDice(1, 6) * 10} Platinum`; // Roll 2d6*100 for Gold, 1d6*10 for Platinum
      return `${rollDice(2, 6) * 100} Gold and ${rollDice(2, 6) * 10} Platinum`; // Roll 2d6*100 for Gold, 2d6*10 for Platinum
    } else {
      // CR 17+ coin table
      if (roll <= 15) return `${rollDice(2, 6) * 1000} Electrum and ${rollDice(8, 6) * 100} Gold`; // Roll 2d6*1000 for Electrum, 8d6*100 for Gold
      if (roll <= 55) return `${rollDice(1, 6) * 1000} Gold and ${rollDice(1, 6) * 100} Platinum`; // Roll 1d6*1000 for Gold, 1d6*100 for Platinum
      return `${rollDice(2, 6) * 1000} Gold and ${rollDice(2, 6) * 100} Platinum`; // Roll 1d6*1000 for Gold, 2d6*100 for Platinum
    }
  };
  
  export default rollCoinTable;
  