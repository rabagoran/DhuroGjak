export default function GabimFushe({ teksti }: { teksti?: string }) {
  if (!teksti) return null;
  return <p className="hint" style={{ color: "var(--red)" }} role="alert">{teksti}</p>;
}
