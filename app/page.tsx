'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AvoidButtonPage() {
  // Pozycja uciekającego przycisku NIE (w procentach kontenera)
  const [position, setPosition] = useState({ x: 62, y: 50 }); // Startuje po prawej stronie TAK
  // Czy gra się zaczęła (czy aktywowaliśmy uciekanie)
  const [isMoving, setIsMoving] = useState(false);
  // Skala uciekającego przycisku
  const [avoidScale, setAvoidScale] = useState(1);
  // Stan ekranu końcowego
  const [gameState, setGameState] = useState<'playing' | 'success'>('playing');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFirstInteraction = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMoving(true);
    moveButton();
  };

  const moveButton = () => {
    if (gameState !== 'playing') return;

    // Strategie losowania pozycji wokół środka (x:50, y:50), aby NIE nigdy nie wleciał na TAK
    const strategies = ['left', 'right', 'top', 'bottom'];
    const currentStrategy = strategies[Math.floor(Math.random() * strategies.length)];

    let randomX = 50;
    let randomY = 50;

    switch (currentStrategy) {
      case 'left':
        randomX = Math.floor(Math.random() * 22) + 12; // od 12% do 34% szerokości
        randomY = Math.floor(Math.random() * 66) + 17; 
        break;
      case 'right':
        randomX = Math.floor(Math.random() * 22) + 66; // od 66% do 88% szerokości
        randomY = Math.floor(Math.random() * 66) + 17;
        break;
      case 'top':
        randomX = Math.floor(Math.random() * 66) + 17; 
        randomY = Math.floor(Math.random() * 18) + 14; // od 14% do 32% wysokości (nad TAK)
        break;
      case 'bottom':
        randomX = Math.floor(Math.random() * 66) + 17;
        randomY = Math.floor(Math.random() * 18) + 68; // od 68% do 86% wysokości (pod TAK)
        break;
    }

    setPosition({ x: randomX, y: randomY });

    // Przycisk NIE staje się coraz mniejszy
    setAvoidScale(prev => Math.max(prev * 0.92, 0.4));
  };

  const springTransition = {
    type: "spring",
    stiffness: 150,
    damping: 16,
    mass: 0.6
  };

  return (
    <main className="flex flex-col min-h-screen justify-center align-center bg-[#120621] text-white font-sans overflow-hidden select-none">
      
      {/* GÓRA: Wyśrodkowana, minimalistyczna sekcja z zapytaniem lub obrazkiem png (40vh) */}
      <section className="flex flex-col items-center justify-center text-center p-6 h-[60vh] relative z-10">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-sm px-4 mx-auto"
            >
              <h1 className="text-3xl font-bold tracking-tight">
                pojdziesz sie w koncu uczyc?
              </h1>
            </motion.div>
          ) : (
            /* DRUGI EKRAN: Tylko i wyłącznie czysty plik PNG */
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              <img 
                src="/sonbiotic.png" 
                alt="Sonbiotic" 
                className="max-h-[30vh] w-auto object-contain select-none pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
              {/* DÓŁ: Przestrzeń interakcji przycisków (60vh) */}
      <section 
        ref={containerRef}
        className="relative flex-1 h-[60vh] w-full max-w-md mx-auto p-4 overflow-hidden"
      >
        {gameState === 'playing' && (
          <div className="absolute inset-0 w-full h-full">
            
            {/* Przycisk TAK – Zablokowany na stałe na pozycji x: -55px od środka layoutu */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div style={{ transform: 'translateX(-55px)' }}>
                <motion.button
                  onClick={() => setGameState('success')}
                  whileTap={{ scale: 0.96 }}
                  className="px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm transition-colors whitespace-nowrap tracking-wide"
                >
                  TAK!
                </motion.button>
              </div>
            </div>

            {/* Pierwotny przycisk NIE – idealnie zbalansowany po prawej stronie (+55px od środka) */}
            <AnimatePresence>
              {!isMoving && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: 55 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <button
                      onMouseEnter={handleFirstInteraction}
                      onTouchStart={handleFirstInteraction}
                      onClick={handleFirstInteraction}
                      className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-purple-200 font-medium rounded-lg text-sm transition-colors whitespace-nowrap tracking-wide"
                    >
                      NIE
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Właściwy uciekający przycisk NIE – latający bezkolizyjnie */}
            {isMoving && (
              <motion.button
                onMouseEnter={moveButton}
                onTouchStart={(e) => { e.preventDefault(); moveButton(); }}
                onClick={moveButton}
                animate={{ 
                  top: `${position.y}%`, 
                  left: `${position.x}%`,
                  scale: avoidScale 
                }}
                transition={springTransition}
                style={{
                  position: 'absolute',
                  x: '-50%',
                  y: '-50%',
                }}
                className="absolute z-30 px-6 py-2.5 bg-white/5 text-purple-300/70 font-medium rounded-lg text-xs whitespace-nowrap border border-white/5 backdrop-blur-sm"
              >
                NIE
              </motion.button>
            )}

          </div>
        )}
      </section>

      </section>


    </main>
  );
}