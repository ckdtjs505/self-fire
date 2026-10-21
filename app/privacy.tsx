import LegalDocument from "@/components/legal-document";
import { PRIVACY_POLICY } from "@/data/legal";

export default function PrivacyScreen() {
  return <LegalDocument title="개인정보 처리방침" body={PRIVACY_POLICY} />;
}
