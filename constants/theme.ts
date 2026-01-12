export const theme = {
    colors: {
      // الخلفية الصفراء الرئيسية
      background: "#F6D84B",
  
      // كروت داخلية (أبيض دافي/كريمي)
      card: "#FFF6D6",
  
      // نصوص
      text: "#111111",
      mutedText: "#3A3A3A",
  
      // حدود/تفاصيل
      border: "rgba(17,17,17,0.12)",
  
      // أزرار
      primary: "#111111",
      onPrimary: "#F6D84B",
  
      // حالات
      danger: "#E74C3C",
    },
  
    radius: {
      s: 12,
      m: 18,
      l: 26,
    },
  
    spacing: {
      s: 8,
      m: 12,
      l: 16,
      xl: 24,
      xxl: 32,
    },
  
    text: {
      h1: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.3 },
      h2: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.2 },
      body: { fontSize: 16, fontWeight: "500" as const },
      small: { fontSize: 13, fontWeight: "500" as const },
    },
  
    shadow: {
      // Shadow لطيف مثل UI بالصورة
      card: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      },
    },
  };
  