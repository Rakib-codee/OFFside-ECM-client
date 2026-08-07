/** Simplified payment marks rendered inline so no external assets are needed. */
export default function PaymentIcons() {
  const marks = [
    { key: "visa", node: <VisaMark /> },
    { key: "mastercard", node: <MastercardMark /> },
    { key: "paypal", node: <PaypalMark /> },
    { key: "applepay", node: <WalletMark label=" Pay" /> },
    { key: "gpay", node: <WalletMark label="G Pay" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {marks.map((mark) => (
        <span
          key={mark.key}
          className="flex h-8 w-12 items-center justify-center rounded border border-line bg-elevated opacity-60 transition-opacity hover:opacity-100"
        >
          {mark.node}
        </span>
      ))}
    </div>
  );
}

function VisaMark() {
  return (
    <span className="text-[10px] font-bold italic tracking-wider text-white">VISA</span>
  );
}

function MastercardMark() {
  return (
    <span className="relative flex h-4 w-7 items-center justify-center" aria-label="Mastercard">
      <span className="absolute left-1 h-4 w-4 rounded-full bg-[#eb001b] opacity-90" />
      <span className="absolute right-1 h-4 w-4 rounded-full bg-[#f79e1b] opacity-90" />
    </span>
  );
}

function PaypalMark() {
  return (
    <span className="text-[10px] font-bold italic text-[#7ab8ff]">
      Pay<span className="text-white">Pal</span>
    </span>
  );
}

function WalletMark({ label }: { label: string }) {
  return <span className="text-[10px] font-semibold text-white">{label}</span>;
}
