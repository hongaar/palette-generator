# Color Palette Generator

A modern, responsive SPA React application for generating beautiful color palettes using various algorithms and real-time adjustments.

![Color Palette Generator](https://github.com/user-attachments/assets/f597d9c3-23eb-4062-96c6-be36c7b9b325)

## Features

- **Multiple Base Colors**: Add one or more base colors to start with
- **Flexible Color Count**: Choose the number of colors to generate (2-20)
- **Multiple Algorithms**: 
  - Complementary
  - Triadic
  - Analogous
  - Monochromatic
  - Split Complementary
  - Tetradic
- **Real-time HSL Adjustments**: Fine-tune hue, saturation, and lightness
- **Real-time Generation**: Palette updates instantly as you adjust parameters
- **One-Click Copy**: Copy any color to clipboard with visual feedback
- **URL Sharing**: Generate shareable URLs that preserve all parameters
- **Generate New**: Create new variations using the same parameters
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Colord** for color manipulation
- **React Router** for URL handling
- **Custom CSS** for styling (no heavy UI framework dependencies)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hongaar/palette-generator.git
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

The build artifacts will be stored in the `dist/` directory.

### Linting

```bash
npm run lint
```

## Usage

1. **Add Base Colors**: Enter hex color codes (e.g., #3182ce) in the base colors section
2. **Choose Algorithm**: Select from 6 different color harmony algorithms
3. **Set Color Count**: Specify how many colors you want in your palette
4. **Adjust HSL**: Use the sliders to fine-tune hue, saturation, and lightness
5. **Copy Colors**: Click on any color or the copy button to copy hex codes
6. **Share**: Generate a URL to share your palette configuration
7. **Regenerate**: Create new variations while keeping the same parameters

## Color Algorithms

- **Complementary**: Colors opposite on the color wheel
- **Triadic**: Three colors evenly spaced around the color wheel
- **Analogous**: Colors next to each other on the color wheel  
- **Monochromatic**: Different shades and tints of the same hue
- **Split Complementary**: Base color plus two colors adjacent to its complement
- **Tetradic**: Four colors forming a rectangle on the color wheel

## License

MIT License - see LICENSE file for details.