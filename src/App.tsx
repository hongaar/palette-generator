import {
    Box,
    Container,
    Divider,
    Heading,
    Text,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { ActionButtons } from './components/ActionButtons';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { ColorCountSelector } from './components/ColorCountSelector';
import { ColorInput } from './components/ColorInput';
import { GPT5Controls } from './components/GPT5Controls';
import { HSLControls } from './components/HSLControls';
import { HSLDeltaControls } from './components/HSLDeltaControls';
import { PaletteDisplay } from './components/PaletteDisplay';
import { Color, PaletteAlgorithm, PaletteSeries } from './types';
import { createColorFromHex, generateAutoPaletteWithLocks, generateGPT5PaletteWrapper, generateMultiplePaletteSeries, generateRandomColor, generateSonnet4PaletteWrapper } from './utils/colorUtils';


function App() {
  const [baseColors, setBaseColors] = useState<string[]>(['#FF6B6B']);
  const [colorCount, setColorCount] = useState<number>(5);
  const [algorithm, setAlgorithm] = useState<PaletteAlgorithm>('complementary');

  // Define maximum colors for each algorithm
  const getMaxColors = (algo: PaletteAlgorithm): number => {
    switch (algo) {
      case 'complementary': return 2;
      case 'triadic': return 3;
      case 'analogous': return 12;
      case 'monochromatic': return 12;
      case 'split-complementary': return 3;
      case 'tetradic': return 4;
      case 'auto-cursor': return 20;
      case 'auto-gpt5': return 10; // Limited to 10 colors for performance
      case 'auto-sonnet4': return 20;
      default: return 12;
    }
  };
  const [hueShift, setHueShift] = useState<number>(0);
  const [saturationShift, setSaturationShift] = useState<number>(0);
  const [lightnessShift, setLightnessShift] = useState<number>(0);
  const [generatedPaletteSeries, setGeneratedPaletteSeries] = useState<PaletteSeries[]>([]);
  const [lockedColors, setLockedColors] = useState<{ [seriesIndex: number]: { [colorIndex: number]: boolean } }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hueDelta, setHueDelta] = useState<number>(30);
  const [saturationDelta, setSaturationDelta] = useState<number>(20);
  const [lightnessDelta, setLightnessDelta] = useState<number>(20);
  const [paletteSeed, setPaletteSeed] = useState<number>(0); // For triggering palette regeneration
  
  // Ref to store previous palette series to avoid infinite loops
  const previousPaletteSeriesRef = useRef<PaletteSeries[]>([]);
  
  // GPT5 algorithm controls
  const [minHueSeparation, setMinHueSeparation] = useState<number>(22);
  const [preferPastel, setPreferPastel] = useState<boolean>(false);
  const [preferDark, setPreferDark] = useState<boolean>(false);
  const [lockAtEnds, setLockAtEnds] = useState<boolean>(false);
  
  const toast = useToast();

  // Initialize from URL parameters first
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Handle multiple base colors
    const baseColorsParam = params.get('baseColors');
    if (baseColorsParam) {
      try {
        const colors = JSON.parse(baseColorsParam);
        if (Array.isArray(colors) && colors.length > 0) {
          setBaseColors(colors);
        }
      } catch (e) {
        // Fallback to single base color for backward compatibility
        const baseColor = params.get('baseColor');
        if (baseColor) {
          setBaseColors([baseColor]);
        }
      }
    } else {
      // Fallback to single base color for backward compatibility
      const baseColor = params.get('baseColor');
      if (baseColor) {
        setBaseColors([baseColor]);
      }
    }
    
    const count = params.get('count');
    const algo = params.get('algorithm');
    const hue = params.get('hue');
    const sat = params.get('saturation');
    const light = params.get('lightness');

    if (count) {
      const countValue = parseInt(count);
      if (!isNaN(countValue) && countValue > 0) {
        setColorCount(countValue);
      }
    }
    if (algo) {
      // Handle backward compatibility for old 'auto' algorithm name
      const algorithmName = algo === 'auto' ? 'auto-cursor' : algo;
      setAlgorithm(algorithmName as PaletteAlgorithm);
    }
    if (hue) {
      const hueValue = parseInt(hue);
      if (!isNaN(hueValue)) setHueShift(hueValue);
    }
    if (sat) {
      const satValue = parseInt(sat);
      if (!isNaN(satValue)) setSaturationShift(satValue);
    }
    if (light) {
      const lightValue = parseInt(light);
      if (!isNaN(lightValue)) setLightnessShift(lightValue);
    }
    
    // Handle HSL delta values
    const hueDeltaParam = params.get('hueDelta');
    const saturationDeltaParam = params.get('saturationDelta');
    const lightnessDeltaParam = params.get('lightnessDelta');
    
    if (hueDeltaParam) {
      const hueDeltaValue = parseInt(hueDeltaParam);
      if (!isNaN(hueDeltaValue) && hueDeltaValue > 0) setHueDelta(hueDeltaValue);
    }
    if (saturationDeltaParam) {
      const saturationDeltaValue = parseInt(saturationDeltaParam);
      if (!isNaN(saturationDeltaValue) && saturationDeltaValue > 0) setSaturationDelta(saturationDeltaValue);
    }
    if (lightnessDeltaParam) {
      const lightnessDeltaValue = parseInt(lightnessDeltaParam);
      if (!isNaN(lightnessDeltaValue) && lightnessDeltaValue > 0) setLightnessDelta(lightnessDeltaValue);
    }
    
    // Handle locked colors for auto algorithm
    const lockedColorsParam = params.get('lockedColors');
    if (lockedColorsParam) {
      try {
        const lockedColorsData = JSON.parse(lockedColorsParam);
        setLockedColors(lockedColorsData);
      } catch (e) {
        // Ignore invalid locked colors data
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Adjust color count when algorithm changes
  useEffect(() => {
    if (!isInitialized) return;
    const maxColors = getMaxColors(algorithm);
    if (colorCount > maxColors) {
      setColorCount(maxColors);
    }
  }, [algorithm, colorCount, isInitialized]);

  // Auto-lock base colors in auto modes
  useEffect(() => {
    if (!isInitialized || !algorithm.startsWith('auto-')) return;
    
    const newLockedColors = { ...lockedColors };
    baseColors.forEach((_, seriesIndex) => {
      if (!newLockedColors[seriesIndex]) {
        newLockedColors[seriesIndex] = {};
      }
      // Always lock the first color (base color) in auto mode
      newLockedColors[seriesIndex][0] = true;
    });
    setLockedColors(newLockedColors);
  }, [algorithm, isInitialized]);

  // Update locked base colors when base colors change in auto mode
  useEffect(() => {
    if (!isInitialized || !algorithm.startsWith('auto-')) return;
    
    // When base colors change, we need to update the locked colors to reflect the new base colors
    // but keep them locked. We do this by clearing the locked colors for changed base colors
    // so they get regenerated with the new base color
    const newLockedColors = { ...lockedColors };
    
    // For each base color series, if the base color changed, we need to regenerate
    // the locked base color while keeping it locked
    baseColors.forEach((_, seriesIndex) => {
      if (!newLockedColors[seriesIndex]) {
        newLockedColors[seriesIndex] = {};
      }
      // Always keep the first color locked in auto mode
      newLockedColors[seriesIndex][0] = true;
    });
    
    setLockedColors(newLockedColors);
  }, [baseColors, algorithm, isInitialized]);

  // Generate palette series whenever parameters change
  useEffect(() => {
    if (!isInitialized) return;
    if (baseColors.length > 0) {
      if (algorithm === 'auto-cursor') {
        // For auto-cursor algorithm, generate with locked colors
        const paletteSeries = baseColors.map((baseColor, seriesIndex) => {
          const baseColorObj = createColorFromHex(baseColor);
          const seriesLockedColors = Object.entries(lockedColors[seriesIndex] || {})
            .filter(([_, isLocked]) => isLocked)
            .map(([colorIndex, _]) => ({
              color: previousPaletteSeriesRef.current[seriesIndex]?.palette[parseInt(colorIndex)] || baseColorObj,
              index: parseInt(colorIndex)
            }));
          
          const palette = generateAutoPaletteWithLocks(
            baseColorObj,
            colorCount,
            seriesLockedColors,
            hueShift,
            saturationShift,
            lightnessShift,
            hueDelta,
            saturationDelta,
            lightnessDelta,
            paletteSeed
          );
          
          return {
            baseColor,
            palette
          };
        });
        setGeneratedPaletteSeries(paletteSeries);
        previousPaletteSeriesRef.current = paletteSeries;
      } else if (algorithm === 'auto-gpt5') {
        // For GPT5 algorithm, use GPT5 wrapper with options
        const paletteSeries = generateGPT5PaletteWrapper(baseColors, colorCount, {
          minHueSeparation,
          preferPastel,
          preferDark,
          lockAtEnds,
          seed: paletteSeed
        });
        setGeneratedPaletteSeries(paletteSeries);
        previousPaletteSeriesRef.current = paletteSeries;
      } else if (algorithm === 'auto-sonnet4') {
        // For Sonnet4 algorithm, use Sonnet4 wrapper
        const paletteSeries = generateSonnet4PaletteWrapper(baseColors, colorCount, paletteSeed);
        setGeneratedPaletteSeries(paletteSeries);
        previousPaletteSeriesRef.current = paletteSeries;
      } else {
        // For other algorithms, use standard generation
        const paletteSeries = generateMultiplePaletteSeries(
          baseColors,
          colorCount,
          algorithm,
          hueShift,
          saturationShift,
          lightnessShift
        );
        setGeneratedPaletteSeries(paletteSeries);
        previousPaletteSeriesRef.current = paletteSeries;
      }
    }
  }, [baseColors, colorCount, algorithm, hueShift, saturationShift, lightnessShift, lockedColors, isInitialized, hueDelta, saturationDelta, lightnessDelta, paletteSeed, minHueSeparation, preferPastel, preferDark, lockAtEnds]);

  const updateUrl = () => {
    const params = new URLSearchParams();
    
    // Handle multiple base colors
    if (baseColors.length > 0) {
      if (baseColors.length === 1) {
        // Single color - use baseColor for backward compatibility
        params.set('baseColor', baseColors[0]);
      } else {
        // Multiple colors - use baseColors array
        params.set('baseColors', JSON.stringify(baseColors));
      }
    }
    
    params.set('count', colorCount.toString());
    params.set('algorithm', algorithm);
    params.set('hue', hueShift.toString());
    params.set('saturation', saturationShift.toString());
    params.set('lightness', lightnessShift.toString());
    
    // Include HSL delta values for auto algorithm
    if (algorithm.startsWith('auto-')) {
      params.set('hueDelta', hueDelta.toString());
      params.set('saturationDelta', saturationDelta.toString());
      params.set('lightnessDelta', lightnessDelta.toString());
    }
    
    // Include locked colors for auto algorithm
    if (algorithm.startsWith('auto-') && Object.keys(lockedColors).length > 0) {
      params.set('lockedColors', JSON.stringify(lockedColors));
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    if (!isInitialized) return;
    updateUrl();
  }, [baseColors, colorCount, algorithm, hueShift, saturationShift, lightnessShift, lockedColors, isInitialized, hueDelta, saturationDelta, lightnessDelta]);

  const generateNewPalette = () => {
    // Generate new random colors but keep the same number of base colors
    const newBaseColors = baseColors.map(() => generateRandomColor());
    setBaseColors(newBaseColors);
  };

  const randomizePalette = () => {
    // Only works in auto mode - randomizes non-locked colors
    if (algorithm.startsWith('auto-')) {
      // Trigger palette regeneration by updating the seed
      setPaletteSeed(prev => prev + 1);
    }
  };

  const toggleColorLock = (seriesIndex: number, colorIndex: number) => {
    setLockedColors(prev => ({
      ...prev,
      [seriesIndex]: {
        ...prev[seriesIndex],
        [colorIndex]: !prev[seriesIndex]?.[colorIndex]
      }
    }));
  };

  const setAsBaseColor = (seriesIndex: number, _colorIndex: number, color: Color) => {
    // Set the selected color as the new base color for that series
    const newBaseColors = [...baseColors];
    newBaseColors[seriesIndex] = color.hex;
    setBaseColors(newBaseColors);
    
    toast({
      title: 'Base color updated!',
      description: `${color.hex} set as new base color`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const addAsBaseColor = (_seriesIndex: number, _colorIndex: number, color: Color) => {
    // Add the selected color as a new base color, keeping existing ones
    const newBaseColors = [...baseColors, color.hex];
    setBaseColors(newBaseColors);
    
    toast({
      title: 'Base color added!',
      description: `${color.hex} added as new base color`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const removeBaseColor = (seriesIndex: number) => {
    // Remove the base color at the specified index
    if (baseColors.length > 1) {
      const newBaseColors = baseColors.filter((_, index) => index !== seriesIndex);
      setBaseColors(newBaseColors);
      
      toast({
        title: 'Base color removed!',
        description: `Base color removed from collection`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleColorCountChange = (newCount: number) => {
    const maxColors = getMaxColors(algorithm);
    const adjustedCount = Math.min(newCount, maxColors);
    setColorCount(adjustedCount);
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
                  onColorCountChange={handleColorCountChange}
                  algorithm={algorithm}
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

              <PaletteDisplay 
                paletteSeries={generatedPaletteSeries} 
                onToggleLock={algorithm.startsWith('auto-') ? toggleColorLock : undefined}
                onSetAsBaseColor={setAsBaseColor}
                onAddAsBaseColor={addAsBaseColor}
                onRemoveBaseColor={removeBaseColor}
                lockedColors={lockedColors}
                algorithm={algorithm}
              />

              <ActionButtons
                onGenerateNew={generateNewPalette}
                onRandomizePalette={randomizePalette}
                algorithm={algorithm}
              />

              {algorithm === 'auto-cursor' && (
                <>
                  <Divider />
                  <HSLDeltaControls
                    hueDelta={hueDelta}
                    saturationDelta={saturationDelta}
                    lightnessDelta={lightnessDelta}
                    onHueDeltaChange={setHueDelta}
                    onSaturationDeltaChange={setSaturationDelta}
                    onLightnessDeltaChange={setLightnessDelta}
                  />
                </>
              )}

              {algorithm === 'auto-gpt5' && (
                <>
                  <Divider />
                  <GPT5Controls
                    minHueSeparation={minHueSeparation}
                    preferPastel={preferPastel}
                    preferDark={preferDark}
                    lockAtEnds={lockAtEnds}
                    onMinHueSeparationChange={setMinHueSeparation}
                    onPreferPastelChange={setPreferPastel}
                    onPreferDarkChange={setPreferDark}
                    onLockAtEndsChange={setLockAtEnds}
                  />
                </>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
