import {
    Box,
    Container,
    Divider,
    Heading,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ActionButtons } from './components/ActionButtons';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { ColorCountSelector } from './components/ColorCountSelector';
import { ColorInput } from './components/ColorInput';
import { HSLControls } from './components/HSLControls';
import { PaletteDisplay } from './components/PaletteDisplay';
import { Color, PaletteAlgorithm } from './types';
import { generatePalette, generateRandomColor } from './utils/colorUtils';

function App() {
  const [baseColors, setBaseColors] = useState<string[]>(['#FF6B6B']);
  const [colorCount, setColorCount] = useState<number>(5);
  const [algorithm, setAlgorithm] = useState<PaletteAlgorithm>('complementary');
  const [hueShift, setHueShift] = useState<number>(0);
  const [saturationShift, setSaturationShift] = useState<number>(0);
  const [lightnessShift, setLightnessShift] = useState<number>(0);
  const [generatedPalette, setGeneratedPalette] = useState<Color[]>([]);

  // Generate palette whenever parameters change
  useEffect(() => {
    if (baseColors.length > 0) {
      const palette = generatePalette(
        baseColors,
        colorCount,
        algorithm,
        hueShift,
        saturationShift,
        lightnessShift
      );
      setGeneratedPalette(palette);
    }
  }, [baseColors, colorCount, algorithm, hueShift, saturationShift, lightnessShift]);

  // URL sharing functionality
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const baseColor = params.get('baseColor');
    const count = params.get('count');
    const algo = params.get('algorithm');
    const hue = params.get('hue');
    const sat = params.get('saturation');
    const light = params.get('lightness');

    if (baseColor) setBaseColors([baseColor]);
    if (count) setColorCount(parseInt(count));
    if (algo) setAlgorithm(algo as PaletteAlgorithm);
    if (hue) setHueShift(parseInt(hue));
    if (sat) setSaturationShift(parseInt(sat));
    if (light) setLightnessShift(parseInt(light));
  }, []);

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (baseColors.length > 0) params.set('baseColor', baseColors[0]);
    params.set('count', colorCount.toString());
    params.set('algorithm', algorithm);
    params.set('hue', hueShift.toString());
    params.set('saturation', saturationShift.toString());
    params.set('lightness', lightnessShift.toString());
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    updateUrl();
  }, [baseColors, colorCount, algorithm, hueShift, saturationShift, lightnessShift]);

  const generateNewPalette = () => {
    const randomColor = generateRandomColor();
    setBaseColors([randomColor]);
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="2xl" mb={4} bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Color Palette Generator
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Create beautiful color palettes with advanced algorithms and real-time adjustments
            </Text>
          </Box>

          <Box bg={cardBg} p={6} borderRadius="lg" shadow="lg">
            <VStack spacing={6} align="stretch">
              <Box
                display={{ base: 'block', md: 'flex' }}
                gap={6}
                justifyContent="center"
                alignItems="flex-start"
              >
                <ColorInput
                  baseColors={baseColors}
                  onBaseColorsChange={setBaseColors}
                />
                <ColorCountSelector
                  colorCount={colorCount}
                  onColorCountChange={setColorCount}
                />
                <AlgorithmSelector
                  algorithm={algorithm}
                  onAlgorithmChange={setAlgorithm}
                />
              </Box>

              <Divider />

              <HSLControls
                hueShift={hueShift}
                saturationShift={saturationShift}
                lightnessShift={lightnessShift}
                onHueShiftChange={setHueShift}
                onSaturationShiftChange={setSaturationShift}
                onLightnessShiftChange={setLightnessShift}
              />

              <Divider />

              <PaletteDisplay palette={generatedPalette} />

              <ActionButtons
                onGenerateNew={generateNewPalette}
              />
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
