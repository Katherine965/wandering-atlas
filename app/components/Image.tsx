import type { ImgHTMLAttributes } from "react";
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; fill?: boolean; priority?: boolean; unoptimized?: boolean; quality?: number };
/** Native image adapter preserving existing fill geometry; all imagery is local. */
export default function Image({ fill, priority, unoptimized: _unoptimized, quality: _quality, style, ...props }: Props) { return <img {...props} loading={priority ? "eager" : props.loading ?? "lazy"} decoding="async" style={fill ? { position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent", ...style } : style} />; }
