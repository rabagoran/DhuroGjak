import Link from "next/link";

export default function KerkesaNukGjendet() {
  return (
    <main>
      <div className="card empty">
        <p className="big-emoji">🔍</p>
        <h1>Kërkesa nuk u gjet</h1>
        <p className="muted">Mund të jetë fshirë, ose lidhja është e gabuar.</p>
        <Link className="btn" href="/">Kthehu te lista</Link>
      </div>
    </main>
  );
}
