// Java 13: skeleton gjatë ngarkimit nga Neon (shfaqet menjëherë në rrjet të ngadaltë).
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Po ngarkohet">
      <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 16 }} />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 14 }} />)}
    </main>
  );
}
