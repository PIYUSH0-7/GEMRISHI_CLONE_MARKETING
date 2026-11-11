import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CurrencySelector from "../CurrencySelector";

const WORDS = [
  "Tailored to Your Birth Chart",
  "100% Natural Gemstones",
  "Precisely Astrologically Matched",
  "Expertly Hand-Selected",
  "Authentically Natural",
  "Carefully Curated by Experts",
];

function RotatingTicker() {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[wordIdx];
    let timer;

    if (!isDeleting) {
      if (charIdx < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, charIdx + 1));
          setCharIdx((prev) => prev + 1);
        }, 40);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 1800);
      }
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, charIdx - 1));
          setCharIdx((prev) => prev - 1);
        }, 20);
      } else {
        setIsDeleting(false);
        setWordIdx((prev) => (prev + 1) % WORDS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, wordIdx]);

  return (
    <span className="inline-flex items-center text-[12px] font-semibold text-[#1E3A34] tracking-wide">
      <span>{text}</span>
      <span className="ml-0.5 animate-pulse text-[#D4AF37]">|</span>
    </span>
  );
}

/**
 * HeaderAnnouncementBar: Top strip featuring trust badges,
 * rotating astrology ticker, helpline, and currency selector.
 */
export default function HeaderAnnouncementBar() {
  return (
    <div className="hidden lg:block w-full bg-[#F4F7F5] border-b border-gray-200/80 text-[11.5px] text-gray-700 font-medium">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-9 flex items-center justify-between">
        
        {/* Left: Shipping & Return Guarantees */}
        <div className="flex items-center gap-4">
          <Link
            to="/shipping"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#1E3A34] transition-colors"
          >
            <span className="text-[#0D9488] text-[9px] animate-pulse">●</span>
            <span className="font-semibold text-gray-900">Free Shipping All Over India</span>
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to="/return-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#1E3A34] transition-colors"
          >
            <span className="text-[#0D9488] text-[9px] animate-pulse">●</span>
            <span className="font-semibold text-gray-900">10 Days No Hassle Returns</span>
          </Link>
        </div>

        {/* Center: Dynamic astrology ticker */}
        <div className="flex items-center justify-center">
          <RotatingTicker />
        </div>

        {/* Right: Helpline & Currency */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+919817975978"
            className="flex items-center gap-1.5 hover:text-[#1E3A34] transition-colors"
          >
            <span className="text-gray-500 font-medium">Need Help?</span>
            <span className="text-[#1E3A34] font-bold">+91 98179 75978</span>
          </a>
          <span className="text-gray-300">|</span>
          <div className="flex items-center">
            <CurrencySelector />
          </div>
        </div>

      </div>
    </div>
  );
}
