export default function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-sm text-gray-400 mb-4">{title}</h2>
      {children}
    </section>
  );
}