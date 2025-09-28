import {
    Box,
    FormControl,
    FormLabel,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
} from '@chakra-ui/react';
import React from 'react';

interface ColorCountSelectorProps {
  colorCount: number;
  onColorCountChange: (count: number) => void;
  algorithm: string;
}

export const ColorCountSelector: React.FC<ColorCountSelectorProps> = ({
  colorCount,
  onColorCountChange,
  algorithm,
}) => {
  // Define maximum colors for each algorithm
  const getMaxColors = (algo: string): number => {
    switch (algo) {
      case 'complementary': return 2;
      case 'triadic': return 3;
      case 'analogous': return 12;
      case 'monochromatic': return 12;
      case 'split-complementary': return 3;
      case 'tetradic': return 4;
      case 'auto': return 20; // Auto mode allows many colors
      default: return 12;
    }
  };

  const maxColors = getMaxColors(algorithm);
  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">
        Color Count
      </Text>
      <FormControl>
        <FormLabel fontSize="xs" color="gray.500">
          Number of Colors
          {colorCount >= maxColors && (
            <Text as="span" fontSize="xs" color="orange.500" ml={1}>
              (max for {algorithm})
            </Text>
          )}
        </FormLabel>
        <NumberInput
          value={colorCount}
          onChange={(_, value) => onColorCountChange(value)}
          min={1}
          max={maxColors}
          size="sm"
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </Box>
  );
};
