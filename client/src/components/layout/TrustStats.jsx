// src/components/layout/TrustStats.jsx
import React from 'react';
import Counter from "../ui/Counter";
import SectionHeader from "../ui/SectionHeader";
import { trustStats } from "../../utils/constants";

const TrustStats = ({ headerImage }) => {
  return (
    <section className="py-16 bg-black border-b border-gray-800">
      <div className="px-6 mx-auto max-w-7xl">
        <SectionHeader 
          title="TRUSTED BY HUNDREDS"
          image={headerImage}
          alt="Trusted by hundreds"
        />
        
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-24">
          {trustStats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={400 + (index * 200)}
              data-aos-once="false"
            >
              <Counter 
                end={stat.number} 
                label={stat.label} 
                duration={stat.duration}
                suffix={stat.suffix}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStats;