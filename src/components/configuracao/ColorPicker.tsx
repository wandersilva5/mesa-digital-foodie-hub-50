
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [selectedColor, setSelectedColor] = useState(color || "#FF9800");
  
  const predefinedColors = [
    "#FF9800", // Laranja (Primária)
    "#4CAF50", // Verde (Secundária)
    "#F44336", // Vermelho (Acento)
    "#2196F3", // Azul
    "#9C27B0", // Roxo
    "#FFC107", // Amarelo
    "#795548", // Marrom
    "#607D8B", // Azul Acinzentado
  ];
  
  const handleColorSelect = (newColor: string) => {
    setSelectedColor(newColor);
    onChange(newColor);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-10 h-10 p-0 rounded-md border"
            style={{ backgroundColor: selectedColor }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {predefinedColors.map((presetColor) => (
              <Button
                key={presetColor}
                variant="outline"
                className="w-10 h-10 p-0 rounded-md border"
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorSelect(presetColor)}
              />
            ))}
          </div>
          <Input
            type="color"
            value={selectedColor}
            onChange={handleInputChange}
            className="w-full h-10"
          />
        </PopoverContent>
      </Popover>
      <Input
        value={selectedColor}
        onChange={handleInputChange}
        className="font-mono"
      />
    </div>
  );
};
