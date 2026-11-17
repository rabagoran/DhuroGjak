import Link from "next/link";

/** Mesazh i ndarë për gabim lidhjeje (jo për listë bosh). */
export default function GabimDB({ provo = "/", teksti }: { provo?: string; teksti?: string }) {
  return (
    <div className="alert alert-error" role="alert">
      <p><strong>Nuk u lidhëm me databazën.</strong></p>
      <p>{teksti ?? "Kontrollo internetin dhe provo përsëri pas pak."}</p>
      <Link className="btn btn-small" href={provo} prefetch={false}>Provo përsëri</Link>
    </div>
  );
}
