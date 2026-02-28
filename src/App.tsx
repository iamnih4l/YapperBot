import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ChevronRight, Github, Mail, Linkedin, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { geminiModel } from '@/lib/gemini';

// Types
interface BotProfile {
  name: string;
  stance: 'PRO' | 'AGAINST';
  credibility: number;
  avatar: string;
}

interface Message {
  speaker: string;
  text: string;
  impact?: 'normal' | 'strong';
}

type GameMode = 'landing' | 'menu' | 'topic-input' | 'bot-vs-bot' | 'user-vs-bot' | 'end';
type UserAction = 'ARGUE' | 'REBUT' | 'QUESTION' | 'CONCEDE';

// Audio Hook
const useAudio = () => {
  const [isMuted, setIsMuted] = React.useState(true); // Default muted to ensure browsers don't block autoplay
  const bgMusicRef = React.useRef<HTMLAudioElement | null>(null);
  const botDamageSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const userDamageSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const secret67SoundRef = React.useRef<HTMLAudioElement | null>(null);
  const startSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const winSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (!bgMusicRef.current) {
      // Create audio object referencing a file in the public/ folder
      bgMusicRef.current = new Audio('/theme-song.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.3; // Lower volume for background music
    }
    if (!botDamageSoundRef.current) {
      botDamageSoundRef.current = new Audio('/damage-sound.mp3');
      botDamageSoundRef.current.volume = 0.8;
    }
    if (!userDamageSoundRef.current) {
      userDamageSoundRef.current = new Audio('/easter-egg.mp3');
      userDamageSoundRef.current.volume = 0.8;
    }
    if (!secret67SoundRef.current) {
      secret67SoundRef.current = new Audio('/secret-67.mp3');
      secret67SoundRef.current.volume = 1.0;
    }
    if (!startSoundRef.current) {
      startSoundRef.current = new Audio('/start-sound.mp3');
      startSoundRef.current.volume = 1.0;
    }
    if (!winSoundRef.current) {
      winSoundRef.current = new Audio('/win-sound.mp3');
      winSoundRef.current.volume = 1.0;
    }
    if (!loseSoundRef.current) {
      loseSoundRef.current = new Audio('/lose-sound.mp3');
      loseSoundRef.current.volume = 1.0;
    }

    if (!isMuted) {
      bgMusicRef.current.play().catch(e => console.warn('Autoplay blocked:', e));
    } else {
      bgMusicRef.current.pause();
    }
  }, [isMuted]);

  const playBotDamageSound = React.useCallback(() => {
    if (isMuted || !botDamageSoundRef.current) return;
    botDamageSoundRef.current.currentTime = 0;
    botDamageSoundRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  }, [isMuted]);

  const playUserDamageSound = React.useCallback(() => {
    if (isMuted || !userDamageSoundRef.current) return;
    userDamageSoundRef.current.currentTime = 0;
    userDamageSoundRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  }, [isMuted]);

  const playSecret67Sound = React.useCallback(() => {
    if (isMuted || !secret67SoundRef.current) return;
    secret67SoundRef.current.currentTime = 0;
    secret67SoundRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  }, [isMuted]);

  const playStartSound = React.useCallback(() => {
    if (isMuted || !startSoundRef.current) return;
    startSoundRef.current.currentTime = 0;
    startSoundRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  }, [isMuted]);

  const playWinSound = React.useCallback(() => {
    if (isMuted || !winSoundRef.current) return;
    winSoundRef.current.currentTime = 0;
    winSoundRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  }, [isMuted]);

  const playLoseSound = React.useCallback(() => {
    if (isMuted || !loseSoundRef.current) return;
    loseSoundRef.current.currentTime = 0;
    loseSoundRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  }, [isMuted]);

  const playSound = React.useCallback((type: string) => {
    if (isMuted) return;
    console.log(`Playing sound: ${type}`);
  }, [isMuted]);

  return { isMuted, setIsMuted, playSound, playBotDamageSound, playUserDamageSound, playSecret67Sound, playStartSound, playWinSound, playLoseSound };
};


// Typewriter Text Component
const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({
  text,
  speed = 30,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

// Credibility Bar Component
const CredibilityBar: React.FC<{ value: number; label: string; side: 'left' | 'right' }> = ({
  value,
  label,
  side
}) => {
  const segments = 20;
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div className={cn("flex flex-col gap-2", side === 'right' && 'items-end')}>
      <div className="text-xs font-bold text-yellow-400 tracking-wider pixel-text">{label}</div>
      <div className="flex gap-[2px]">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-4 border border-black transition-all duration-300",
              index < filledSegments ? "bg-yellow-400" : "bg-gray-700"
            )}
          />
        ))}
      </div>
      <div className="text-xs font-bold text-yellow-400 pixel-text">{value}/100</div>
    </div>
  );
};

// Bot Avatar Component
const BotAvatar: React.FC<{ bot: BotProfile; isActive: boolean; side: 'left' | 'right' }> = ({
  bot,
  isActive,
  side
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center gap-3 p-4 border-4 border-black bg-gray-200 transition-all duration-300",
      isActive && "scale-105 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
    )}>
      <div className="w-24 h-24 bg-gray-400 border-4 border-black flex items-center justify-center text-4xl">
        {bot.avatar}
      </div>
      <div className="text-center">
        <div className="text-sm font-bold pixel-text">{bot.name}</div>
        <div className={cn(
          "text-xs font-bold pixel-text mt-1 px-2 py-1 border-2 border-black",
          bot.stance === 'PRO' ? "bg-green-400" : "bg-red-400"
        )}>
          {bot.stance}
        </div>
      </div>
      <CredibilityBar value={bot.credibility} label="CREDIBILITY" side={side} />
    </div>
  );
};

// Dialogue Box Component
const DialogueBox: React.FC<{ message: Message | null; isTyping: boolean }> = ({ message, isTyping }) => {
  return (
    <div className="w-full border-4 border-black bg-white p-6 min-h-[120px] relative">
      <div className="absolute top-2 left-2 w-3 h-3 bg-black animate-pulse" />
      {message && (
        <div className="space-y-2">
          <div className="text-sm font-bold text-gray-700 pixel-text">{message.speaker}:</div>
          <div className="text-base pixel-text leading-relaxed">
            {isTyping ? (
              <TypewriterText text={message.text} speed={30} />
            ) : (
              message.text
            )}
          </div>
        </div>
      )}
      {!message && (
        <div className="flex items-center justify-center h-full text-gray-400 pixel-text">
          Waiting for debate to begin...
        </div>
      )}
    </div>
  );
};

// Interactive 3D Pixel Robot Component (R2D2 Style)
const PixelRobot3D: React.FC = () => {
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setCoords({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ perspective: 1000 }}>
      <motion.div
        className="relative w-64 h-80"
        animate={{
          rotateX: coords.y * -15,
          rotateY: coords.x * 25,
        }}
        transition={{ type: 'spring', stiffness: 75, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Robot Legs (Back Layer) */}
        <div className="absolute top-24 left-2 w-12 h-40 bg-gray-400 border-4 border-black" style={{ transform: 'translateZ(-10px)' }}>
          <div className="absolute bottom-0 -left-4 w-20 h-12 bg-gray-500 border-b-4 border-r-4 border-l-4 border-black rounded-t-xl" />
        </div>
        <div className="absolute top-24 right-2 w-12 h-40 bg-gray-400 border-4 border-black" style={{ transform: 'translateZ(-10px)' }}>
          <div className="absolute bottom-0 -right-4 w-20 h-12 bg-gray-500 border-b-4 border-r-4 border-l-4 border-black rounded-t-xl" />
        </div>

        {/* Robot Main Body */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-56 bg-white border-4 border-black rounded-b-2xl" style={{ transform: 'translateZ(10px)' }}>
          {/* Chest Details */}
          <div className="mx-auto mt-6 w-32 h-24 border-4 border-black divide-y-4 divide-black bg-gray-100">
            <div className="h-1/3 w-full bg-blue-500 flex items-center justify-around px-2">
              <div className="w-4 h-4 bg-yellow-400 border-2 border-black" />
              <div className="w-4 h-4 bg-red-400 border-2 border-black animate-pulse" />
            </div>
            <div className="h-1/3 w-full bg-gray-300" />
            <div className="h-1/3 w-full bg-gray-400" />
          </div>
          {/* Power Core */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-400 border-4 border-black animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
        </div>

        {/* Robot Dome Head (Top Layer) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gray-200 border-4 border-black rounded-t-full overflow-hidden" style={{ transform: 'translateZ(20px)' }}>
          {/* Eye Banner */}
          <motion.div
            className="mt-6 mx-auto w-32 h-8 bg-gray-800 border-4 border-black flex items-center justify-center px-4"
            animate={{ x: coords.x * 12, y: -coords.y * 5 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Glowing Eye */}
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_red] animate-ping opacity-75 absolute" />
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Landing Page Component
const LandingPage: React.FC<{ onStartApp: () => void }> = ({ onStartApp }) => {
  const [reviews, setReviews] = React.useState<any[]>([
    { name: 'TRAINER RED', role: 'Debate Master', text: 'This game made me think like never before. Its like Pokemon but for your brain!', rating: 5 },
    { name: 'PROFESSOR OAK', role: 'Logic Expert', text: 'A revolutionary way to learn critical thinking. My students are hooked!', rating: 5 },
    { name: 'TEAM REASON', role: 'Competitive Player', text: 'The retro aesthetic combined with deep debate mechanics is pure genius.', rating: 5 },
    { name: 'MISTY', role: 'Casual Gamer', text: 'Never thought debating could be this fun. The AI is surprisingly smart!', rating: 5 }
  ]);

  React.useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(r => ({
            name: r.name,
            role: 'Player',
            text: r.comment || 'Great game!',
            rating: r.rating
          }));
          setReviews(prev => {
            const all = [...prev, ...formatted];
            // duplicate if not enough items for a nice 3D circle (need at least 6)
            let looped = [...all];
            while (looped.length < 8) {
              looped = [...looped, ...all];
            }
            return looped;
          });
        } else {
          // ensure base array has enough for 3d effect if fetch returns empty
          setReviews(prev => [...prev, ...prev]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-8 py-16 gap-12 relative overflow-hidden">

        {/* Left Side: Text and CTA */}
        <div className="max-w-xl w-full text-left space-y-8 z-10 flex-shrink-0 pt-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-7xl font-bold pixel-text text-gray-900 leading-tight pixel-shadow">
              YAPPERBOT
            </h1>
            <p className="text-xl md:text-2xl pixel-text text-gray-700 leading-relaxed">
              Where ideas clash like Pokemon battles. Train your logic. Battle with AI. Become a debate champion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4 pt-4"
          >
            <Button
              onClick={onStartApp}
              className="border-8 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bold pixel-text text-2xl px-12 py-8 transition-all hover:scale-105"
            >
              START BATTLE
            </Button>
            <p className="text-sm pixel-text text-gray-600 ml-2">Press Start to Begin</p>
          </motion.div>
        </div>

        {/* Right Side: 3D Robot Interactive Model */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="w-full lg:w-[600px] h-[400px] lg:h-[600px] relative mt-8 lg:mt-0 flex-shrink-0"
        >
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse"></div>
          <PixelRobot3D />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 bg-gray-200">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold pixel-text text-center mb-16 text-gray-900"
          >
            GAME FEATURES
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '👀',
                title: 'WATCH MODE',
                description: 'Watch AI bots battle it out with logic and reason. Learn from their strategies.'
              },
              {
                icon: '⚔️',
                title: 'BATTLE MODE',
                description: 'Enter the arena yourself. Test your arguments against AI opponents.'
              },
              {
                icon: '📊',
                title: 'CREDIBILITY SYSTEM',
                description: 'Track your debate performance with Pokemon-style HP bars. Every argument counts.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="border-4 border-black bg-white p-8 text-center space-y-4 hover:border-yellow-400 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold pixel-text text-gray-900">{feature.title}</h3>
                <p className="text-sm pixel-text text-gray-700 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-8 bg-gray-300">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold pixel-text text-center mb-16 text-gray-900"
          >
            PLAYER REVIEWS
          </motion.h2>

          <div className="relative w-full h-[400px] flex items-center justify-center overflow-visible mt-24" style={{ perspective: '1200px' }}>
            <div
              className="w-[300px] h-[220px] relative animate-[spin3d_40s_linear_infinite] hover:[animation-play-state:paused]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {reviews.map((testimonial, index) => {
                const angle = (360 / reviews.length) * index;
                const radius = Math.max(350, Math.round(160 / Math.tan(Math.PI / reviews.length)));
                return (
                  <div
                    key={`${testimonial.name}-${index}`}
                    className="absolute top-0 left-0 w-full h-full border-4 border-black bg-white p-6 flex flex-col justify-between shadow-2xl"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden',
                      // override universal backface hidden rule on children if needed
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-xs pixel-text text-gray-700 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap lg:whitespace-normal h-12">"{testimonial.text}"</p>
                    <div className="border-t-2 border-gray-300 pt-3">
                      <div className="text-xs font-bold pixel-text text-gray-900">{testimonial.name}</div>
                      <div className="text-[10px] pixel-text text-gray-600 mt-1">{testimonial.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold pixel-text">YAPPERBOT</h3>
              <p className="text-xs pixel-text text-gray-400 leading-relaxed">
                Train your mind. Battle with ideas. Become a logic master.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold pixel-text">QUICK LINKS</h4>
              <div className="space-y-2">
                <button onClick={onStartApp} className="block text-xs pixel-text text-gray-400 hover:text-yellow-400 transition-colors">
                  Play Now
                </button>
                <a href="#features" className="block text-xs pixel-text text-gray-400 hover:text-yellow-400 transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="block text-xs pixel-text text-gray-400 hover:text-yellow-400 transition-colors">
                  Reviews
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold pixel-text">CONNECT</h4>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/iamnih4l" target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-white hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/iam-nih4l/" target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-white hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/iam.nih4l/" target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-white hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="mailto:nihal@example.com" className="p-2 border-2 border-white hover:border-yellow-400 hover:text-yellow-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-xs pixel-text text-gray-400">
              © 2026 YAPPERBOT. All rights reserved. Built with ⚡ by Nihal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Menu Screen Component
const MenuScreen: React.FC<{ onSelectMode: (mode: 'bot-vs-bot' | 'user-vs-bot') => void; onBack: () => void }> = ({ onSelectMode, onBack }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const options = [
    { label: 'WATCH A DEBATE', mode: 'bot-vs-bot' as const },
    { label: 'ENTER THE DEBATE', mode: 'user-vs-bot' as const }
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev - 1 + options.length) % options.length);
      } else if (e.key === 'Enter') {
        onSelectMode(options[selectedIndex].mode);
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelectMode, onBack]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-300 to-gray-400 p-8"
    >
      <Button
        onClick={onBack}
        className="absolute top-4 left-4 border-4 border-black bg-gray-200 hover:bg-gray-300 text-black font-bold pixel-text"
      >
        ← BACK
      </Button>

      <div className="border-8 border-black bg-gray-200 p-12 max-w-2xl w-full shadow-2xl">
        <h1 className="text-5xl font-bold text-center mb-12 pixel-text tracking-wider">
          YAPPERBOT
        </h1>
        <div className="space-y-6 mb-8">
          <div className="text-center text-xl font-bold pixel-text mb-8 text-gray-700">
            CHOOSE YOUR MODE
          </div>
          {options.map((option, index) => (
            <button
              key={option.mode}
              onClick={() => onSelectMode(option.mode)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full p-6 border-4 border-black text-xl font-bold pixel-text transition-all duration-200 flex items-center gap-4",
                selectedIndex === index
                  ? "bg-yellow-400 scale-105 shadow-lg"
                  : "bg-white hover:bg-gray-100"
              )}
            >
              <ChevronRight className={cn(
                "w-6 h-6 transition-opacity",
                selectedIndex === index ? "opacity-100" : "opacity-0"
              )} />
              {option.label}
            </button>
          ))}
        </div>
        <div className="text-center text-sm pixel-text text-gray-600 mt-8">
          Use arrow keys or click to select
        </div>
      </div>
    </motion.div>
  );
};

// Topic Input Component
const TopicInputScreen: React.FC<{
  title: string;
  description: string;
  onStart: (topic: string) => void;
  onBack: () => void;
}> = ({ title, description, onStart, onBack }) => {
  const [topic, setTopic] = React.useState('');
  const suggestions = [
    'AI will replace human doctors',
    'Social media does more harm than good',
    'Remote work is better than office work',
    'Crypto is the future of finance',
    'Space exploration is a waste of money',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-300 to-gray-400 p-8"
    >
      <Button
        onClick={onBack}
        className="absolute top-4 left-4 border-4 border-black bg-gray-200 hover:bg-gray-300 text-black font-bold pixel-text"
      >
        ← BACK
      </Button>
      <div className="border-8 border-black bg-gray-200 p-12 max-w-2xl w-full shadow-2xl space-y-6">
        <h1 className="text-4xl font-bold text-center pixel-text">{title}</h1>
        <p className="text-sm pixel-text text-gray-600 text-center">{description}</p>

        <div>
          <div className="text-xs pixel-text text-gray-700 mb-2">ENTER YOUR DEBATE TOPIC:</div>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. AI is better than humans at art"
            className="border-4 border-black pixel-text text-sm p-6"
            onKeyDown={(e) => e.key === 'Enter' && topic.trim() && onStart(topic.trim())}
            autoFocus
          />
        </div>

        <div>
          <div className="text-xs pixel-text text-gray-500 mb-2 mt-6">OR PICK A SUGGESTION:</div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className={cn(
                  "w-full text-left text-xs pixel-text p-3 border-4 border-black transition-all font-bold",
                  topic === s ? 'bg-yellow-400' : 'bg-white hover:bg-gray-100'
                )}
              >
                <ChevronRight className="w-3 h-3 inline mr-2" />
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => topic.trim() && onStart(topic.trim())}
          disabled={!topic.trim()}
          className="w-full border-4 border-black bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold pixel-text text-lg p-6 mt-4"
        >
          START DEBATE ⚔️
        </Button>
      </div>
    </motion.div>
  );
};

// Bot vs Bot Mode Component
const BotVsBotMode: React.FC<{ topic: string; onEnd: (winner: string) => void; onBack: () => void; playBotDamageSound: () => void; playSecret67Sound: () => void; playStartSound: () => void }> = ({ topic, onEnd, onBack, playBotDamageSound, playSecret67Sound, playStartSound }) => {
  React.useEffect(() => {
    playStartSound();
  }, [playStartSound]);

  const [botA, setBotA] = React.useState<BotProfile>({
    name: 'LOGIC-BOT',
    stance: 'PRO',
    credibility: 100,
    avatar: '🤖'
  });

  const [botB, setBotB] = React.useState<BotProfile>({
    name: 'REASON-BOT',
    stance: 'AGAINST',
    credibility: 100,
    avatar: '🦾'
  });

  const [currentMessage, setCurrentMessage] = React.useState<Message | null>(null);
  const [history, setHistory] = React.useState<Message[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [turn, setTurn] = React.useState<'A' | 'B'>('A');
  const [turnCount, setTurnCount] = React.useState(0);
  const MAX_TURNS = 8;

  const generateResponse = async (currentTurn: 'A' | 'B', currentHistory: Message[]) => {
    setIsTyping(true);
    const speaker = currentTurn === 'A' ? botA : botB;
    const opponent = currentTurn === 'A' ? botB : botA;

    const recentHistory = currentHistory.slice(-2);
    const historyStr = recentHistory.length > 0
      ? recentHistory.map(m => `${m.speaker}: ${m.text}`).join('\n')
      : "Start with an opening claim.";

    const prompt = `Topic:"${topic}"
Role:${speaker.name}(${speaker.stance}) vs ${opponent.name}(${opponent.stance})
History:
${historyStr}

Task: Argue aggressively for your stance. Attack opponent's last point. Max 2 sentences. No prefixes.`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();

      // Clean up the text: remove newlines, quotes, and markdown bolding just in case
      let reply = text.replace(/\n|<br>/g, ' ').replace(/["*]/g, '').trim();
      if (!reply) reply = "Error: System malfunction.";

      // Random impact since we removed it from the prompt for reliability
      const impact = Math.random() > 0.7 ? 'strong' : 'normal';

      const newMessage: Message = { speaker: speaker.name, text: reply, impact };
      setCurrentMessage(newMessage);
      setHistory(prev => [...prev, newMessage]);

      setTimeout(() => {
        setIsTyping(false);
        if (impact === 'strong') {
          playBotDamageSound();
          const damage = Math.floor(Math.random() * 15) + 10;
          if (currentTurn === 'A') {
            setBotB(prev => {
              const newCred = Math.max(0, prev.credibility - damage);
              if (Math.round(newCred) === 67) setTimeout(() => playSecret67Sound(), 500);
              return { ...prev, credibility: newCred };
            });
          } else {
            setBotA(prev => {
              const newCred = Math.max(0, prev.credibility - damage);
              if (Math.round(newCred) === 67) setTimeout(() => playSecret67Sound(), 500);
              return { ...prev, credibility: newCred };
            });
          }
        }

        // Add artificial delay before passing the turn visually
        setCurrentMessage(null);
        setTimeout(() => {
          setTurn(prev => prev === 'A' ? 'B' : 'A');
          setTurnCount(prev => prev + 1);
        }, 1500);

      }, reply.length * 30 + 1000);
    } catch (error) {
      console.error("AI Error:", error);
      setIsTyping(false);
      setTurn(prev => prev === 'A' ? 'B' : 'A');
    }
  };

  React.useEffect(() => {
    if (turnCount < MAX_TURNS && (botA.credibility > 0 && botB.credibility > 0)) {
      const timer = setTimeout(() => {
        generateResponse(turn, history);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (turnCount >= MAX_TURNS || botA.credibility <= 0 || botB.credibility <= 0) {
      let runWinner = 'TIE';
      if (botA.credibility > botB.credibility) runWinner = botA.name;
      else if (botB.credibility > botA.credibility) runWinner = botB.name;
      const endTimer = setTimeout(() => onEnd(runWinner), 3000);
      return () => clearTimeout(endTimer);
    }
  }, [turnCount, turn]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-300 to-gray-400 p-8"
    >
      <Button
        onClick={onBack}
        className="absolute top-4 left-4 border-4 border-black bg-gray-200 hover:bg-gray-300 text-black font-bold pixel-text"
      >
        ← MENU
      </Button>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold pixel-text mb-2">WATCH MODE</h2>
          <p className="text-lg pixel-text text-gray-700">Topic: {topic}</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <BotAvatar bot={botA} isActive={turn === 'A'} side="left" />
          <BotAvatar bot={botB} isActive={turn === 'B'} side="right" />
        </div>

        <DialogueBox message={currentMessage} isTyping={isTyping} />

        <div className="text-center">
          <div className="text-sm pixel-text text-gray-600">
            Turn {turnCount + 1} of {MAX_TURNS}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserVsBotMode: React.FC<{ topic: string; onEnd: (winner: string) => void; onBack: () => void; playBotDamageSound: () => void; playUserDamageSound: () => void; playSecret67Sound: () => void; playStartSound: () => void }> = ({ topic, onEnd, onBack, playBotDamageSound, playUserDamageSound, playSecret67Sound, playStartSound }) => {
  React.useEffect(() => {
    playStartSound();
  }, [playStartSound]);

  const [userCredibility, setUserCredibility] = React.useState(100);
  const [botCredibility, setBotCredibility] = React.useState(100);
  const [currentMessage, setCurrentMessage] = React.useState<Message | null>(null);
  const [history, setHistory] = React.useState<Message[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [showActionMenu, setShowActionMenu] = React.useState(true);
  const [showInput, setShowInput] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState<UserAction | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [turn, setTurn] = React.useState<'user' | 'bot'>('user');

  const actions: UserAction[] = ['ARGUE', 'REBUT', 'QUESTION', 'CONCEDE'];

  const handleActionSelect = (action: UserAction) => {
    setSelectedAction(action);
    setShowActionMenu(false);
    setShowInput(true);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      speaker: 'YOU',
      text: inputValue,
      impact: 'normal'
    };

    setCurrentMessage(userMessage);
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setShowInput(false);
    setInputValue('');
    setTurn('bot');

    setIsTyping(true);

    const recentHistory = updatedHistory.slice(-2);
    const historyStr = recentHistory.map(m => `${m.speaker}: ${m.text}`).join('\n');

    const prompt = `Topic:"${topic}"
Role:AI(AGAINST) vs User(PRO)
History:
${historyStr}

Task: Argue AGAINST topic. Dismantle user's last point. Bring up new logic. Max 2 sentences. No prefixes.`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();

      // Clean up the text: remove newlines, quotes, and markdown bolding
      let reply = text.replace(/\n|<br>/g, ' ').replace(/["*]/g, '').trim();
      if (!reply) reply = "Error: System malfunction.";

      // Random impact since we removed it from the prompt for reliability
      const impact = Math.random() > 0.7 ? 'strong' : 'normal';

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: Message = {
          speaker: 'AI OPPONENT',
          text: reply,
          impact: impact
        };

        setCurrentMessage(botMessage);
        setHistory(prev => [...prev, botMessage]);

        const credibilityChange = Math.floor(Math.random() * 10) + 5;
        setUserCredibility(prev => {
          const newCred = Math.max(0, prev - credibilityChange);
          if (Math.round(newCred) === 67) setTimeout(() => playSecret67Sound(), 500);
          return newCred;
        });

        if (credibilityChange > 0) playUserDamageSound();

        let botDamaged = false;
        // If user's argument was strong, damage the bot
        if (selectedAction === 'ARGUE' || selectedAction === 'REBUT') {
          setBotCredibility(prev => {
            const damage = Math.floor(Math.random() * 10) + 10;
            const newCred = Math.max(0, prev - damage);
            if (Math.round(newCred) === 67) setTimeout(() => playSecret67Sound(), 500);
            return newCred;
          });
          botDamaged = true;
        }

        if (botDamaged) setTimeout(() => playBotDamageSound(), 300);

        setTurn('user');
        setShowActionMenu(true);
      }, 2000);
    } catch (error) {
      console.error("AI Error:", error);
      setIsTyping(false);
      setTurn('user');
      setShowActionMenu(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-300 to-gray-400 p-8"
    >
      <Button
        onClick={onBack}
        className="absolute top-4 left-4 border-4 border-black bg-gray-200 hover:bg-gray-300 text-black font-bold pixel-text"
      >
        ← MENU
      </Button>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold pixel-text mb-2">BATTLE MODE</h2>
          <p className="text-lg pixel-text text-gray-700">Topic: {topic}</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center gap-3 p-4 border-4 border-black bg-gray-200">
            <div className="w-24 h-24 bg-gray-400 border-4 border-black flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="text-center">
              <div className="text-sm font-bold pixel-text">YOU</div>
              <div className="text-xs font-bold pixel-text mt-1 px-2 py-1 border-2 border-black bg-green-400">
                PRO
              </div>
            </div>
            <CredibilityBar value={userCredibility} label="CREDIBILITY" side="left" />
          </div>

          <div className="flex flex-col items-center gap-3 p-4 border-4 border-black bg-gray-200">
            <div className="w-24 h-24 bg-gray-400 border-4 border-black flex items-center justify-center text-4xl">
              🤖
            </div>
            <div className="text-center">
              <div className="text-sm font-bold pixel-text">AI OPPONENT</div>
              <div className="text-xs font-bold pixel-text mt-1 px-2 py-1 border-2 border-black bg-red-400">
                AGAINST
              </div>
            </div>
            <CredibilityBar value={botCredibility} label="CREDIBILITY" side="right" />
          </div>
        </div>

        <DialogueBox message={currentMessage} isTyping={isTyping} />

        {botCredibility <= 0 && (
          <div className="text-center">
            <Button onClick={() => onEnd('YOU')} className="border-4 border-black bg-yellow-400 pixel-text">FINISH DEBATE</Button>
          </div>
        )}

        {userCredibility <= 0 && (
          <div className="text-center">
            <Button onClick={() => onEnd('AI OPPONENT')} className="border-4 border-black bg-red-400 text-white pixel-text">DEBATE LOST (FINISH)</Button>
          </div>
        )}

        {botCredibility > 0 && userCredibility > 0 && showActionMenu && turn === 'user' && (
          <div className="border-4 border-black bg-white p-6">
            <div className="text-sm font-bold pixel-text mb-4 text-gray-700">CHOOSE YOUR ACTION:</div>
            <div className="grid grid-cols-2 gap-4">
              {actions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleActionSelect(action)}
                  className="p-4 border-4 border-black bg-gray-100 hover:bg-yellow-400 transition-colors font-bold pixel-text flex items-center gap-2"
                >
                  <ChevronRight className="w-5 h-5" />
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {showInput && (
          <div className="border-4 border-black bg-white p-6 space-y-4">
            <div className="text-sm font-bold pixel-text text-gray-700">
              ENTER YOUR {selectedAction}:
            </div>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your argument..."
              className="border-4 border-black pixel-text"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              onClick={handleSubmit}
              className="w-full border-4 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bold pixel-text"
            >
              SUBMIT
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Review Form Component
const ReviewForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [name, setName] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(onComplete, 2000);
      }
    } catch (error) {
      console.error('Review Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="border-4 border-black bg-white p-6 text-center animate-bounce">
        <div className="text-2xl mb-2">⭐</div>
        <div className="text-sm pixel-text text-green-600">REVIEW SAVED! THANK YOU!</div>
      </div>
    );
  }

  return (
    <div className="border-4 border-black bg-white p-6 space-y-4">
      <div className="text-sm font-bold pixel-text text-gray-700">LEAVE A REVIEW:</div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="YOUR NAME"
          className="border-4 border-black pixel-text"
          required
        />
        <div className="flex items-center gap-4">
          <span className="text-xs pixel-text text-gray-600">RATING:</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={cn(
                  "w-8 h-8 border-2 border-black flex items-center justify-center font-bold",
                  rating >= s ? "bg-yellow-400" : "bg-gray-100"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="YOUR FEEDBACK..."
          className="border-4 border-black pixel-text"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full border-4 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bold pixel-text"
        >
          {isSubmitting ? 'SAVING...' : 'SUBMIT REVIEW'}
        </Button>
      </form>
    </div>
  );
};

// End Screen Component
const EndScreen: React.FC<{ winner: string; onRestart: () => void; playWinSound: () => void; playLoseSound: () => void }> = ({ winner, onRestart, playWinSound, playLoseSound }) => {
  const [showReview, setShowReview] = React.useState(true);

  React.useEffect(() => {
    if (winner === 'YOU') {
      playWinSound();
    } else if (winner === 'AI OPPONENT') {
      playLoseSound();
    }
  }, [winner, playWinSound, playLoseSound]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-300 to-gray-400 p-8"
    >
      <div className="border-8 border-black bg-gray-200 p-12 max-w-2xl w-full text-center space-y-8 overflow-y-auto max-h-[90vh]">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-5xl font-bold pixel-text">DEBATE COMPLETE!</h2>
        <div className="text-2xl pixel-text text-gray-700">
          Winner: <span className="text-yellow-600">{winner}</span>
        </div>

        {showReview ? (
          <ReviewForm onComplete={() => setShowReview(false)} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-4 border-black bg-white p-6 text-left"
          >
            <div className="text-sm font-bold pixel-text mb-2 text-gray-700">BEST ARGUMENTS:</div>
            <div className="space-y-3 text-sm pixel-text">
              <p>• AI diagnostic accuracy significantly reduces medical errors</p>
              <p>• Human empathy remains irreplaceable in healthcare</p>
            </div>
          </motion.div>
        )}

        <Button
          onClick={onRestart}
          className="w-full border-4 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bold pixel-text text-xl p-6"
        >
          RETURN TO MENU
        </Button>
      </div>
    </motion.div>
  );
};

// Main App Component
const PokemonDebateApp: React.FC = () => {
  const [gameMode, setGameMode] = React.useState<GameMode>('landing');
  const [selectedModeType, setSelectedModeType] = React.useState<'bot-vs-bot' | 'user-vs-bot' | null>(null);
  const [debateTopic, setDebateTopic] = React.useState<string>('');
  const [debateWinner, setDebateWinner] = React.useState<string>('');
  const { isMuted, setIsMuted, playBotDamageSound, playUserDamageSound, playSecret67Sound, playStartSound, playWinSound, playLoseSound } = useAudio();

  return (
    <div className="relative min-h-screen w-full crt-effect bg-gray-900">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-4 right-4 z-50 p-3 border-4 border-black bg-yellow-400 hover:bg-yellow-500 transition-colors"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <AnimatePresence mode="wait">
        {gameMode === 'landing' && (
          <LandingPage key="landing" onStartApp={() => setGameMode('menu')} />
        )}
        {gameMode === 'menu' && (
          <MenuScreen
            key="menu"
            onSelectMode={(m) => {
              setSelectedModeType(m);
              setGameMode('topic-input');
            }}
            onBack={() => setGameMode('landing')}
          />
        )}
        {gameMode === 'topic-input' && (
          <TopicInputScreen
            key="topic-input"
            title={selectedModeType === 'bot-vs-bot' ? 'WATCH MODE' : 'BATTLE MODE'}
            description={
              selectedModeType === 'bot-vs-bot'
                ? 'Set the topic and watch the AI bots debate it out.'
                : 'Choose a topic to debate against the AI.'
            }
            onStart={(topic) => {
              setDebateTopic(topic);
              setGameMode(selectedModeType || 'landing');
            }}
            onBack={() => setGameMode('menu')}
          />
        )}
        {gameMode === 'bot-vs-bot' && (
          <BotVsBotMode
            key="bot-vs-bot"
            topic={debateTopic}
            playBotDamageSound={playBotDamageSound}
            playSecret67Sound={playSecret67Sound}
            playStartSound={playStartSound}
            onEnd={(w) => { setDebateWinner(w); setGameMode('end'); }}
            onBack={() => setGameMode('topic-input')}
          />
        )}
        {gameMode === 'user-vs-bot' && (
          <UserVsBotMode
            key="user-vs-bot"
            topic={debateTopic}
            playBotDamageSound={playBotDamageSound}
            playUserDamageSound={playUserDamageSound}
            playSecret67Sound={playSecret67Sound}
            playStartSound={playStartSound}
            onEnd={(w) => { setDebateWinner(w); setGameMode('end'); }}
            onBack={() => setGameMode('topic-input')}
          />
        )}
        {gameMode === 'end' && (
          <EndScreen key="end" winner={debateWinner} onRestart={() => setGameMode('menu')} playWinSound={playWinSound} playLoseSound={playLoseSound} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PokemonDebateApp;
