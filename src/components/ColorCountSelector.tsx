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
}

export const ColorCountSelector: React.FC<ColorCountSelectorProps> = ({
  colorCount,
  onColorCountChange,
}) => {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">
        Color Count
      </Text>
      <FormControl>
        <FormLabel fontSize="xs" color="gray.500">
          Number of Colors
        </FormLabel>
        <NumberInput
          value={colorCount}
          onChange={(_, value) => onColorCountChange(value)}
          min={1}
          max={12}
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
