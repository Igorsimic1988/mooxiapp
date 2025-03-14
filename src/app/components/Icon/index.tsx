import React from 'react';
import icons from './icons'


interface IconProps {
    name: keyof typeof icons;
    width?: number;
    height?: number;
    color?: string;
}

const Icon: React.FC<IconProps> = ({width, height, color, name, ...props}) => {
    
    const IconComponent = icons[name];

    if (!IconComponent) return null;

    return <IconComponent width={width} height={height} color={color} {...props} />
};

export { icons }
export default Icon;