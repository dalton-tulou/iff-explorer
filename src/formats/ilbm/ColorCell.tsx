export default function ColorCell({
  color,
  index,
}: {
  color: string;
  index: number;
}) {
  return (
    <div
      key={index}
      className="w-8 h-8 inline-block border border-solid border-black"
      style={{
        backgroundColor: color,
      }}
      title={`${index}: ${color}`}
    ></div>
  );
}
