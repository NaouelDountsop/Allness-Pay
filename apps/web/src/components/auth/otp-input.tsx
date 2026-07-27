import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function OtpInput({ value, onChange }: OtpInputProps) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup className="gap-2 justify-center w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className="w-11 h-12 rounded-lg border-gray-200 text-lg"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
