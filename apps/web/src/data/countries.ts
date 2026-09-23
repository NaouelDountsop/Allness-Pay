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
    code: 'CM',
    name: 'Cameroun',
    dialCode: '+237',
    phonePattern: /^(\+237)?[6]\d{8}$/,
    phonePlaceholder: '6XX XXX XXX',
    phoneDigits: 9,
  },
  {
    code: 'SN',
    name: 'Sénégal',
    dialCode: '+221',
    phonePattern: /^(\+221)?[77]\d{8}$/,
    phonePlaceholder: '7X XXX XX XX',
    phoneDigits: 9,
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    dialCode: '+225',
    phonePattern: /^(\+225)?[0-9]\d{9,10}$/,
    phonePlaceholder: '0X XX XX XX XX',
    phoneDigits: 10,
  },
  {
    code: 'GA',
    name: 'Gabon',
    dialCode: '+241',
    phonePattern: /^(\+241)?[06]\d{7}$/,
    phonePlaceholder: '0X XX XX XX',
    phoneDigits: 8,
  },
  {
    code: 'CG',
    name: 'Congo',
    dialCode: '+242',
    phonePattern: /^(\+242)?[06]\d{8}$/,
    phonePlaceholder: '0X XXXX XXX',
    phoneDigits: 9,
  },
  {
    code: 'NE',
    name: 'Niger',
    dialCode: '+227',
    phonePattern: /^(\+227)?[89]\d{7}$/,
    phonePlaceholder: '8X XX XX XX',
    phoneDigits: 8,
  },
  {
    code: 'ML',
    name: 'Mali',
    dialCode: '+223',
    phonePattern: /^(\+223)?[67]\d{7}$/,
    phonePlaceholder: '6X XX XX XX',
    phoneDigits: 8,
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    dialCode: '+226',
    phonePattern: /^(\+226)?[67]\d{7}$/,
    phonePlaceholder: '6X XX XX XX',
    phoneDigits: 8,
  },
  {
    code: 'TG',
    name: 'Togo',
    dialCode: '+228',
    phonePattern: /^(\+228)?[9]\d{7}$/,
    phonePlaceholder: '9X XX XX XX',
    phoneDigits: 8,
  },
  {
    code: 'BJ',
    name: 'Bénin',
    dialCode: '+229',
    phonePattern: /^(\+229)?[69]\d{7}$/,
    phonePlaceholder: '6X XX XX XX',
    phoneDigits: 8,
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    phonePattern: /^(\+33)?[67]\d{8}$/,
    phonePlaceholder: '6XX XXX XXX',
    phoneDigits: 9,
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    phonePattern: /^(\+1)?[2-9]\d{9}$/,
    phonePlaceholder: '(XXX) XXX-XXXX',
    phoneDigits: 10,
  },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCountryCodeByName(name: string): string | undefined {
  const country = countries.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  return country?.code;
}

export function formatLocalPhone(phone: string, country: Country): string {
  const cleaned = phone.replace(/\D/g, '');
  const local = cleaned.startsWith(country.dialCode.replace('+', ''))
    ? cleaned.slice(country.dialCode.length - 1)
    : cleaned;
  return local;
}

export function buildFullPhone(localPhone: string, country: Country): string {
  const cleaned = localPhone.replace(/\D/g, '');
  return country.dialCode + cleaned;
}
