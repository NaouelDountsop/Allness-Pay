import { AppButton } from "@/components/common/button";

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <AppButton variant="outline" type="button">
        <img src="/Google.jpg" className="w-4 h-4" alt="" /> Google
      </AppButton>
      <AppButton variant="outline" type="button">
        <img src="/Apple.jpg" className="w-4 h-4" alt="" /> Apple
      </AppButton>
    </div>
  );
}
