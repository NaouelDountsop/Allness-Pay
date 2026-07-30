import { AppButton } from "@/components/common/button";

export function SocialButtons() {
  return (
    <div className="grid grid-cols-1 gap-3">
      <AppButton variant="outline" type="button">
        <img src="/Google.jpg" className="w-9 h-9" alt="" />Continuer avec Google
      </AppButton>
      {/* <AppButton variant="outline" type="button">
        <img src="/Apple.jpg" className="w-9 h-9" alt="" /> Apple
      </AppButton> */}
    </div>
  );
}
