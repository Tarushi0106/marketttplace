'use client';

import React from 'react';

const SurveillanceComparison: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <svg
        viewBox="0 0 1200 600"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Cloud Side Gradients */}
          <linearGradient id="cloudGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          
          <linearGradient id="skyGradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          
          <linearGradient id="cloudGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* On-Premise Side Gradients */}
          <linearGradient id="onPremiseGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D1040" />
            <stop offset="50%" stopColor="#141740" />
            <stop offset="100%" stopColor="#161848" />
          </linearGradient>
          
          <linearGradient id="skyGradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D1040" />
            <stop offset="100%" stopColor="#141740" />
          </linearGradient>
          
          <linearGradient id="serverGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E2260" />
            <stop offset="50%" stopColor="#1E2260" />
            <stop offset="100%" stopColor="#161848" />
          </linearGradient>

          {/* Data Stream Gradient */}
          <linearGradient id="dataStreamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="cloudGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="serverGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="dataGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background - Left Side (Cloud) */}
        <rect x="0" y="0" width="600" height="600" fill="url(#skyGradientLeft)" />
        
        {/* Background - Right Side (On-Premise) */}
        <rect x="600" y="0" width="600" height="600" fill="url(#skyGradientRight)" />

        {/* Divider Line */}
        <line x1="600" y1="50" x2="600" y2="550" stroke="#4b5563" strokeWidth="2" strokeDasharray="10,5" />

        {/* ==================== LEFT SIDE: CLOUD-BASED SURVEILLANCE ==================== */}
        
        {/* Ground */}
        <ellipse cx="300" cy="520" rx="250" ry="40" fill="#1e1b4b" opacity="0.5" />

        {/* CCTV Camera - Left */}
        <g transform="translate(120, 280)">
          {/* Camera Body */}
          <rect x="0" y="0" width="40" height="25" rx="4" fill="#374151" />
          {/* Lens */}
          <circle cx="40" cy="12" r="8" fill="#1f2937" stroke="#60a5fa" strokeWidth="2" />
          <circle cx="40" cy="12" r="4" fill="#93c5fd" />
          {/* Mount */}
          <rect x="15" y="25" width="10" height="30" fill="#4b5563" />
          {/* Stand */}
          <rect x="5" y="55" width="30" height="80" fill="#374151" rx="2" />
          {/* LED indicators */}
          <circle cx="20" cy="10" r="2" fill="#3b82f6" filter="url(#dataGlow)" />
        </g>

        {/* CCTV Camera - Right Left Side */}
        <g transform="translate(420, 280)">
          <rect x="0" y="0" width="40" height="25" rx="4" fill="#374151" />
          <circle cx="0" cy="12" r="8" fill="#1f2937" stroke="#60a5fa" strokeWidth="2" />
          <circle cx="0" cy="12" r="4" fill="#93c5fd" />
          <rect x="15" y="25" width="10" height="30" fill="#4b5563" />
          <rect x="5" y="55" width="30" height="80" fill="#374151" rx="2" />
          <circle cx="20" cy="10" r="2" fill="#8b5cf6" filter="url(#dataGlow)" />
        </g>

        {/* Data Streams from Cameras to Cloud */}
        <g filter="url(#dataGlow)">
          {/* Stream 1 */}
          <path d="M140 340 Q 200 300 280 250" stroke="url(#dataStreamGradient)" strokeWidth="3" fill="none" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
          </path>
          {/* Stream 2 */}
          <path d="M460 340 Q 400 300 320 250" stroke="url(#dataStreamGradient)" strokeWidth="3" fill="none" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
          </path>
          {/* Animated dots */}
          <circle r="4" fill="#60a5fa">
            <animateMotion dur="2s" repeatCount="indefinite" path="M140 340 Q 200 300 280 250" />
          </circle>
          <circle r="4" fill="#a78bfa">
            <animateMotion dur="2s" repeatCount="indefinite" path="M460 340 Q 400 300 320 250" />
          </circle>
        </g>

        {/* Cloud */}
        <g transform="translate(220, 100)" filter="url(#cloudGlowFilter)">
          <ellipse cx="80" cy="60" rx="70" ry="45" fill="url(#cloudGlow)" opacity="0.9" />
          <ellipse cx="40" cy="50" rx="45" ry="35" fill="url(#cloudGlow)" opacity="0.9" />
          <ellipse cx="120" cy="50" rx="45" ry="35" fill="url(#cloudGlow)" opacity="0.9" />
          <ellipse cx="80" cy="35" rx="50" ry="30" fill="url(#cloudGlow)" opacity="0.95" />
          
          {/* Cloud glow rings */}
          <ellipse cx="80" cy="60" rx="80" ry="55" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* AI Analytics Dashboard */}
        <g transform="translate(200, 420)">
          {/* Dashboard Panel */}
          <rect x="0" y="0" width="200" height="80" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" opacity="0.9" />
          
          {/* Screen lines */}
          <line x1="15" y1="20" x2="185" y2="20" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
          <line x1="15" y1="35" x2="185" y2="35" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
          <line x1="15" y1="50" x2="185" y2="50" stroke="#6366f1" strokeWidth="1" opacity="0.5" />
          
          {/* Analytics bars */}
          <rect x="20" y="55" width="30" height="15" fill="#3b82f6" rx="2" />
          <rect x="55" y="50" width="30" height="20" fill="#6366f1" rx="2" />
          <rect x="90" y="45" width="30" height="25" fill="#8b5cf6" rx="2" />
          <rect x="125" y="52" width="30" height="18" fill="#3b82f6" rx="2" />
          <rect x="160" y="48" width="20" height="22" fill="#6366f1" rx="2" />
          
          {/* AI Icon */}
          <circle cx="175" cy="12" r="6" fill="#60a5fa" filter="url(#dataGlow)" />
          <text x="175" y="15" textAnchor="middle" fontSize="8" fill="#1e293b" fontWeight="bold">AI</text>
        </g>

        {/* Remote Access Devices */}
        {/* Smartphone */}
        <g transform="translate(80, 380)">
          <rect x="0" y="0" width="25" height="45" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
          <rect x="2" y="3" width="21" height="35" fill="#0f172a" />
          <circle cx="12.5" cy="42" r="2" fill="#3b82f6" />
          {/* Screen glow */}
          <rect x="3" y="5" width="19" height="30" fill="#3b82f6" opacity="0.2" />
        </g>

        {/* Laptop */}
        <g transform="translate(480, 370)">
          <rect x="0" y="20" width="50" height="30" rx="3" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1" />
          <rect x="2" y="23" width="46" height="24" fill="#0f172a" />
          {/* Screen content */}
          <rect x="5" y="26" width="20" height="18" fill="#6366f1" opacity="0.4" rx="1" />
          <rect x="28" y="26" width="17" height="8" fill="#8b5cf6" opacity="0.3" rx="1" />
          <rect x="28" y="37" width="17" height="4" fill="#3b82f6" opacity="0.3" rx="1" />
          {/* Base */}
          <rect x="0" y="50" width="50" height="5" rx="1" fill="#374151" />
        </g>

        {/* Connection lines to remote devices */}
        <path d="M140 405 Q 90 400 92 405" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M460 420 Q 480 400 505 395" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Floating data icons */}
        <g opacity="0.7">
          <circle cx="320" cy="180" r="8" fill="#60a5fa" filter="url(#dataGlow)" />
          <circle cx="350" cy="200" r="6" fill="#a78bfa" filter="url(#dataGlow)" />
          <circle cx="300" cy="220" r="5" fill="#818cf8" filter="url(#dataGlow)" />
        </g>

        {/* ==================== RIGHT SIDE: ON-PREMISE SURVEILLANCE ==================== */}

        {/* Ground */}
        <ellipse cx="900" cy="520" rx="250" ry="40" fill="#141740" opacity="0.5" />

        {/* CCTV Camera - Left Right Side */}
        <g transform="translate(720, 280)">
          <rect x="0" y="0" width="40" height="25" rx="4" fill="#374151" />
          <circle cx="40" cy="12" r="8" fill="#1f2937" stroke="#1E2260" strokeWidth="2" />
          <circle cx="40" cy="12" r="4" fill="#93C5FD" />
          <rect x="15" y="25" width="10" height="30" fill="#4b5563" />
          <rect x="5" y="55" width="30" height="80" fill="#374151" rx="2" />
          <circle cx="20" cy="10" r="2" fill="#1E2260" filter="url(#serverGlowFilter)" />
        </g>

        {/* CCTV Camera - Right Right Side */}
        <g transform="translate(1020, 280)">
          <rect x="0" y="0" width="40" height="25" rx="4" fill="#374151" />
          <circle cx="0" cy="12" r="8" fill="#1f2937" stroke="#1E2260" strokeWidth="2" />
          <circle cx="0" cy="12" r="4" fill="#93C5FD" />
          <rect x="15" y="25" width="10" height="30" fill="#4b5563" />
          <rect x="5" y="55" width="30" height="80" fill="#374151" rx="2" />
          <circle cx="20" cy="10" r="2" fill="#1E2260" filter="url(#serverGlowFilter)" />
        </g>

        {/* Data Cables to Servers */}
        <g filter="url(#dataGlow)">
          <path d="M740 340 Q 800 300 850 280" stroke="#1E2260" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M1060 340 Q 1000 300 950 280" stroke="#161848" strokeWidth="2" fill="none" opacity="0.6" />
        </g>

        {/* Server Racks / Data Center */}
        <g transform="translate(780, 180)">
          {/* Main Rack Frame */}
          <rect x="0" y="0" width="140" height="200" rx="8" fill="#0D1040" stroke="#0D1040" strokeWidth="3" />
          
          {/* Server Units */}
          {/* Server 1 */}
          <rect x="10" y="15" width="120" height="25" rx="3" fill="#141740" stroke="#141740" strokeWidth="1" />
          <rect x="15" y="20" width="30" height="15" fill="#1E2260" opacity="0.8" rx="2" />
          <rect x="50" y="20" width="30" height="15" fill="#1E2260" opacity="0.8" rx="2" />
          <rect x="85" y="20" width="30" height="15" fill="#141740" opacity="0.8" rx="2" />
          {/* LED lights */}
          <circle cx="18" cy="27" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="53" cy="27" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="88" cy="27" r="2" fill="#1E2260" filter="url(#serverGlowFilter)" />

          {/* Server 2 */}
          <rect x="10" y="50" width="120" height="25" rx="3" fill="#141740" stroke="#141740" strokeWidth="1" />
          <rect x="15" y="55" width="40" height="15" fill="#161848" opacity="0.8" rx="2" />
          <rect x="60" y="55" width="40" height="15" fill="#141740" opacity="0.8" rx="2" />
          <circle cx="18" cy="62" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="63" cy="62" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
          </circle>

          {/* Server 3 */}
          <rect x="10" y="85" width="120" height="25" rx="3" fill="#141740" stroke="#141740" strokeWidth="1" />
          <rect x="15" y="90" width="25" height="15" fill="#1E2260" opacity="0.8" rx="2" />
          <rect x="45" y="90" width="25" height="15" fill="#1E2260" opacity="0.8" rx="2" />
          <rect x="75" y="90" width="40" height="15" fill="#161848" opacity="0.8" rx="2" />
          <circle cx="18" cy="97" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite" />
          </circle>

          {/* Server 4 */}
          <rect x="10" y="120" width="120" height="25" rx="3" fill="#141740" stroke="#141740" strokeWidth="1" />
          <rect x="15" y="125" width="50" height="15" fill="#141740" opacity="0.8" rx="2" />
          <rect x="70" y="125" width="50" height="15" fill="#1E2260" opacity="0.8" rx="2" />
          <circle cx="18" cy="132" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />
          </circle>

          {/* Server 5 */}
          <rect x="10" y="155" width="120" height="25" rx="3" fill="#141740" stroke="#141740" strokeWidth="1" />
          <rect x="15" y="160" width="35" height="15" fill="#161848" opacity="0.8" rx="2" />
          <rect x="55" y="160" width="35" height="15" fill="#141740" opacity="0.8" rx="2" />
          <rect x="95" y="160" width="20" height="15" fill="#0D1040" opacity="0.8" rx="2" />
          <circle cx="18" cy="167" r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.55s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Network Switch Panel */}
        <g transform="translate(930, 200)">
          <rect x="0" y="0" width="60" height="100" rx="4" fill="#0D1040" stroke="#0D1040" strokeWidth="2" />
          
          {/* Network ports */}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="8" y={10 + i * 10} width="20" height="6" fill="#141740" stroke="#141740" strokeWidth="1" />
          ))}
          
          {/* Status LEDs */}
          {Array.from({ length: 4 }).map((_, i) => (
            <circle key={i} cx="48" cy={12 + i * 10} r="2" fill="#1E2260" filter="url(#serverGlowFilter)">
              <animate attributeName="opacity" values="1;0.2;1" dur={`${0.3 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* Network Cables */}
        <g strokeWidth="2" opacity="0.7">
          <path d="M900 230 Q 930 210 940 210" stroke="#161848" fill="none" />
          <path d="M900 250 Q 930 240 940 240" stroke="#141740" fill="none" />
          <path d="M900 270 Q 930 270 940 270" stroke="#0D1040" fill="none" />
        </g>

        {/* Local Recording Indicator */}
        <g transform="translate(800, 420)">
          <rect x="0" y="0" width="180" height="70" rx="6" fill="#0D1040" stroke="#141740" strokeWidth="2" opacity="0.9" />
          
          {/* Recording indicator */}
          <circle cx="25" cy="20" r="8" fill="#1E2260" filter="url(#serverGlowFilter)">
            <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
          </circle>
          
          {/* HDD icon */}
          <rect x="45" y="12" width="30" height="20" rx="2" fill="#141740" stroke="#161848" strokeWidth="1" />
          <circle cx="60" cy="22" r="6" fill="none" stroke="#141740" strokeWidth="2" />
          <circle cx="60" cy="22" r="2" fill="#1E2260" />
          
          {/* Storage bars */}
          <rect x="85" y="15" width="80" height="8" fill="#141740" rx="1" />
          <rect x="85" y="15" width="50" height="8" fill="#141740" rx="1" />
          
          <rect x="85" y="28" width="80" height="8" fill="#141740" rx="1" />
          <rect x="85" y="28" width="65" height="8" fill="#161848" rx="1" />
          
          <rect x="85" y="41" width="80" height="8" fill="#141740" rx="1" />
          <rect x="85" y="41" width="40" height="8" fill="#1E2260" rx="1" />
          
          {/* Label */}
          <text x="15" y="55" fontFamily="monospace" fontSize="10" fill="#93C5FD">LOCAL STORAGE</text>
        </g>

        {/* Security Shield Icon */}
        <g transform="translate(1050, 380)">
          <path d="M20 5 L35 10 L35 30 Q 20 45 5 30 L5 10 Z" fill="#0D1040" stroke="#161848" strokeWidth="2" />
          <path d="M20 12 L28 15 L28 28 Q 20 36 12 28 L12 15 Z" fill="none" stroke="#1E2260" strokeWidth="2" />
          <circle cx="20" cy="22" r="3" fill="#1E2260" filter="url(#serverGlowFilter)" />
        </g>

        {/* Lock Icon */}
        <g transform="translate(730, 400)">
          <rect x="5" y="15" width="25" height="20" rx="3" fill="#0D1040" stroke="#141740" strokeWidth="2" />
          <path d="M10 15 L10 10 Q 10 5 17.5 5 Q 25 5 25 10 L25 15" fill="none" stroke="#161848" strokeWidth="3" />
          <circle cx="17.5" cy="25" r="3" fill="#1E2260" filter="url(#serverGlowFilter)" />
        </g>

        {/* VSaaS on Cloud Label - Left Side */}
        <text x="300" y="80" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="28" fontWeight="bold" fill="url(#cloudGradientLeft)">
          VSaaS on Cloud
        </text>
        <text x="300" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fill="#93c5fd" opacity="0.9">
          Host your video surveillance in the cloud
        </text>
        <text x="300" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#60a5fa" opacity="0.7">
          No hardware needed, access from anywhere
        </text>

        {/* Cloud Benefits - Left Side */}
        <g transform="translate(180, 460)">
          <rect x="0" y="0" width="240" height="90" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" opacity="0.85" />
          <text x="120" y="22" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#60a5fa">BENEFITS</text>
          <line x1="15" y1="32" x2="225" y2="32" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          <circle cx="25" cy="48" r="4" fill="#3b82f6" />
          <text x="38" y="52" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">Professional Support</text>
          <circle cx="25" cy="65" r="4" fill="#8b5cf6" />
          <text x="38" y="69" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">Easy Setup</text>
          <circle cx="130" cy="48" r="4" fill="#6366f1" />
          <text x="143" y="52" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">24/7 Monitoring</text>
          <circle cx="130" cy="65" r="4" fill="#818cf8" />
          <text x="143" y="69" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">Scalable Storage</text>
        </g>

        {/* Configure Button - Left Side */}
        <g transform="translate(250, 555)">
          <rect x="0" y="0" width="100" height="30" rx="6" fill="#3b82f6" filter="url(#cloudGlowFilter)" />
          <text x="50" y="20" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600" fill="#ffffff">Configure</text>
        </g>

        {/* On-Premise Solution Label - Right Side */}
        <text x="900" y="80" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="28" fontWeight="bold" fill="url(#onPremiseGradientRight)">
          On-Premise Solution
        </text>
        <text x="900" y="105" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fill="#93C5FD" opacity="0.9">
          Host on your own servers
        </text>
        <text x="900" y="122" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#1E2260" opacity="0.7">
          Complete data control &amp; ownership
        </text>

        {/* On-Premise Benefits - Right Side */}
        <g transform="translate(780, 460)">
          <rect x="0" y="0" width="240" height="90" rx="8" fill="#0D1040" stroke="#141740" strokeWidth="1" opacity="0.85" />
          <text x="120" y="22" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2260">BENEFITS</text>
          <line x1="15" y1="32" x2="225" y2="32" stroke="#161848" strokeWidth="1" opacity="0.4" />
          <circle cx="25" cy="48" r="4" fill="#1E2260" />
          <text x="38" y="52" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">Professional Support</text>
          <circle cx="25" cy="65" r="4" fill="#1E2260" />
          <text x="38" y="69" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">Easy Setup</text>
          <circle cx="130" cy="48" r="4" fill="#161848" />
          <text x="143" y="52" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">24/7 Monitoring</text>
          <circle cx="130" cy="65" r="4" fill="#141740" />
          <text x="143" y="69" fontFamily="system-ui, sans-serif" fontSize="10" fill="#e2e8f0">Full Data Control</text>
        </g>

        {/* Configure Button - Right Side */}
        <g transform="translate(850, 555)">
          <rect x="0" y="0" width="100" height="30" rx="6" fill="#141740" filter="url(#serverGlowFilter)" />
          <text x="50" y="20" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600" fill="#ffffff">Configure</text>
        </g>

        {/* Ambient particles for right side */}
        <g opacity="0.4">
          <circle cx="750" cy="150" r="3" fill="#1E2260" filter="url(#serverGlowFilter)" />
          <circle cx="950" cy="130" r="2" fill="#1E2260" filter="url(#serverGlowFilter)" />
          <circle cx="1100" cy="160" r="3" fill="#161848" filter="url(#serverGlowFilter)" />
        </g>
      </svg>
    </div>
  );
};

export default SurveillanceComparison;
