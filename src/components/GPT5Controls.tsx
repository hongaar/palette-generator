import {
    Box,
    Checkbox,
    FormControl,
    FormLabel,
    HStack,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    VStack,
} from '@chakra-ui/react';
import React from 'react';

interface GPT5ControlsProps {
  minHueSeparation: number;
  preferPastel: boolean;
  preferDark: boolean;
  lockAtEnds: boolean;
  onMinHueSeparationChange: (value: number) => void;
  onPreferPastelChange: (value: boolean) => void;
  onPreferDarkChange: (value: boolean) => void;
  onLockAtEndsChange: (value: boolean) => void;
}

export const GPT5Controls: React.FC<GPT5ControlsProps> = ({
  minHueSeparation,
  preferPastel,
  preferDark,
  lockAtEnds,
  onMinHueSeparationChange,
  onPreferPastelChange,
  onPreferDarkChange,
  onLockAtEndsChange,
}) => {
  const SliderControl = ({ label, value, onChange, min, max, step }: any) => (
    <FormControl>
      <FormLabel fontSize="xs" color="gray.500" mb={1}>
        {label} ({value})
      </FormLabel>
      <HStack spacing={2}>
        <Slider
          flex="1"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          colorScheme="purple"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize={4} />
        </Slider>
        <NumberInput
          size="xs"
          maxW="70px"
          min={min}
          max={max}
          value={value}
          onChange={(_, numValue) => onChange(numValue)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </HStack>
    </FormControl>
  );

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">
        GPT5 Algorithm Controls
      </Text>
      <VStack spacing={4} align="stretch">
        <SliderControl
          label="Min Hue Separation (°)"
          value={minHueSeparation}
          onChange={onMinHueSeparationChange}
          min={8}
          max={90}
          step={1}
        />
        
        <FormControl>
          <FormLabel fontSize="xs" color="gray.500" mb={2}>
            Palette Preferences
          </FormLabel>
          <VStack spacing={2} align="stretch">
            <Checkbox
              isChecked={preferPastel}
              onChange={(e) => onPreferPastelChange(e.target.checked)}
              size="sm"
            >
              Prefer Pastel Colors
            </Checkbox>
            <Checkbox
              isChecked={preferDark}
              onChange={(e) => onPreferDarkChange(e.target.checked)}
              size="sm"
            >
              Prefer Dark Colors
            </Checkbox>
            <Checkbox
              isChecked={lockAtEnds}
              onChange={(e) => onLockAtEndsChange(e.target.checked)}
              size="sm"
            >
              Lock Colors at Ends
            </Checkbox>
          </VStack>
        </FormControl>
      </VStack>
    </Box>
  );
};
