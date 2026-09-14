import Image from "next/image";

type AppLogoProps = {
  size?: number;
  className?: string;
};

export function AppLogo({
  size = 24,
  className = "",
}: AppLogoProps) {
  return (
    <>
      <Image
        src="/images/logo.png"
        alt=""
        width={size}
        height={size}
        aria-hidden
        className={`dark:hidden ${className}`}
      />

      <Image
        src="/images/logo-dark.png"
        alt=""
        width={size}
        height={size}
        aria-hidden
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}