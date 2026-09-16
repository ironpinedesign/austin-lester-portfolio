import Image from "next/image";
import type { CSSProperties } from "react";

import type { ClientLogo } from "../../content/about-social-proof";

type ClientLogoWallProps = {
  clients: readonly ClientLogo[];
  eyebrow: string;
};

type LogoCellStyle = CSSProperties & { "--logo-width": ClientLogo["opticalWidth"] };

export default function ClientLogoWall({ clients, eyebrow }: ClientLogoWallProps) {
  return (
    <section className="client-wall" aria-labelledby="selected-clients-title">
      <div className="about-wrap client-wall-inner">
        <div className="about-section-rule" />
        <h2 id="selected-clients-title" className="eyebrow client-wall-title">
          {eyebrow}
        </h2>
        <ul className="client-logo-grid">
          {clients.map((client) => (
            <li key={client.id}>
              <Image
                alt={client.name}
                className="client-logo-image"
                height={960}
                src={client.logoPath}
                style={{ "--logo-width": client.opticalWidth, aspectRatio: client.aspectRatio } as LogoCellStyle}
                width={960}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
