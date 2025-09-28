import { AddIcon, CopyIcon, DeleteIcon, ExternalLinkIcon, LockIcon, StarIcon, UnlockIcon } from '@chakra-ui/icons';
import {
    Badge,
    Box,
    Button,
    Code,
    Grid,
    HStack,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Color, PaletteSeries } from '../types';
import { copyToClipboard } from '../utils/colorUtils';

interface PaletteDisplayProps {
  paletteSeries: PaletteSeries[];
  onToggleLock?: (seriesIndex: number, colorIndex: number) => void;
  onSetAsBaseColor?: (seriesIndex: number, colorIndex: number, color: Color) => void;
  onAddAsBaseColor?: (seriesIndex: number, colorIndex: number, color: Color) => void;
  onRemoveBaseColor?: (seriesIndex: number) => void;
  lockedColors?: { [seriesIndex: number]: { [colorIndex: number]: boolean } };
  algorithm?: string;
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ 
  paletteSeries, 
  onToggleLock, 
  onSetAsBaseColor,
  onAddAsBaseColor,
  onRemoveBaseColor,
  lockedColors = {},
  algorithm
}) => {
  const [copiedIndex, setCopiedIndex] = useState<{ seriesIndex: number; colorIndex: number } | null>(null);
  const toast = useToast();

  const copyColor = async (color: Color, seriesIndex: number, colorIndex: number) => {
    await copyToClipboard(color.hex);
    setCopiedIndex({ seriesIndex, colorIndex });
    toast({
      title: 'Color copied!',
      description: `${color.hex} copied to clipboard`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllColors = async () => {
    const allColors = paletteSeries.flatMap(series => series.palette);
    const hexColors = allColors.map(color => color.hex).join(', ');
    await copyToClipboard(hexColors);
    toast({
      title: 'All colors copied!',
      description: 'All palette colors copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const copyAsJSON = async () => {
    const jsonString = JSON.stringify(paletteSeries, null, 2);
    await copyToClipboard(jsonString);
    toast({
      title: 'JSON copied!',
      description: 'Palette series JSON copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (paletteSeries.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No colors to display</Text>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
          Generated Palettes
        </Text>
        <HStack spacing={2}>
          <Button
            size="xs"
            leftIcon={<CopyIcon />}
            onClick={copyAllColors}
            colorScheme="blue"
            variant="outline"
          >
            Copy All
          </Button>
          <Button
            size="xs"
            leftIcon={<ExternalLinkIcon />}
            onClick={copyAsJSON}
            colorScheme="purple"
            variant="outline"
          >
            Copy JSON
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        {paletteSeries.map((series, seriesIndex) => (
          <Box key={seriesIndex}>
            <HStack mb={3} align="center" justify="space-between">
              <HStack align="center">
                <Box
                  w="20px"
                  h="20px"
                  bg={series.baseColor}
                  borderRadius="md"
                  border="2px solid"
                  borderColor="gray.300"
                />
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Base Color: {series.baseColor}
                </Text>
              </HStack>
              {onRemoveBaseColor && paletteSeries.length > 1 && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onRemoveBaseColor(seriesIndex)}
                  title="Remove base color"
                >
                  <DeleteIcon boxSize={3} />
                </Button>
              )}
            </HStack>
            
            <Grid
              templateColumns={{
                base: 'repeat(auto-fit, minmax(120px, 1fr))',
                md: 'repeat(auto-fit, minmax(150px, 1fr))',
              }}
              gap={4}
            >
              {series.palette.map((color, colorIndex) => (
                <Box
                  key={colorIndex}
                  bg={color.hex}
                  borderRadius="lg"
                  p={4}
                  minH="120px"
                  position="relative"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ transform: 'scale(1.02)' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => copyColor(color, seriesIndex, colorIndex)}
                >
                  <VStack spacing={2} align="stretch" h="full" justify="space-between">
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={color.hsl.l > 50 ? 'black' : 'white'}
                        textAlign="center"
                        mb={2}
                      >
                        {color.hex}
                      </Text>
                      <HStack justify="center" spacing={1} mb={1}>
                        {onAddAsBaseColor && (
                          <Button
                            size="xs"
                            variant="ghost"
                            color={color.hsl.l > 50 ? 'black' : 'white'}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddAsBaseColor(seriesIndex, colorIndex, color);
                            }}
                            _hover={{ bg: color.hsl.l > 50 ? 'blackAlpha.200' : 'whiteAlpha.200' }}
                            title="Add as base color"
                          >
                            <AddIcon boxSize={3} />
                          </Button>
                        )}
                        {onSetAsBaseColor && (
                          <Button
                            size="xs"
                            variant="ghost"
                            color={color.hsl.l > 50 ? 'black' : 'white'}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetAsBaseColor(seriesIndex, colorIndex, color);
                            }}
                            _hover={{ bg: color.hsl.l > 50 ? 'blackAlpha.200' : 'whiteAlpha.200' }}
                            title="Set as base color"
                          >
                            <StarIcon boxSize={3} />
                          </Button>
                        )}
                        {onToggleLock && (
                          <Button
                            size="xs"
                            variant="ghost"
                            color={color.hsl.l > 50 ? 'black' : 'white'}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Don't allow unlocking base color (index 0) in auto mode
                              if (algorithm === 'auto' && colorIndex === 0) return;
                              onToggleLock(seriesIndex, colorIndex);
                            }}
                            _hover={{ bg: color.hsl.l > 50 ? 'blackAlpha.200' : 'whiteAlpha.200' }}
                            opacity={algorithm === 'auto' && colorIndex === 0 ? 0.5 : 1}
                            cursor={algorithm === 'auto' && colorIndex === 0 ? 'not-allowed' : 'pointer'}
                          >
                            {lockedColors[seriesIndex]?.[colorIndex] ? (
                              <LockIcon boxSize={3} />
                            ) : (
                              <UnlockIcon boxSize={3} />
                            )}
                          </Button>
                        )}
                      </HStack>
                      <Text
                        fontSize="xs"
                        color={color.hsl.l > 50 ? 'black' : 'white'}
                        textAlign="center"
                        opacity={0.8}
                      >
                        HSL({Math.round(color.hsl.h)}, {Math.round(color.hsl.s)}%, {Math.round(color.hsl.l)}%)
                      </Text>
                    </Box>
                    
                    <HStack justify="center" spacing={1}>
                      <Badge
                        size="sm"
                        colorScheme={color.hsl.l > 50 ? 'gray' : 'white'}
                        variant="solid"
                        bg={color.hsl.l > 50 ? 'blackAlpha.200' : 'whiteAlpha.200'}
                      >
                        RGB
                      </Badge>
                      <Code
                        fontSize="xs"
                        color={color.hsl.l > 50 ? 'black' : 'white'}
                        bg="transparent"
                      >
                        {color.rgb.r},{color.rgb.g},{color.rgb.b}
                      </Code>
                    </HStack>
                  </VStack>

                  {copiedIndex?.seriesIndex === seriesIndex && copiedIndex?.colorIndex === colorIndex && (
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      bg="blackAlpha.800"
                      color="white"
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      Copied!
                    </Box>
                  )}
                </Box>
              ))}
            </Grid>
          </Box>
        ))}
      </VStack>

      <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
        Click on any color to copy its hex value
      </Text>
    </Box>
  );
};
