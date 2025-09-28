import {
    Box,
    FormControl,
    FormLabel,
    Select,
    Text,
} from '@chakra-ui/react';
import React from 'react';
import { PaletteAlgorithm } from '../types';

interface AlgorithmSelectorProps {
  algorithm: PaletteAlgorithm;
  onAlgorithmChange: (algorithm: PaletteAlgorithm) => void;
}

  const algorithmOptions = [
    { value: 'complementary', label: 'Complementary' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'monochromatic', label: 'Monochromatic' },
    { value: 'split-complementary', label: 'Split Complementary' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'auto-cursor', label: 'Auto (Cursor)' },
    { value: 'auto-gpt5', label: 'Auto (GPT5)' },
    { value: 'auto-sonnet4', label: 'Auto (Sonnet4)' },
  ];

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithm,
  onAlgorithmChange,
}) => {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">
        Algorithm
      </Text>
      <FormControl>
        <FormLabel fontSize="xs" color="gray.500">
          Color Harmony
        </FormLabel>
        <Select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as PaletteAlgorithm)}
          size="sm"
        >
          {algorithmOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
