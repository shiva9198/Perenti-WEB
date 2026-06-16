import React, { useEffect, useRef } from "react";

export default function LottiePlayer({ src, style }) {
  const ref = useRef(null);

  useEffect(() => {
    let anim;
    import("lottie-web").then((m) => {
      const lottie = m.default || m;
      anim = lottie.loadAnimation({
        container: ref.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: src,
      });
    });
    return () => anim && anim.destroy();
  }, [src]);

  return <div ref={ref} style={style} />;
}
