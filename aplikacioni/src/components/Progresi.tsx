export default function Progresi({ pranuar, dozat }: { pranuar: number; dozat: number }) {
  const sa = Math.min(pranuar, dozat);
  const perqindja = dozat > 0 ? Math.round((sa / dozat) * 100) : 0;
  return (
    <div className="progress-wrap">
      <p className="progress-label">
        <strong>{sa} nga {dozat}</strong> dhurues u gjet{sa >= dozat ? " ✅" : ""}
      </p>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={dozat} aria-valuenow={sa}
        aria-label={`${sa} nga ${dozat} dhurues`}>
        <span style={{ width: `${perqindja}%` }} />
      </div>
    </div>
  );
}
