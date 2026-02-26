'use client';

import { motion } from 'framer-motion';

export const CodeIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <motion.path
      d="M14 16L8 24L14 32"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{
        pathLength: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.path
      d="M34 16L40 24L34 32"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{
        pathLength: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    />
    <motion.path
      d="M28 12L20 36"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
  </motion.svg>
);

export const BookIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.rect
      x="10"
      y="8"
      width="28"
      height="32"
      rx="2"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
    <motion.path
      d="M24 8V40"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="2 4"
      animate={{
        strokeDashoffset: [0, -6],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <motion.path
      d="M16 16H20M16 22H22M16 28H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
  </motion.svg>
);

export const PenIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M32 8L40 16L18 38L10 40L12 32L32 8Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      animate={{
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
      }}
    />
    <motion.circle
      cx="36"
      cy="12"
      r="2"
      fill="currentColor"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
  </motion.svg>
);

export const TimerIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.circle
      cx="24"
      cy="26"
      r="14"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <motion.path
      d="M24 16V26L30 32"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{ originX: "24px", originY: "26px" }}
    />
    <motion.path
      d="M20 8H28"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </motion.svg>
);

export const PaletteIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M24 8C15.163 8 8 15.163 8 24C8 32.837 15.163 40 24 40C26.209 40 28 38.209 28 36C28 34.965 27.587 34.029 26.929 33.343C26.285 32.671 26 31.871 26 31C26 29.343 27.343 28 29 28H33C37.418 28 41 24.418 41 20C41 13.373 33.284 8 24 8Z"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <motion.circle cx="16" cy="20" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
    <motion.circle cx="20" cy="14" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
    <motion.circle cx="28" cy="14" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
    <motion.circle cx="34" cy="20" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }} />
  </motion.svg>
);

export const MusicIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M18 34V14L38 10V30"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <motion.circle
      cx="14"
      cy="34"
      r="4"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
    <motion.circle
      cx="34"
      cy="30"
      r="4"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0.3
      }}
    />
  </motion.svg>
);

export const ChartIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.rect x="10" y="28" width="6" height="12" rx="1" fill="currentColor" animate={{ height: [12, 16, 12] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
    <motion.rect x="21" y="20" width="6" height="20" rx="1" fill="currentColor" animate={{ height: [20, 24, 20] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
    <motion.rect x="32" y="12" width="6" height="28" rx="1" fill="currentColor" animate={{ height: [28, 32, 28] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
  </motion.svg>
);

export const WindIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M8 18H28C30.209 18 32 16.209 32 14C32 11.791 30.209 10 28 10C26.5 10 25.2 10.8 24.5 12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{
        x: [0, 3, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
      }}
    />
    <motion.path
      d="M8 26H32C34.209 26 36 27.791 36 30C36 32.209 34.209 34 32 34C30.5 34 29.2 33.2 28.5 32"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{
        x: [0, 3, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: 0.5
      }}
    />
    <motion.path
      d="M8 34H20C21.657 34 23 35.343 23 37C23 38.657 21.657 40 20 40"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{
        x: [0, 3, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: 1
      }}
    />
  </motion.svg>
);

export const BrainIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M24 8C18 8 14 12 14 16C12 16 10 18 10 20C10 22 12 24 14 24C14 28 16 32 20 34C18 36 18 38 20 40C22 42 26 42 28 40C30 38 30 36 28 34C32 32 34 28 34 24C36 24 38 22 38 20C38 18 36 16 34 16C34 12 30 8 24 8Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <motion.circle cx="20" cy="20" r="1.5" fill="currentColor" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.circle cx="28" cy="20" r="1.5" fill="currentColor" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
    <motion.circle cx="24" cy="26" r="1.5" fill="currentColor" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
  </motion.svg>
);

export const ActivityIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M8 24H14L18 12L24 36L30 18L34 24H40"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      animate={{
        pathLength: [0, 1],
        opacity: [0, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.svg>
);

export const ChatIcon = () => (
  <motion.svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M40 12C40 9.79086 38.2091 8 36 8H12C9.79086 8 8 9.79086 8 12V28C8 30.2091 9.79086 32 12 32H16L24 40L32 32H36C38.2091 32 40 30.2091 40 28V12Z"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <motion.circle cx="16" cy="20" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
    <motion.circle cx="24" cy="20" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
    <motion.circle cx="32" cy="20" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} />
  </motion.svg>
);
