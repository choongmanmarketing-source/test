import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "th" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  th: {
    // Common
    "common.back": "กลับ",
    "common.next": "ถัดไป",
    "common.submit": "ส่ง",
    "common.cancel": "ยกเลิก",
    "common.edit": "แก้ไข",
    "common.delete": "ลบ",
    "common.save": "บันทึก",
    "common.loading": "กำลังโหลด...",
    "common.error": "เกิดข้อผิดพลาด",
    "common.success": "สำเร็จ",
    "common.confirm": "ยืนยัน",

    // Navigation
    "nav.booking": "จองโต๊ะ",
    "nav.menu": "เมนู",
    "nav.reservations": "การจอง",
    "nav.profile": "โปรไฟล์",

    // Home
    "home.title": "Choongman Chicken",
    "home.subtitle": "ไก่ทอดเกาหลีสูตรพิเศษ กรอบนอกนุ่มใน",
    "home.booking_title": "จองโต๊ะ",
    "home.select_branch": "เลือกสาขา",
    "home.select_date": "วันที่",
    "home.select_time": "เวลา",
    "home.select_guests": "จำนวนคน",
    "home.special_notes": "หมายเหตุพิเศษ (ไม่บังคับ)",
    "home.popular_menu": "เมนูยอดนิยม",
    "home.view_all": "ดูทั้งหมด",
    "home.important_info": "ข้อมูลสำคัญ",
    "home.info_1": "เราจะติดต่อยืนยันการจองภายใน 1 ชั่วโมง",
    "home.info_2": "หากต้องการยกเลิก กรุณาแจ้ง 24 ชั่วโมงก่อน",
    "home.info_3": "เปิดให้บริการ 11:00 - 22:00 น. ทุกวัน",
    "home.book_now": "จองเลย",

    // Reservations
    "reservations.title": "การจองของฉัน",
    "reservations.new_booking": "จองใหม่",
    "reservations.no_bookings": "ยังไม่มีการจอง",
    "reservations.no_bookings_desc": "คุณยังไม่มีการจองโต๊ะ ไปจองเลยวันนี้!",
    "reservations.booking_id": "การจองที่ #",
    "reservations.pending": "รอการยืนยัน",
    "reservations.confirmed": "ยืนยันแล้ว",
    "reservations.completed": "เสร็จสิ้น",
    "reservations.cancelled": "ยกเลิก",
    "reservations.notes": "หมายเหตุ:",
    "reservations.view_menu": "ดูเมนูและจอง",

    // Menu
    "menu.title": "เมนูอาหาร",
    "menu.no_items": "ยังไม่มีเมนูในขณะนี้",
    "menu.new": "ใหม่",
    "menu.popular": "ยอดนิยม",
    "menu.recommended": "แนะนำ",

    // Profile
    "profile.title": "โปรไฟล์",
    "profile.my_reservations": "การจองของฉัน",
    "profile.total_bookings": "จำนวนการจองทั้งหมด",
    "profile.member_since": "สมาชิกตั้งแต่",
    "profile.logout": "ออกจากระบบ",

    // Confirmation
    "confirmation.success": "จองสำเร็จ!",
    "confirmation.success_desc": "เราจะติดต่อยืนยันภายใน 1 ชั่วโมง",
    "confirmation.booking_number": "หมายเลขการจอง",
    "confirmation.branch": "สาขา",
    "confirmation.date": "วันที่",
    "confirmation.time": "เวลา",
    "confirmation.guests": "จำนวน",
    "confirmation.share_line": "แชร์ไปยัง LINE",
    "confirmation.book_again": "จองโต๊ะอีกครั้ง",
    "confirmation.back_home": "กลับไปหน้าแรก",

    // Login
    "login.title": "ยินดีต้อนรับ",
    "login.subtitle": "เข้าสู่ระบบด้วย LINE เพื่อจองโต๊ะ",
    "login.benefits": "ข้อดีของการเข้าสู่ระบบ",
    "login.benefit_1": "จองโต๊ะได้แบบสะดวก",
    "login.benefit_2": "ดูเมนูพิเศษ",
    "login.benefit_3": "รับการแจ้งเตือนการจอง",
    "login.benefit_4": "แชร์การจองกับเพื่อน",
    "login.login_button": "เข้าสู่ระบบด้วย LINE",
    "login.terms": "โปรดอ่านข้อกำหนดการใช้ LINE",
  },
  en: {
    // Common
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.confirm": "Confirm",

    // Navigation
    "nav.booking": "Book Table",
    "nav.menu": "Menu",
    "nav.reservations": "My Bookings",
    "nav.profile": "Profile",

    // Home
    "home.title": "Choongman Chicken",
    "home.subtitle": "Korean Fried Chicken with Special Recipe",
    "home.booking_title": "Book a Table",
    "home.select_branch": "Select Branch",
    "home.select_date": "Date",
    "home.select_time": "Time",
    "home.select_guests": "Number of Guests",
    "home.special_notes": "Special Notes (Optional)",
    "home.popular_menu": "Popular Menu",
    "home.view_all": "View All",
    "home.important_info": "Important Information",
    "home.info_1": "We will confirm your booking within 1 hour",
    "home.info_2": "To cancel, please notify us 24 hours in advance",
    "home.info_3": "Open 11:00 AM - 10:00 PM Daily",
    "home.book_now": "Book Now",

    // Reservations
    "reservations.title": "My Bookings",
    "reservations.new_booking": "New Booking",
    "reservations.no_bookings": "No Bookings Yet",
    "reservations.no_bookings_desc": "You don't have any table bookings. Book one today!",
    "reservations.booking_id": "Booking #",
    "reservations.pending": "Pending",
    "reservations.confirmed": "Confirmed",
    "reservations.completed": "Completed",
    "reservations.cancelled": "Cancelled",
    "reservations.notes": "Notes:",
    "reservations.view_menu": "View Menu & Book",

    // Menu
    "menu.title": "Menu",
    "menu.no_items": "No menu items available",
    "menu.new": "New",
    "menu.popular": "Popular",
    "menu.recommended": "Recommended",

    // Profile
    "profile.title": "Profile",
    "profile.my_reservations": "My Bookings",
    "profile.total_bookings": "Total Bookings",
    "profile.member_since": "Member Since",
    "profile.logout": "Logout",

    // Confirmation
    "confirmation.success": "Booking Confirmed!",
    "confirmation.success_desc": "We will confirm your booking within 1 hour",
    "confirmation.booking_number": "Booking Number",
    "confirmation.branch": "Branch",
    "confirmation.date": "Date",
    "confirmation.time": "Time",
    "confirmation.guests": "Guests",
    "confirmation.share_line": "Share to LINE",
    "confirmation.book_again": "Book Another Table",
    "confirmation.back_home": "Back to Home",

    // Login
    "login.title": "Welcome",
    "login.subtitle": "Login with LINE to book a table",
    "login.benefits": "Benefits of Logging In",
    "login.benefit_1": "Easy table booking",
    "login.benefit_2": "View special menu",
    "login.benefit_3": "Get booking notifications",
    "login.benefit_4": "Share bookings with friends",
    "login.login_button": "Login with LINE",
    "login.terms": "Please read LINE Terms of Service",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && (saved === "th" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
