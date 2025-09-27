import {
    Box,
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

interface HSLControlsProps {
  hueShift: number;
  saturationShift: number;
  lightnessShift: number;
  onHueShiftChange: (value: number) => void;
  onSaturationShiftChange: (value: number) => void;
  onLightnessShiftChange: (value: number) => void;
}

export const HSLControls: React.FC<HSLControlsProps> = ({
  hueShift,
  saturationShift,
  lightnessShift,
  onHueShiftChange,
  onSaturationShiftChange,
  onLightnessShiftChange,
}) => {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={4} color="gray.600">
        HSL Adjustments
      </Text>
      <VStack spacing={4} align="stretch">
        {/* Hue Shift */}
        <FormControl>
          <HStack justify="space-between" mb={2}>
            <FormLabel fontSize="xs" color="gray.500" mb={0}>
              Hue Shift
            </FormLabel>
            <NumberInput
              value={hueShift}
              onChange={(_, value) => onHueShiftChange(value)}
              min={-180}
              max={180}
              size="xs"
              w="60px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          <Slider
            value={hueShift}
            onChange={onHueShiftChange}
            min={-180}
            max={180}
            step={1}
            colorScheme="purple"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>

        {/* Saturation Shift */}
        <FormControl>
          <HStack justify="space-between" mb={2}>
            <FormLabel fontSize="xs" color="gray.500" mb={0}>
              Saturation Shift
            </FormLabel>
            <NumberInput
              value={saturationShift}
              onChange={(_, value) => onSaturationShiftChange(value)}
              min={-100}
              max={100}
              size="xs"
              w="60px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          <Slider
            value={saturationShift}
            onChange={onSaturationShiftChange}
            min={-100}
            max={100}
            step={1}
            colorScheme="green"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>

        {/* Lightness Shift */}
        <FormControl>
          <HStack justify="space-between" mb={2}>
            <FormLabel fontSize="xs" color="gray.500" mb={0}>
              Lightness Shift
            </FormLabel>
            <NumberInput
              value={lightnessShift}
              onChange={(_, value) => onLightnessShiftChange(value)}
              min={-100}
              max={100}
              size="xs"
              w="60px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          <Slider
            value={lightnessShift}
            onChange={onLightnessShiftChange}
            min={-100}
            max={100}
            step={1}
            colorScheme="orange"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>
      </VStack>
    </Box>
  );
};
