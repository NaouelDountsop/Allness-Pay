const FLAGS = [
  { code: 'cm', name: 'Cameroun' },
  { code: 'sn', name: 'Sénégal' },
  { code: 'ci', name: "Côte d'Ivoire" },
  { code: 'ne', name: 'Niger' },
  { code: 'ml', name: 'Mali' },
  { code: 'bf', name: 'Burkina Faso' },
  { code: 'tg', name: 'Togo' },
  { code: 'bj', name: 'Bénin' },
  { code: 'ga', name: 'Gabon' },
  { code: 'cg', name: 'Congo' },
  { code: 'fr', name: 'France' },
  { code: 'ca', name: 'Canada' },
];

export default function Trust() {
  return (
    <section className="bg-muted py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <h2 className="font-heading font-extrabold text-[clamp(1.5rem,3vw,2.25rem)] text-allness-dark">
          Ils nous font confiance
        </h2>

        <p className="mt-3 text-foreground/60 text-sm lg:text-base">
          Présents sur trois continents, au service de votre communauté.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {FLAGS.map((f) => (
            <div key={f.name} className="group cursor-default flex flex-col items-center gap-2">
              {/* Drapeau */}
              <div className="overflow-hidden rounded-md shadow-sm transition-transform duration-300 group-hover:scale-125 group-hover:shadow-lg">
                <img
                  src={`https://flagcdn.com/w80/${f.code}.png`}
                  alt={`Drapeau ${f.name}`}
                  className="h-12 w-20 object-cover lg:h-14 lg:w-24"
                />
              </div>

              {/* Nom du pays */}
              <span className="text-xs lg:text-sm font-medium text-foreground/50 transition-colors duration-300 group-hover:text-allness-dark">
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
