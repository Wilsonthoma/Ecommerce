// src/styles/globalStyles.js

export const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-title-wrapper {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2.8rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 2rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  @media (max-width: 480px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.3rem 1rem;
    }
  }
  
  .section-subtitle {
    font-weight: 500;
    font-size: 1.2rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .section-header-container {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .stat-number {
    font-weight: 700;
    font-size: 3.5rem;
    line-height: 1;
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @media (max-width: 768px) {
    .stat-number {
      font-size: 2.5rem;
    }
  }
  
  .stat-label {
    font-weight: 500;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
  }
  
  .badge-flash {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
  }
  
  .badge-trending {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
  }
  
  .badge-new {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  .typewriter-bold {
    font-weight: 800;
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.7), 0 0 60px rgba(239, 68, 68, 0.4);
    letter-spacing: -0.02em;
    color: #FCD34D;
    background: transparent;
  }
  
  .text-gradient-yellow-orange {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export const animationStyles = `
  @keyframes wave {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  
  @keyframes snake {
    0% {
      clip-path: inset(0 100% 0 0);
    }
    50% {
      clip-path: inset(0 0 0 0);
    }
    100% {
      clip-path: inset(0 0 0 100%);
    }
  }
  
  [data-aos="wave-up"] {
    opacity: 0;
    transform: translateY(30px);
    transition-property: transform, opacity;
  }
  
  [data-aos="wave-up"].aos-animate {
    opacity: 1;
    transform: translateY(0);
  }
  
  .snake-entrance {
    position: relative;
    overflow: hidden;
  }
  
  .snake-entrance::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2), transparent);
    animation: snake 1.5s ease-in-out;
    pointer-events: none;
    z-index: 10;
  }
`;