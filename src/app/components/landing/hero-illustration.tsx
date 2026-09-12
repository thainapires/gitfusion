import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="animate-hero-illustration relative mx-auto mt-10 flex w-full max-w-[42rem] items-center justify-center lg:mt-0 lg:max-w-[46rem]">
      <div className="pointer-events-none absolute inset-8 rounded-full" aria-hidden />
      <Image
        src="/images/git-fusion-hero.png"
        alt="GitHub and GitLab integration illustration"
        width={920}
        height={720}
        priority
        sizes="(max-width: 768px) 92vw, (max-width: 1200px) 50vw, 680px"
        className="relative z-10 h-auto w-full max-w-[34rem] object-contain sm:max-w-[39rem] lg:max-w-[44rem]"
      />
    </div>
  );
}
