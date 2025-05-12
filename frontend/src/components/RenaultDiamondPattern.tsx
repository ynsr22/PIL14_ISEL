import React from 'react';

interface RenaultDiamondPatternProps {
  logoSrc: string;
  diamondBaseSizeRem?: number; // Base size in rem for the diamond. E.g., 20 for a 20rem x 20rem diamond.
  rows?: number;
  cols?: number;
  gapRem?: number; // Added prop for the gap between diamonds
}

const RenaultDiamondPattern: React.FC<RenaultDiamondPatternProps> = ({
  logoSrc,
  diamondBaseSizeRem = 20, // Default to 20rem (equivalent to Tailwind's w-80, h-80 classes which are 20rem)
  rows = 15, // Generous number of rows to ensure coverage
  cols = 10, // Generous number of columns
  gapRem = 2, // Default gap to 0.5rem
}) => {
  const diamondWidth = diamondBaseSizeRem; // Actual width of the image
  const diamondHeight = diamondBaseSizeRem; // Actual height of the image

  // Calculate step and offset including the gap
  const horizontalStep = diamondWidth + gapRem;
  const verticalStepForRow = (diamondHeight / 2) + (gapRem / 2);
  const horizontalStaggerOffset = (diamondWidth / 2) + (gapRem / 2);

  // Offset to shift the whole pattern up and left to fill edge gaps
  // Make the offset equal to a full step to ensure coverage
  const initialTopOffset = verticalStepForRow;
  const initialLeftOffset = horizontalStaggerOffset;

  const patternItems = [];

  for (let r = 0; r < rows; r++) {
    const isStaggeredRow = r % 2 !== 0;
    for (let c = 0; c < cols; c++) {
      const topPosition = (r * verticalStepForRow) - initialTopOffset;
      let leftPosition = (c * horizontalStep) - initialLeftOffset;

      if (isStaggeredRow) {
        leftPosition -= horizontalStaggerOffset;
      }

      patternItems.push(
        <img
          key={`diamond-${r}-${c}`}
          src={logoSrc}
          alt="" // Decorative, and parent div is aria-hidden
          className={`object-contain select-none`}
          style={{
            position: 'absolute',
            width: `${diamondWidth}rem`, // Visual width of the diamond image
            height: `${diamondHeight}rem`, // Visual height of the diamond image
            top: `${topPosition}rem`,
            left: `${leftPosition}rem`,
            zIndex: rows - r, // Higher rows (smaller r) get higher z-index
            pointerEvents: 'none', // Prevent image interaction
          }}
          draggable={false}
        />
      );
    }
  }

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none" // Fills parent, parent needs to be relative
      aria-hidden="true" // Decorative pattern
    >
      {patternItems}
    </div>
  );
};

export default RenaultDiamondPattern;
