// src/components/ui/Counter.jsx
import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const Counter = ({ end, label, duration = 4, suffix = "+" }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
    delay: 100
  });

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      setHasAnimated(true);
    } else {
      setHasAnimated(false);
    }
  }, [inView]);

  return (
    <div ref={ref} className="text-center snake-entrance">
      <div className="stat-number">
        {hasAnimated ? (
          <CountUp 
            end={end} 
            duration={duration} 
            delay={0.3}
            separator=","
            suffix={suffix}
            redraw={true}
          />
        ) : (
          `0${suffix}`
        )}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default Counter;