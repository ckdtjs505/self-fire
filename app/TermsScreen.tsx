import LegalDocument from "@/components/legal-document";
import { TERMS_OF_SERVICE } from "@/data/legal";

export default function TermsScreen() {
  return <LegalDocument title="서비스 이용약관" body={TERMS_OF_SERVICE} />;
}
