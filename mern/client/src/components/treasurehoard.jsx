// treasurehoard.jsx

export const rollTreasureHoard = (cr) => {
    const roll = Math.floor(Math.random() * 100) + 1; // d100 roll
  
    // Example for CR 0-4 table for Treasure Hoard (adjust as needed)
    if (cr <= 4) {
      if (roll <= 30) return { gems: '5d6 Gems', magicItems: 'No Magic Items' };
      if (roll <= 60) return { gems: '4d6 Art Objects', magicItems: 'No Magic Items' };
      if (roll <= 95) return { gems: '3d6 Gems', magicItems: 'Roll on Magic Item Table A' };
      return { gems: 'No Gems', magicItems: 'Roll on Magic Item Table B' };
    } else if (cr <= 10) {
      if (roll <= 30) return { gems: 'Roll for 6d6 Art Objects', magicItems: 'Roll on Magic Item Table C' };
      if (roll <= 60) return { gems: 'Roll for 4d6 Gems', magicItems: 'Roll on Magic Item Table D' };
      return { gems: 'Roll for 2d6 Art Objects', magicItems: 'Roll on Magic Item Table E' };
    }
  
    // Add more CR ranges based on DMG loot tables.
    return { gems: 'No Gems', magicItems: 'No Magic Items' };
  };
  
  export default rollTreasureHoard;
  