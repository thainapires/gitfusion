"use client";

import type { IconType } from "react-icons";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TouchEvent, useEffect, useRef, useState } from "react";
import { DashboardMetric } from "@/types/mock-app";

type EnhancedMetric = DashboardMetric & {
  icon?: IconType;
  visual?: "sparkline" | "bars" | "progress";
};

const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

export function MetricsCarousel({ metrics }: { metrics: EnhancedMetric[] }) {
  const count = metrics.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex >= count) {
      setActiveIndex(0);
    }
  }, [count, activeIndex]);

  useEffect(() => {
    if (count <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [count, activeIndex]);

  if (!count) {
    return null;
  }

  const goTo = (index: number) => {
    setActiveIndex(((index % count) + count) % count);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    goTo(activeIndex + (deltaX < 0 ? 1 : -1));
  };

  return (
    <div className="col-span-full sm:hidden">
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/35 bg-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label="Dashboard metrics"
      >
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {metrics.map((metric, index) => (
            <MobileMetricCard
              key={metric.label}
              metric={metric}
              isActive={index === activeIndex}
              position={index + 1}
              count={count}
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous metric"
              className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-primary/25 bg-muted text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <FiChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next metric"
              className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-primary/25 bg-muted text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <FiChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {metrics.map((metric, index) => (
            <button
              key={metric.label}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to ${metric.label}`}
              aria-current={index === activeIndex}
              className={
                "h-2 rounded-full transition-[width,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                (index === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/25")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMetricCard({
  metric,
  isActive,
  position,
  count,
}: {
  metric: EnhancedMetric;
  isActive: boolean;
  position: number;
  count: number;
}) {
  const Icon = metric.icon;

  return (
    <article
      className="flex w-full shrink-0 flex-col items-center py-5 text-center"
      aria-label={`${position} of ${count}: ${metric.label}`}
      aria-hidden={!isActive}
    >
      <div className="flex max-w-full items-center justify-center gap-3">
        {Icon && (
          <span className="grid size-13 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden />
          </span>
        )}
        <h2 className="text-left text-xl font-extrabold leading-tight text-foreground">{metric.label}</h2>
      </div>

      <p className="mt-2 break-words text-6xl font-extrabold leading-none tracking-tight text-primary">{metric.value}</p>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-muted-foreground">{metric.helper}</p>

      <div className="mt-3 inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
        <FiCalendar className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{metric.trend}</span>
      </div>
    </article>
  );
}
