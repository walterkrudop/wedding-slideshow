const fs = require('fs')
const path = require('path')

// 1. Define the file structure and contents
const files = {
  // --- Configuration Files ---
  'package.json': JSON.stringify({
    "name": "wedding-pwa",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "lucide-react": "^0.294.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "devDependencies": {
      "@types/react": "^18.2.37",
      "@types/react-dom": "^18.2.15",
      "@vitejs/plugin-react": "^4.2.0",
      "autoprefixer": "^10.4.16",
      "postcss": "^8.4.31",
      "tailwindcss": "^3.3.5",
      "vite": "^5.0.0",
      "vite-plugin-pwa": "^0.17.0"
    }
  }, null, 2),

  'vite.config.js': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: "Chloe and Brandon's Wedding",
        short_name: "Chloe & Brandon",
        description: "A wedding to remember",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "logo192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        // This ensures the music and images are cached for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,mp3}'] 
      }
    })
  ],
})
`,

  'tailwind.config.js': `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`,

  'postcss.config.js': `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,

  '.gitignore': `
node_modules
dist
.DS_Store
`,

  // --- Public Assets ---
  'index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wedding Slideshow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,

  // --- Source Code ---
  'src/main.jsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,

  'src/index.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;
`,

  // THE MAIN APP CODE GENERATED EARLIER
  'src/App.jsx': `
import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Heart } from 'lucide-react';

const WeddingSlideshow = () => {
  const TOTAL_SLIDES = 8;
  const SLIDE_DURATION = 5000;
  const TRANSITION_DURATION = 2000;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isEnding, setIsEnding] = useState(false);
  
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => ({
    id: i + 1,
    src: \`images/\${i + 1}.jpg\`,
    fallback: \`https://placehold.co/1920x1080/f3f4f6/db2777?text=Wedding+Photo+\${i + 1}\`,
  }));

  // Audio Fade Out Effect
  useEffect(() => {
    if (isEnding && audioRef.current) {
      const audio = audioRef.current;
      const fadeInterval = setInterval(() => {
        // Drop volume by 0.05 every 200ms (approx 4 seconds to silence)
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
        }
      }, 200);
      return () => clearInterval(fadeInterval);
    }
  }, [isEnding]);

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && !isEnding) {
        audioRef.current.volume = 1; // Ensure volume is up
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }

      setShowIntro(true);
      const introTimer = setTimeout(() => {
        setShowIntro(false);
      }, SLIDE_DURATION - 1000);

      timerRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev === TOTAL_SLIDES - 1) {
            // We have reached the end of the last slide's duration
            clearInterval(timerRef.current);
            setIsEnding(true); // Trigger fade to black and audio fade
            return prev;
          }
          return prev + 1;
        });
      }, SLIDE_DURATION);

      return () => {
        clearInterval(timerRef.current);
        clearTimeout(introTimer);
      };
    }
  }, [isPlaying]);

  const handleStart = () => {
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleImageError = (id) => {
    setImagesLoaded(prev => ({ ...prev, [id]: false }));
  };

  const handleImageLoad = (id) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  if (!isPlaying) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-4 font-serif">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-6 border border-rose-100">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <Heart size={32} fill="currentColor" />
          </div>
          
          <div>
            <h1 className="text-3xl font-medium text-gray-800 mb-2">Wedding Album</h1>
            <p className="text-gray-500 italic">A visual journey</p>
          </div>

          <div className="py-4 text-sm text-gray-400 bg-gray-50 rounded-lg">
            <p>Waiting for assets...</p>
            <p className="text-xs mt-1">Place images in <code className="bg-gray-200 px-1 rounded">public/images/1-8.jpg</code></p>
            <p className="text-xs">Place music in <code className="bg-gray-200 px-1 rounded">public/music/music.mp3</code></p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 font-medium shadow-lg shadow-rose-200"
          >
            <Play size={20} fill="currentColor" />
            View Slideshow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <audio ref={audioRef} src="music/music.mp3" loop />

      {/* Fade to Black Overlay */}
      <div 
        className={\`absolute inset-0 bg-black pointer-events-none z-[100] transition-opacity duration-[4000ms] ease-in-out \${
          isEnding ? 'opacity-100' : 'opacity-0'
        }\`} 
      />

      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleMute}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/50 transition-colors border border-white/20"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          
          const slideStyle = {
            opacity: isActive ? 1 : 0,
            transition: \`opacity \${TRANSITION_DURATION}ms ease-in-out\`,
            zIndex: isActive ? 10 : 0,
          };

          return (
            <div 
              key={slide.id}
              className="absolute top-0 left-0 w-full h-full"
              style={slideStyle}
            >
              <img
                src={imagesLoaded[slide.id] === false ? slide.fallback : slide.src}
                alt={\`Wedding Slide \${slide.id}\`}
                onError={() => handleImageError(slide.id)}
                onLoad={() => handleImageLoad(slide.id)}
                className={\`w-full h-full object-cover transition-transform duration-[10000ms] ease-out \${
                  (index <= currentSlide) ? 'scale-110' : 'scale-100'
                }\`}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
        
        <div 
          className={\`transition-all duration-1000 transform \${
            showIntro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}
        >
          {currentSlide === 0 && (
            <h1 className="text-4xl md:text-7xl text-white font-serif tracking-wide drop-shadow-lg text-center px-4">
              A wedding to remember
            </h1>
          )}
        </div>

        <div 
          className={\`transition-all duration-2000 delay-1000 transform \${
            currentSlide === TOTAL_SLIDES - 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }\`}
        >
          {currentSlide === TOTAL_SLIDES - 1 && (
            <div className="text-center space-y-4 px-4">
               <h2 className="text-3xl md:text-6xl text-white font-serif drop-shadow-lg">
                Congratulations
              </h2>
              <h3 className="text-2xl md:text-5xl text-rose-200 font-serif font-light drop-shadow-md">
                Chloe & Brandon
              </h3>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
          style={{ width: \`\${((currentSlide + 1) / TOTAL_SLIDES) * 100}%\` }}
        />
      </div>

    </div>
  );
};

export default WeddingSlideshow;
`
}

// 2. Helper to create directories recursively
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

// 3. Helper to create empty folders for assets
function createAssetFolders() {
  const dirs = ['public/images', 'public/music']
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  })
}

// 4. Main execution
console.log("💍 Initializing Wedding PWA...")

try {
  // Create file structure
  Object.keys(files).forEach(fileName => {
    const content = files[fileName]
    // Trim leading slash if present to avoid absolute path issues
    const safeName = fileName.startsWith('/') ? fileName.slice(1) : fileName

    ensureDirectoryExistence(safeName)
    fs.writeFileSync(safeName, content.trim())
    console.log(`Created file: ${safeName}`)
  })

  // Create asset folders
  createAssetFolders()

  console.log("\n✅ Success! Project structure created.")
  console.log("\nNext steps:")
  console.log("1. Run 'npm install'")
  console.log("2. Add your images to public/images/ (1.jpg - 8.jpg)")
  console.log("3. Add music to public/music/ (music.mp3)")
  console.log("4. Run 'npm run dev' to test")

} catch (err) {
  console.error("Error creating project:", err)
}