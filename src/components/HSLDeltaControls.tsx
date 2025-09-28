import React from 'react';
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

interface HSLDeltaControlsProps {
  hueDelta: number;
  saturationDelta: number;
  lightnessDelta: number;
  onHueDeltaChange: (value: number) => void;
  onSaturationDeltaChange: (value: number) => void;
  onLightnessDeltaChange: (value: number) => void;
}

export const HSLDeltaControls: React.FC<HSLDeltaControlsProps> = ({
  hueDelta,
  saturationDelta,
  lightnessDelta,
  onHueDeltaChange,
  onSaturationDeltaChange,
  onLightnessDeltaChange,
}) => {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={4} color="gray.600">
        HSL Delta Controls
      </Text>
      <VStack spacing={4} align="stretch">
        {/* Hue Delta */}
        <FormControl>
          <HStack justify="space-between" mb={2}>
            <FormLabel fontSize="xs" color="gray.500" mb={0}>
              Hue Delta
            </FormLabel>
            <NumberInput
              value={hueDelta}
              onChange={(_, value) => onHueDeltaChange(value)}
              min={1}
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
            value={hueDelta}
            onChange={onHueDeltaChange}
            min={1}
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

        {/* Saturation Delta */}
        <FormControl>
          <HStack justify="space-between" mb={2}>
            <FormLabel fontSize="xs" color="gray.500" mb={0}>
              Saturation Delta
            </FormLabel>
            <NumberInput
              value={saturationDelta}
              onChange={(_, value) => onSaturationDeltaChange(value)}
              min={1}
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
            value={saturationDelta}
            onChange={onSaturationDeltaChange}
            min={1}
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

        {/* Lightness Delta */}
        <FormControl>
          <HStack justify="space-between" mb={2}>
            <FormLabel fontSize="xs" color="gray.500" mb={0}>
              Lightness Delta
            </FormLabel>
            <NumberInput
              value={lightnessDelta}
              onChange={(_, value) => onLightnessDeltaChange(value)}
              min={1}
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
            value={lightnessDelta}
            onChange={onLightnessDeltaChange}
            min={1}
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

