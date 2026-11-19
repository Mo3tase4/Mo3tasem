// ريل "متى لازم تجيب حيوانك للطوارئ؟" لمركز أليف البيطري.
// تركيب خاص بالفيديو لأنه مشاهد الكيت بترسم من اليسار لليمين، والعربي بدو RTL.
// الألوان والخطوط واللوغو من ملف البراند (src/brands/aleef.json)، مش مكتوبة هون.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import brandJson from "../brands/aleef.json";
import { brandFont } from "../kit/brand";

const B = brandJson as any;
const C = {
  green: B.colors.primary as string,
  gold: B.colors.accent as string,
  white: B.colors.light as string,
  ink: B.colors.text_on_accent as string,
  deep: "#043d2d",
};
export const FPS = 30;
const S = (s: number) => Math.round(s * FPS);

// المشاهد على الخط الزمني (ثواني)
export const SCENES = {
  hook: [0, 3.2],
  list1: [3.2, 9.4],
  list2: [9.4, 15.6],
  slogan: [15.6, 18.6],
  cta: [18.6, 23.0],
  sting: [23.0, 25.6],
} as const;
export const TOTAL = S(25.6);

const ease = Easing.out(Easing.cubic);
// دخول feature: انزلاق 60px من اليمين (اتجاه القراءة) + تلاشي، 10 فريمات
const enter = (f: number, at: number, dur = 10) => {
  const p = interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return { opacity: p, transform: `translateX(${(1 - p) * 60}px)` };
};
const leave = (f: number, end: number, dur = 8) =>
  interpolate(f, [end - dur, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const useFonts = () => ({ head: brandFont(B.fonts.heading), body: brandFont(B.fonts.body) });

const Field: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = C.green, children }) => (
  <AbsoluteFill style={{ backgroundColor: color, direction: "rtl" }}>{children}</AbsoluteFill>
);

// شارة صغيرة (خلفية نصية حقيقية مش مستطيل ورا نص)
const Chip: React.FC<{ text: string; bg: string; fg: string; font: string; size?: number; style?: React.CSSProperties }> = ({ text, bg, fg, font, size = 40, style }) => (
  <span style={{ display: "inline-block", background: bg, color: fg, fontFamily: font, fontWeight: 800, fontSize: size,
    padding: "4px 30px 10px", borderRadius: 999, lineHeight: 1.3, ...style }}>{text}</span>
);

const Logo: React.FC<{ white?: boolean; size: number; style?: React.CSSProperties }> = ({ white = true, size, style }) => (
  <Img src={staticFile(`brands/aleef/${white ? "logo-white.png" : "logo-transparent.png"}`)} style={{ width: size, ...style }} />
);

// زوايا تركيز (focus brackets) بتسكّر على العنصر
const Brackets: React.FC<{ p: number; w: number; h: number; color: string }> = ({ p, w, h, color }) => {
  const g = (1 - p) * 40, L = 46, T = 7;
  const c = (s: React.CSSProperties) => <div style={{ position: "absolute", width: L, height: L, borderColor: color, borderStyle: "solid", ...s }} />;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: p, pointerEvents: "none" }}>
      {c({ top: -g, right: -g, borderWidth: `${T}px ${T}px 0 0` })}
      {c({ top: -g, left: -g, borderWidth: `${T}px 0 0 ${T}px` })}
      {c({ bottom: -g, right: -g, borderWidth: `0 ${T}px ${T}px 0` })}
      {c({ bottom: -g, left: -g, borderWidth: `0 0 ${T}px ${T}px` })}
    </div>
  );
};

// ---------- 1. الافتتاح ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame(); const { head } = useFonts(); const end = S(SCENES.hook[1] - SCENES.hook[0]);
  const out = leave(f, end);
  const pulse = 1 + 0.06 * Math.sin(f / 4) * interpolate(f, [0, 30], [1, 0], { extrapolateRight: "clamp" });
  return (
    <Field>
      <AbsoluteFill style={{ opacity: out, alignItems: "center", justifyContent: "center", paddingBottom: 140 }}>
        <div style={{ ...enter(f, 0, 8), transform: `${enter(f, 0, 8).transform} scale(${pulse})`, marginBottom: 46 }}>
          <Chip text="🚨 حالة طارئة" bg="#E5484D" fg={C.white} font={head} size={46} />
        </div>
        <div style={{ ...enter(f, 6), fontFamily: head, fontWeight: 900, fontSize: 128, color: C.white, lineHeight: 1.15 }}>حيوانك بخطر؟</div>
        <div style={{ ...enter(f, 16), fontFamily: head, fontWeight: 800, fontSize: 76, color: C.white, lineHeight: 1.4, marginTop: 26, textAlign: "center" }}>
          متى لازم تجيبه<br />
          <span style={{ display: "inline-block", marginTop: 22, background: C.gold, color: C.ink, padding: "0 30px 12px", borderRadius: 20 }}>للطوارئ فوراً؟</span>
        </div>
      </AbsoluteFill>
    </Field>
  );
};

// ---------- 2 و 3. قوائم العلامات ----------
type Item = { t: string; sub: string; icon: string };
const ICONS: Record<string, string> = {
  blood: "M50 8 C50 8 20 46 20 64 a30 30 0 0 0 60 0 C80 46 50 8 50 8 Z",
  lungs: "M46 14 v34 M54 14 v34 M46 40 C30 30 14 44 14 70 c0 14 8 22 20 18 c8 -3 12 -12 12 -24 Z M54 40 C70 30 86 44 86 70 c0 14 -8 22 -20 18 c-8 -3 -12 -12 -12 -24 Z",
  bolt: "M58 6 L22 56 h24 L40 94 L78 40 h-24 Z",
  pill: "M30 70 L70 30 a14 14 0 0 0 -20 -20 L10 50 a14 14 0 0 0 20 20 Z M40 40 L60 60",
  belly: "M50 12 a38 38 0 1 0 0.1 0 Z M36 50 h28 M50 36 v28",
  drop: "M50 10 C50 10 24 44 24 62 a26 26 0 0 0 52 0 C76 44 50 10 50 10 Z M18 88 L82 24",
};
const Icon: React.FC<{ name: string; color: string; size: number }> = ({ name, color, size }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <path d={ICONS[name]} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SignsList: React.FC<{ title: string; items: Item[]; start: number; first: number }> = ({ title, items, start, first }) => {
  const f = useCurrentFrame(); const { head, body } = useFonts();
  const len = S(SCENES.list1[1] - SCENES.list1[0]); const out = leave(f, len);
  const gap = S(1.15), t0 = S(0.55);
  return (
    <Field>
      <AbsoluteFill style={{ opacity: out, justifyContent: "center", paddingTop: 260, paddingBottom: 380, paddingLeft: 150, paddingRight: 150 }}>
        <div style={{ ...enter(f, 0), display: "flex", alignItems: "center", gap: 22, marginBottom: 54 }}>
          <Chip text={title} bg={C.gold} fg={C.ink} font={head} size={48} />
        </div>
        {items.map((it, i) => {
          const at = t0 + i * gap; const active = f >= at && f < at + gap + (i === items.length - 1 ? len : 0);
          const p = interpolate(f, [at, at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          const bg = active ? C.white : "rgba(255,255,255,0.10)";
          const fg = active ? C.green : C.white;
          return (
            <div key={i} style={{ ...enter(f, at), position: "relative", display: "flex", alignItems: "center", gap: 30,
              background: bg, borderRadius: 34, padding: "26px 34px", marginBottom: 30 }}>
              <div style={{ flex: "none", width: 112, height: 112, borderRadius: 999, background: active ? C.gold : "rgba(230,192,104,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={it.icon} color={active ? C.ink : C.gold} size={66} />
              </div>
              <div>
                <div style={{ fontFamily: head, fontWeight: 900, fontSize: 64, color: fg, lineHeight: 1.25 }}>{it.t}</div>
                <div style={{ fontFamily: body, fontWeight: 600, fontSize: 38, color: active ? C.deep : "rgba(255,255,255,0.75)", lineHeight: 1.35 }}>{it.sub}</div>
              </div>
              <div style={{ position: "absolute", left: 34, top: 26, fontFamily: head, fontWeight: 900, fontSize: 40,
                color: active ? C.gold : "rgba(255,255,255,0.35)" }}>{String(first + i).padStart(2, "0")}</div>
              {active && <Brackets p={p} w={0} h={0} color={C.gold} />}
            </div>
          );
        })}
      </AbsoluteFill>
    </Field>
  );
};

// ---------- 4. الشعار ----------
const Slogan: React.FC = () => {
  const f = useCurrentFrame(); const { head } = useFonts(); const len = S(SCENES.slogan[1] - SCENES.slogan[0]);
  const wipe = interpolate(f, [0, 12], [0, 100], { extrapolateRight: "clamp", easing: ease });
  const out = leave(f, len);
  const tick = (i: number) => {
    const at = 12 + i * 12;
    const p = interpolate(f, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    return { opacity: p, transform: `scale(${1.08 - 0.08 * p})` };
  };
  return (
    <Field>
      <AbsoluteFill style={{ background: C.gold, clipPath: `inset(0 0 0 ${100 - wipe}%)` }} />
      <AbsoluteFill style={{ opacity: out, alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
        <div style={{ ...tick(0), fontFamily: head, fontWeight: 900, fontSize: 150, color: C.green, lineHeight: 1.1 }}>كل دقيقة</div>
        <div style={{ ...tick(1), fontFamily: head, fontWeight: 900, fontSize: 190, color: C.white, lineHeight: 1.2,
          background: C.green, padding: "0 50px 24px", borderRadius: 30, marginTop: 20 }}>بتفرق</div>
        <div style={{ ...tick(2), marginTop: 50 }}>
          <svg width="140" height="140" viewBox="0 0 100 100">
            <circle cx="50" cy="54" r="38" fill="none" stroke={C.green} strokeWidth="8" />
            <path d="M40 6 h20 M50 6 v10" stroke={C.green} strokeWidth="8" strokeLinecap="round" />
            <path d={`M50 54 L${50 + 26 * Math.sin(f / 6)} ${54 - 26 * Math.cos(f / 6)}`} stroke={C.green} strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
      </AbsoluteFill>
    </Field>
  );
};

// ---------- 5. الدعوة للتواصل ----------
const Cta: React.FC = () => {
  const f = useCurrentFrame(); const { head, body } = useFonts(); const len = S(SCENES.cta[1] - SCENES.cta[0]);
  const out = leave(f, len);
  const tapAt = S(1.6);
  const tap = interpolate(f, [tapAt, tapAt + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const press = f >= tapAt && f < tapAt + 6 ? 0.96 : 1;
  const br = interpolate(f, [S(1.0), S(1.0) + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <Field>
      <AbsoluteFill style={{ opacity: out, alignItems: "center", justifyContent: "center", paddingBottom: 160 }}>
        <div style={{ ...enter(f, 0), fontFamily: head, fontWeight: 900, fontSize: 92, color: C.white, lineHeight: 1.2 }}>لاحظت أي علامة؟</div>
        <div style={{ ...enter(f, 8), fontFamily: body, fontWeight: 700, fontSize: 52, color: C.gold, marginTop: 14 }}>نستقبل الحالات الطارئة دايماً</div>
        <div style={{ ...enter(f, 18), position: "relative", marginTop: 70, transform: `${enter(f, 18).transform} scale(${press})` }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, background: C.white, borderRadius: 999,
            padding: "22px 44px 22px 30px", boxShadow: `0 0 0 10px ${C.gold}` }}>
            <div style={{ width: 96, height: 96, borderRadius: 999, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="54" height="54" viewBox="0 0 24 24"><path fill={C.green} d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>
            </div>
            <div style={{ fontFamily: head, fontWeight: 900, fontSize: 70, color: C.green, direction: "ltr" }}>+970 569 003 976</div>
            {tap > 0 && tap < 1 && <div style={{ position: "absolute", right: 98, top: "50%", width: 40, height: 40, marginTop: -20, marginRight: -20,
              borderRadius: 999, border: `6px solid ${C.gold}`, transform: `scale(${1 + tap * 5})`, opacity: 1 - tap }} />}
          </div>
          <Brackets p={br} w={0} h={0} color={C.white} />
        </div>
        <div style={{ ...enter(f, 30), fontFamily: body, fontWeight: 700, fontSize: 44, color: C.white, marginTop: 70, opacity: 0.92 * enter(f, 30).opacity }}>
          📍 مركز أليف البيطري • عزون، وسط البلد
        </div>
      </AbsoluteFill>
    </Field>
  );
};

// ---------- 6. ختام اللوغو ----------
const Sting: React.FC = () => {
  const f = useCurrentFrame(); const { body } = useFonts();
  const p = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: ease });
  return (
    <Field>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
        <Logo size={420} style={{ opacity: p, transform: `scale(${0.92 + 0.08 * p})` }} />
        <div style={{ ...enter(f, 12), fontFamily: body, fontWeight: 700, fontSize: 50, color: C.gold, marginTop: 40 }}>رعاية متكاملة لحياة صحية</div>
      </AbsoluteFill>
    </Field>
  );
};

// شعار صغير بالزاوية طول الفيديو (إلا بالختام وبمشهد الذهبي)
const Corner: React.FC = () => {
  const f = useCurrentFrame();
  const hide = (f >= S(SCENES.slogan[0]) && f < S(SCENES.slogan[1])) || f >= S(SCENES.sting[0]);
  return hide ? null : <Logo size={120} style={{ position: "absolute", top: 250, left: 80, opacity: 0.9 }} />;
};

const seq = (k: keyof typeof SCENES) => ({ from: S(SCENES[k][0]), durationInFrames: S(SCENES[k][1]) - S(SCENES[k][0]) });

export const Emergency: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.green }}>
    <Sequence {...seq("hook")}><Hook /></Sequence>
    <Sequence {...seq("list1")}>
      <SignsList title="علامات خطر ⚠️" first={1} start={0} items={[
        { t: "نزيف ما بيوقف", sub: "حتى بعد الضغط على الجرح", icon: "blood" },
        { t: "صعوبة بالتنفس", sub: "تنفس سريع أو من التم", icon: "lungs" },
        { t: "تشنجات أو إغماء", sub: "رجفة قوية أو فقدان وعي", icon: "bolt" },
      ]} />
    </Sequence>
    <Sequence {...seq("list2")}>
      <SignsList title="وكمان ⚠️" first={4} start={0} items={[
        { t: "بلع سم أو دوا", sub: "سم فئران، مبيد، أو دوا بشري", icon: "pill" },
        { t: "بطن منفوخ وقاسي", sub: "مع محاولة استفراغ بدون نتيجة", icon: "belly" },
        { t: "ما بيقدر يبول", sub: "بيحاول وما بنزل شي", icon: "drop" },
      ]} />
    </Sequence>
    <Sequence {...seq("slogan")}><Slogan /></Sequence>
    <Sequence {...seq("cta")}><Cta /></Sequence>
    <Sequence {...seq("sting")}><Sting /></Sequence>
    <Corner />
  </AbsoluteFill>
);
