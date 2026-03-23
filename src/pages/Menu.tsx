import { useLiff } from "@/contexts/LiffContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";

const MENU_IMAGES = {
  spicy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/menu-chicken-spicy_76c4a1ab.webp",
  crispy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/menu-chicken-crispy_df57c92d.jpg",
  garlic: "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/menu-chicken-garlic_b6675ba0.jpg",
};

const SAMPLE_MENU_ITEMS = [
  {
    id: 1,
    name: "ไก่ทอดซอสเผ็ดเกาหลี",
    category: "เมนูยอดนิยม",
    description: "ไก่ทอดกรอบราดซอสโกชูจัง รสเผ็ดหวาน เสิร์ฟพร้อมผักดอง",
    price: 259,
    imageUrl: MENU_IMAGES.spicy,
    isNew: false,
  },
  {
    id: 2,
    name: "ไก่ทอดกรอบออริจินัล",
    category: "เมนูแนะนำ",
    description: "ไก่ทอดสูตรดั้งเดิม กรอบนอกนุ่มใน เสิร์ฟพร้อมซอสพิเศษ",
    price: 229,
    imageUrl: MENU_IMAGES.crispy,
    isNew: false,
  },
  {
    id: 3,
    name: "ไก่ทอดซอสกระเทียม",
    category: "เมนูใหม่",
    description: "ไก่ทอดราดซอสกระเทียมเข้มข้น โรยพริกและต้นหอม",
    price: 279,
    imageUrl: MENU_IMAGES.garlic,
    isNew: true,
  },
];

export default function Menu() {
  const { isLineLoggedInStatus, isLoading: liffLoading } = useLiff();
  const { data: menuItems, isLoading } = trpc.menu.getNewItems.useQuery();

  if (liffLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isLineLoggedInStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-muted-foreground mb-6">
            คุณต้องเข้าสู่ระบบเพื่อดูเมนู
          </p>
          <Link href="/line-login">
            <Button className="btn-elegant">เข้าสู่ระบบด้วย LINE</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayItems = menuItems && menuItems.length > 0 ? menuItems : SAMPLE_MENU_ITEMS;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              กลับ
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground">เมนูอาหาร</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : !displayItems || displayItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              ยังไม่มีเมนูในขณะนี้
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <Card key={item.id} className="overflow-hidden rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                          {item.name}
                        </h3>
                        {item.isNew && (
                          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            ใหม่
                          </span>
                        )}
                      </div>

                      {item.category && (
                        <p className="text-xs text-accent font-medium mb-1">
                          {item.category}
                        </p>
                      )}

                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base sm:text-lg font-bold text-accent">
                        ฿{item.price}
                      </span>
                      <Link href="/">
                        <Button size="sm" className="btn-elegant text-xs px-3 py-1.5 h-auto">
                          จองเลย
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
