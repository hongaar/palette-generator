import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    HStack,
    IconButton,
    Input,
    Text,
    Tooltip,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import React from 'react';

interface ColorInputProps {
  baseColors: string[];
  onBaseColorsChange: (colors: string[]) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  baseColors,
  onBaseColorsChange,
}) => {
  const addColor = () => {
    const newColors = [...baseColors, '#FF6B6B'];
    onBaseColorsChange(newColors);
  };

  const removeColor = (index: number) => {
    if (baseColors.length > 1) {
      const newColors = baseColors.filter((_, i) => i !== index);
      onBaseColorsChange(newColors);
    }
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...baseColors];
    newColors[index] = color;
    onBaseColorsChange(newColors);
  };

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">
        Base Colors
      </Text>
      <VStack spacing={3} align="stretch">
        {baseColors.map((color, index) => (
          <HStack key={index} spacing={2}>
            <Input
              type="color"
              value={color}
              onChange={(e) => updateColor(index, e.target.value)}
              w="60px"
              h="40px"
              p={0}
              border="none"
              borderRadius="md"
              cursor="pointer"
            />
            <Input
              value={color}
              onChange={(e) => updateColor(index, e.target.value)}
              placeholder="#FF6B6B"
              fontFamily="mono"
              fontSize="sm"
              flex={1}
              bg={bgColor}
              borderColor={borderColor}
            />
            {baseColors.length > 1 && (
              <Tooltip label="Remove color">
                <IconButton
                  aria-label="Remove color"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeColor(index)}
                />
              </Tooltip>
            )}
          </HStack>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={addColor}
          size="sm"
          variant="outline"
          colorScheme="blue"
        >
          Add Color
        </Button>
      </VStack>
    </Box>
  );
};
