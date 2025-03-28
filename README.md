# PDF Annotation Tool

## Overview
A modern web application for annotating and signing PDF documents with a rich, interactive interface built using Next.js and React.

## Features
- PDF Document Upload and Viewing
- Multiple Annotation Tools:
  - Free Drawing
  - Text Highlighting
  - Text Insertion with Formatting
  - Signature Placement
- Color Customization for Annotations
- Page Navigation
- Export Annotated PDF
- Responsive Design

## Tech Stack & Libraries

### Core Technologies
- Next.js 15
- React
- TypeScript
- Tailwind CSS

### Key Libraries
- `pdf-lib`: PDF manipulation and annotation
- `react-pdf-viewer`: PDF rendering
- `react-konva`: Interactive annotation canvas
- `react-color`: Color picker for annotations
- `lucide-react`: Icons
- `react-hot-toast`: Notification system

## Challenges & Solutions
- Initially attempted to use Fabric.js for annotations
- Switched to react-konva for more streamlined drawing and interaction
- Implemented coordinate translation for accurate PDF annotation
- Created complex state management for different annotation types

## Setup & Installation

1. Clone the repository
```bash
git clone https://github.com/D-o-v/pdf-annotation-tool.git
cd pdf-annotation-tool
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

## Potential Future Improvements
- Enhanced pagination and page navigation
- More sophisticated text editing tools
- Advanced signature capture
- Cloud storage integration
- Collaborative annotation features
- Accessibility improvements

## Limitations
- Current version has basic pagination functionality
- Limited to single PDF at a time
- No OCR or text extraction capabilities

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
MIT License
