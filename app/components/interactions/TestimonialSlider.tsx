"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type TouchEvent } from "react";

import type { Testimonial } from "../../../content/about-social-proof";
import {
  getBoundedTestimonialIndex,
  getSwipeDirection,
  type TestimonialDirection,
} from "../../../lib/testimonial-slider";

type TestimonialSliderProps = {
  eyebrow: string;
  testimonials: readonly Testimonial[];
};

type BrandStyle = CSSProperties & { "--testimonial-logo-width": Testimonial["logoOpticalWidth"] };

export default function TestimonialSlider({ eyebrow, testimonials }: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const active = testimonials[activeIndex];
  const count = testimonials.length;

  const move = (direction: TestimonialDirection) => {
    setActiveIndex((current) => getBoundedTestimonialIndex(current, direction, count));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
    move(getSwipeDirection(deltaX));
  };

  if (!active) return null;

  return (
    <section className="testimonial-section" aria-labelledby="testimonials-title">
      <div
        aria-label="Testimonials carousel"
        aria-roledescription="carousel"
        className="about-wrap testimonial-slider"
        onKeyDown={handleKeyDown}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        tabIndex={0}
      >
        <div className="about-section-rule" />
        <header className="testimonial-heading">
          <h2 id="testimonials-title" className="eyebrow">{eyebrow}</h2>
          <span className="eyebrow" aria-hidden="true">{activeIndex + 1} / {count}</span>
        </header>
        <article className="testimonial-content" aria-roledescription="slide" aria-label={`${activeIndex + 1} of ${count}`}>
          <div className="testimonial-brand" aria-hidden="true">
            <Image
              alt=""
              className="testimonial-brand-image"
              height={960}
              src={active.logoPath}
              style={{ "--testimonial-logo-width": active.logoOpticalWidth, aspectRatio: active.logoAspectRatio } as BrandStyle}
              width={960}
            />
          </div>
          <blockquote className="testimonial-quote">
            <p>“{active.quote}”</p>
          </blockquote>
          <footer className="testimonial-attribution">
            <strong>{active.name}</strong>
            <span>{active.role} / {active.organization}</span>
          </footer>
        </article>
        <nav className="testimonial-controls" aria-label="Choose testimonial">
          <button aria-label="Previous testimonial" disabled={activeIndex === 0} onClick={() => move(-1)} type="button">
            <span aria-hidden="true">←</span> Previous
          </button>
          <span className="testimonial-position" aria-hidden="true">{activeIndex + 1} / {count}</span>
          <button aria-label="Next testimonial" disabled={activeIndex === count - 1} onClick={() => move(1)} type="button">
            Next <span aria-hidden="true">→</span>
          </button>
        </nav>
        <p className="sr-only" aria-live="polite">Testimonial {activeIndex + 1} of {count}: {active.name}</p>
      </div>
    </section>
  );
}
