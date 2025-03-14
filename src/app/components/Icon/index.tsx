import React from 'react';
import icons from './icons';

interface IconProps {
  /** The name of the icon matching the key in `icons` */
  name: keyof typeof icons;
  /** Optional width in px */
  width?: number;
  /** Optional height in px */
  height?: number;
  /** Pass in a CSS color (e.g. "#f00", "red", "rgb(…)" ) */
  color?: string;
}

/**
 * Renders an SVG as a React component, using `currentColor` for the fill.
 */
const Icon: React.FC<IconProps> = ({ width, height, color, name, ...props }) => {
  const IconComponent = icons[name];
  if (!IconComponent) return null;

  // We assume your SVGs have fill="currentColor"
  return (
    <IconComponent
      width={width}
      height={height}
      // We apply the color via style, so fill="currentColor" picks it up
      style={{ color }}
      {...props}
    />
  );
};

export { icons };
export default Icon;
