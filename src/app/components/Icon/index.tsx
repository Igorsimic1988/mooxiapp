import React from 'react';
import icons from './icons'


interface IconProps {
    name: keyof typeof icons;
    width?: number;
    height?: number;
    fill?: string;
}

const Icon: React.FC<IconProps> = ({width, height, fill, name, ...props}) => {
    
    const IconComponent = icons[name];

    if (!IconComponent) return null;

    return <IconComponent width={width} height={height} color={fill} {...props} />
};

export { icons }
export default Icon;