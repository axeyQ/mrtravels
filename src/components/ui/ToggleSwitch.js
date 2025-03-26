
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ToggleSwitch({ checked, onChange, size = "md", disabled = false }) {
  const [isToggled, setIsToggled] = useState(checked);
  
  const handleToggle = () => {
    if (disabled) return;
    
    const newState = !isToggled;
    setIsToggled(newState);
    if (onChange) {
      onChange(newState);
    }
  };
  
  // Size configurations
  const sizes = {
    sm: { width: "32px", height: "18px", circle: "14px" },
    md: { width: "44px", height: "22px", circle: "18px" },
    lg: { width: "56px", height: "28px", circle: "22px" }
  };
  
  const sizeConfig = sizes[size] || sizes.md;
  
  return (
    <div
      className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleToggle}
    >
      <div
        className={`${
          isToggled ? 'bg-primary' : 'bg-gray-300'
        } ${disabled ? '' : 'hover:opacity-90'} flex items-center rounded-full px-0.5 transition-colors duration-300 ease-in-out`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
      >
        <motion.div
          className="bg-white rounded-full shadow-md"
          style={{ width: sizeConfig.circle, height: sizeConfig.circle }}
          animate={{
            x: isToggled 
              ? `calc(${sizeConfig.width} - ${sizeConfig.circle} - 4px)` 
              : "2px"
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );
}