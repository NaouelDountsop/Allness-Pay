export interface Country {
  code: string;
  name: string;
  dialCode: string;
  phonePattern: RegExp;
  phonePlaceholder: string;
  phoneDigits: number;
}

export function getFlagUrl(code: string): string {
  return `/flags/${code.toLowerCase()}.png`;
}

export const countries: Country[] = [
  {
    code: "CM",
    name: "Cameroun",
    dialCode: "+237",
    phonePattern: /^(\+237)?[6]\d{8}$/,
    phonePlaceholder: "6XX XXX XXX",
    phoneDigits: 9,
  },
  {
    code: "SN",
    name: "S\u00e9n\u00e9gal",
    dialCode: "+221",
    phonePattern: /^(\+221)?[77]\d{8}$/,
    phonePlaceholder: "7X XXX XX XX",
    phoneDigits: 9,
  },
  {
    code: "CI",
    name: "C\u00f4te d'Ivoire",
    dialCode: "+225",
    phonePattern: /^(\+225)?[0-9]\d{9,10}$/,
    phonePlaceholder: "0X XX XX XX XX",
    phoneDigits: 10,
  },
  {
    code: "GA",
    name: "Gabon",
    dialCode: "+241",
    phonePattern: /^(\+241)?[06]\d{7}$/,
    phonePlaceholder: "0X XX XX XX",
    phoneDigits: 8,
  },
  {
    code: "CG",
    name: "Congo",
    dialCode: "+242",
    phonePattern: /^(\+242)?[06]\d{8}$/,
    phonePlaceholder: "0X XXXX XXX",
    phoneDigits: 9,
  },
  {
    code: "CD",
    name: "R\u00e9p. D\u00e9m. du Congo",
    dialCode: "+243",
    phonePattern: /^(\+243)?[89]\d{8}$/,
    phonePlaceholder: "8X XXX XXXX",
    phoneDigits: 9,
  },
  {
    code: "NE",
    name: "Niger",
    dialCode: "+227",
    phonePattern: /^(\+227)?[89]\d{7}$/,
    phonePlaceholder: "8X XX XX XX",
    phoneDigits: 8,
  },
  {
    code: "ML",
    name: "Mali",
    dialCode: "+223",
    phonePattern: /^(\+223)?[67]\d{7}$/,
    phonePlaceholder: "6X XX XX XX",
    phoneDigits: 8,
  },
  {
    code: "BF",
    name: "Burkina Faso",
    dialCode: "+226",
    phonePattern: /^(\+226)?[67]\d{7}$/,
    phonePlaceholder: "6X XX XX XX",
    phoneDigits: 8,
  },
  {
    code: "TG",
    name: "Togo",
    dialCode: "+228",
    phonePattern: /^(\+228)?[9]\d{7}$/,
    phonePlaceholder: "9X XX XX XX",
    phoneDigits: 8,
  },
  {
    code: "BJ",
    name: "B\u00e9nin",
    dialCode: "+229",
    phonePattern: /^(\+229)?[69]\d{7}$/,
    phonePlaceholder: "6X XX XX XX",
    phoneDigits: 8,
  },
  {
    code: "GN",
    name: "Guin\u00e9e",
    dialCode: "+224",
    phonePattern: /^(\+224)?[66]\d{8}$/,
    phonePlaceholder: "6XX XXX XXX",
    phoneDigits: 9,
  },
  {
    code: "RW",
    name: "Rwanda",
    dialCode: "+250",
    phonePattern: /^(\+250)?[7]\d{8}$/,
    phonePlaceholder: "7XX XXX XXX",
    phoneDigits: 9,
  },
  {
    code: "KE",
    name: "Kenya",
    dialCode: "+254",
    phonePattern: /^(\+254)?[17]\d{8,9}$/,
    phonePlaceholder: "7XX XXX XXX",
    phoneDigits: 9,
  },
  {
    code: "GH",
    name: "Ghana",
    dialCode: "+233",
    phonePattern: /^(\+233)?[25]\d{8}$/,
    phonePlaceholder: "2X XXX XXXX",
    phoneDigits: 9,
  },
  {
    code: "NG",
    name: "Nigeria",
    dialCode: "+234",
    phonePattern: /^(\+234)?[789]\d{9}$/,
    phonePlaceholder: "80X XXX XXXX",
    phoneDigits: 10,
  },
  {
    code: "ZA",
    name: "Afrique du Sud",
    dialCode: "+27",
    phonePattern: /^(\+27)?[6-8]\d{8}$/,
    phonePlaceholder: "6XX XXX XXXX",
    phoneDigits: 9,
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    phonePattern: /^(\+33)?[67]\d{8}$/,
    phonePlaceholder: "6XX XXX XXX",
    phoneDigits: 9,
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    phonePattern: /^(\+1)?[2-9]\d{9}$/,
    phonePlaceholder: "(XXX) XXX-XXXX",
    phoneDigits: 10,
  },
  {
    code: "US",
    name: "\u00c9tats-Unis",
    dialCode: "+1",
    phonePattern: /^(\+1)?[2-9]\d{9}$/,
    phonePlaceholder: "(XXX) XXX-XXXX",
    phoneDigits: 10,
  },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function formatLocalPhone(phone: string, country: Country): string {
  const cleaned = phone.replace(/\D/g, "");
  const local = cleaned.startsWith(country.dialCode.replace("+", ""))
    ? cleaned.slice(country.dialCode.length - 1)
    : cleaned;
  return local;
}

export function buildFullPhone(
  localPhone: string,
  country: Country,
): string {
  const cleaned = localPhone.replace(/\D/g, "");
  return country.dialCode + cleaned;
}
