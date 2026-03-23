import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={language === "th" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("th")}
        className="text-xs font-semibold"
      >
        ไทย
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-xs font-semibold"
      >
        English
      </Button>
    </div>
  );
}
