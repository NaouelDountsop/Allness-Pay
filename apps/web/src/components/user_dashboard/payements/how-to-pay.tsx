const steps = [
  {
    number: 1,
    title: "Scanner le QR Code du marchand",
    description: "Utilisez la caméra pour scanner le code QR affiché par le marchand.",
  },
  {
    number: 2,
    title: "Vérifier les informations",
    description:
      "Utilisez la caméra pour scanner le QR code affiché par le marchand.",
  },
  {
    number: 3,
    title: "Confirmer le paiement",
    description:
      "Utilisez la caméra pour scanner le QR code affiché par le marchand.",
  },
];

export function HowToPay() {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Comment payer ?</h3>
      <div className="relative">
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200" />
        <ul className="space-y-5">
          {steps.map((step) => (
            <li key={step.number} className="flex gap-3 relative">
              <span className="w-7 h-7 rounded-full bg-afrilink-orange text-white text-xs font-semibold flex items-center justify-center shrink-0 z-10">
                {step.number}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-800">{step.title}</p>
                <p className="text-[11px] text-gray-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
