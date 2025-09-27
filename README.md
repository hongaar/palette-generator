# Color Palette Generator

A modern React SPA for generating beautiful color palettes with advanced algorithms and real-time adjustments. Built with Vite, TypeScript, and Chakra UI.

## Features

- 🎨 **Multiple Base Colors**: Support for one or more base colors
- 🔢 **Customizable Color Count**: Generate 1-12 colors per palette
- 🧮 **Advanced Algorithms**: 6 different color harmony algorithms
  - Complementary
  - Triadic
  - Analogous
  - Monochromatic
  - Split Complementary
  - Tetradic
- 🎛️ **HSL Parameter Controls**: Fine-tune hue, saturation, and lightness
- ⚡ **Real-time Generation**: Instant palette updates as you adjust parameters
- 📋 **Copy Functionality**: Copy individual colors, entire palettes, or JSON data
- 🔗 **URL Sharing**: Share palettes via URL with all parameters preserved
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎲 **Random Generation**: Generate new palettes with random base colors

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd palette-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Basic Usage

1. **Select Base Color**: Use the color picker to choose your starting color
2. **Choose Algorithm**: Select from 6 different color harmony algorithms
3. **Set Color Count**: Choose how many colors to generate (1-12)
4. **Adjust HSL Parameters**: Fine-tune the palette with hue, saturation, and lightness shifts
5. **Copy Colors**: Click on any color to copy its hex value, or use the "Copy All" button

### Advanced Features

#### HSL Adjustments
- **Hue Shift**: Rotate the color wheel (-180° to +180°)
- **Saturation Shift**: Adjust color intensity (-100% to +100%)
- **Lightness Shift**: Control brightness (-100% to +100%)

#### Color Algorithms
- **Complementary**: Colors opposite on the color wheel
- **Triadic**: Three colors evenly spaced around the color wheel
- **Analogous**: Colors adjacent to each other on the color wheel
- **Monochromatic**: Variations of the same hue with different saturation/lightness
- **Split Complementary**: Base color plus two colors adjacent to its complement
- **Tetradic**: Four colors forming a rectangle on the color wheel

#### Sharing Palettes
- Click "Share URL" to copy a link that recreates your exact palette
- All parameters (base color, algorithm, count, HSL shifts) are preserved in the URL

### Keyboard Shortcuts

- `Space`: Generate new random palette
- `Ctrl/Cmd + C`: Copy selected color (when color is focused)

## Technical Details

### Architecture

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Chakra UI for modern, accessible components
- **Styling**: Emotion (included with Chakra UI)
- **Color Processing**: Custom HSL/RGB conversion utilities

### Color Algorithms

The application implements scientifically-based color harmony algorithms:

1. **Complementary**: Uses 180° hue separation
2. **Triadic**: Uses 120° hue separation
3. **Analogous**: Uses 30° hue separation
4. **Monochromatic**: Varies saturation and lightness while keeping hue constant
5. **Split Complementary**: Uses 150° and 210° hue separation
6. **Tetradic**: Uses 90°, 180°, and 270° hue separation

### Performance

- Real-time palette generation with optimized color calculations
- Responsive design that works on all screen sizes
- Efficient re-rendering with React hooks and state management

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ColorInput.tsx
│   ├── AlgorithmSelector.tsx
│   ├── ColorCountSelector.tsx
│   ├── HSLControls.tsx
│   ├── PaletteDisplay.tsx
│   └── ActionButtons.tsx
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── colorUtils.ts
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Color theory principles based on traditional color harmony
- HSL color space for intuitive color manipulation
- Modern web standards for optimal performance
