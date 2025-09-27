import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
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
import { Color } from '../types';
import { copyToClipboard } from '../utils/colorUtils';

interface PaletteDisplayProps {
  palette: Color[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ palette }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const toast = useToast();

  const copyColor = async (color: Color, index: number) => {
    await copyToClipboard(color.hex);
    setCopiedIndex(index);
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
    const hexColors = palette.map(color => color.hex).join(', ');
    await copyToClipboard(hexColors);
    toast({
      title: 'All colors copied!',
      description: 'Color palette copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const copyAsJSON = async () => {
    const jsonString = JSON.stringify(palette, null, 2);
    await copyToClipboard(jsonString);
    toast({
      title: 'JSON copied!',
      description: 'Color palette JSON copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (palette.length === 0) {
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
          Generated Palette
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

      <Grid
        templateColumns={{
          base: 'repeat(auto-fit, minmax(120px, 1fr))',
          md: 'repeat(auto-fit, minmax(150px, 1fr))',
        }}
        gap={4}
        mb={4}
      >
        {palette.map((color, index) => (
          <Box
            key={index}
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
            onClick={() => copyColor(color, index)}
          >
            <VStack spacing={2} align="stretch" h="full" justify="space-between">
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={color.hsl.l > 50 ? 'black' : 'white'}
                  textAlign="center"
                >
                  {color.hex}
                </Text>
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

            {copiedIndex === index && (
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

      <Text fontSize="xs" color="gray.500" textAlign="center">
        Click on any color to copy its hex value
      </Text>
    </Box>
  );
};
