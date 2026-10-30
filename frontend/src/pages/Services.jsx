import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Camera,
  Check,
  ChevronDown,
  CircuitBoard,
  Droplets,
  Fingerprint,
  Grid2X2,
  House,
  MonitorSmartphone,
  PlugZap,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Volume2,
  Wifi,
  Wrench,
  X,
  Zap,
  Settings2,
  Power,
  Tablet,
  MessageCircle,
} from "lucide-react";
import "../styles/Services.css";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// SERVICE PHOTOS
// ==========================================

const servicePhotos = {
  display:
    "https://images.unsplash.com/photo-1746006084491-95423925b699?auto=format&fit=crop&w=920&h=600&q=82",
  touch:
    "https://images.unsplash.com/photo-1731391747629-fbcba9014453?auto=format&fit=crop&w=920&h=600&q=82",
  "display-lines":
    "https://images.unsplash.com/photo-1746006084492-24a8fd02710a?auto=format&fit=crop&w=920&h=600&q=82",
  battery:
    "https://images.unsplash.com/photo-1776107483944-a4dc59c3fcd3?auto=format&fit=crop&w=920&h=600&q=82",
  "battery-drain":
    "https://images.unsplash.com/photo-1607027340685-3e1ae9a54a93?auto=format&fit=crop&w=920&h=600&q=82",
  "rear-camera":
    "https://images.unsplash.com/photo-1776107477726-96bacb852f7b?auto=format&fit=crop&w=920&h=600&q=82",
  "front-camera":
    "https://images.unsplash.com/photo-1768228102831-9409732c9f62?auto=format&fit=crop&w=920&h=600&q=82",
  "camera-glass":
    "https://images.unsplash.com/photo-1775839700200-804627f67c66?auto=format&fit=crop&w=920&h=600&q=82",
  "charging-port":
    "https://images.unsplash.com/photo-1724322664367-5cc0f47b5d9d?auto=format&fit=crop&w=920&h=600&q=82",
  "charging-ic":
    "https://images.unsplash.com/photo-1746005514009-892e6105fb5f?auto=format&fit=crop&w=920&h=600&q=82",
  "no-power":
    "https://images.unsplash.com/photo-1746005514014-2637647a26ee?auto=format&fit=crop&w=920&h=600&q=82",
  earpiece:
    "https://images.unsplash.com/photo-1697120168267-aa1167eb73c9?auto=format&fit=crop&w=920&h=600&q=82",
  loudspeaker:
    "https://images.unsplash.com/photo-1700805810965-bfea8f8109ad?auto=format&fit=crop&w=920&h=600&q=82",
  microphone:
    "https://images.unsplash.com/photo-1769763227060-726b7b926bf2?auto=format&fit=crop&w=920&h=600&q=82",
  "power-button":
    "https://images.unsplash.com/photo-1724323192353-f80f38e91b9d?auto=format&fit=crop&w=920&h=600&q=82",
  "volume-buttons":
    "https://images.unsplash.com/photo-1709178295004-893b38ec2a4b?auto=format&fit=crop&w=920&h=600&q=82",
  "back-panel":
    "https://images.unsplash.com/photo-1675246286211-14684dea99c6?auto=format&fit=crop&w=920&h=600&q=82",
  frame:
    "https://images.unsplash.com/photo-1692729928780-dc35089aaaa1?auto=format&fit=crop&w=920&h=600&q=82",
  software:
    "https://images.unsplash.com/photo-1772182125359-e472ca9b27c2?auto=format&fit=crop&w=920&h=600&q=82",
  "system-update":
    "https://images.unsplash.com/photo-1772683828867-197c7de098b0?auto=format&fit=crop&w=920&h=600&q=82",
  data: "https://images.unsplash.com/photo-1746005514009-48ac6c7fe300?auto=format&fit=crop&w=920&h=600&q=82",
  network:
    "https://images.unsplash.com/photo-1561474119-1b76f3a79816?auto=format&fit=crop&w=920&h=600&q=82",
  wifi: "https://images.unsplash.com/photo-1755182334060-1578c6cac201?auto=format&fit=crop&w=920&h=600&q=82",
  water:
    "https://images.unsplash.com/photo-1505616784093-32fb4f9b1bf7?auto=format&fit=crop&w=920&h=600&q=82",
  motherboard:
    "https://images.unsplash.com/photo-1672165407773-20262ff6ab13?auto=format&fit=crop&w=920&h=600&q=82",
  "board-component":
    "https://images.unsplash.com/photo-1687468047998-75435bdfd132?auto=format&fit=crop&w=920&h=600&q=82",
  fingerprint:
    "https://images.unsplash.com/photo-1676139033943-9b2eedde56d2?auto=format&fit=crop&w=920&h=600&q=82",
  face: "https://images.unsplash.com/photo-1761906975713-326457551c3a?auto=format&fit=crop&w=920&h=600&q=82",
  proximity:
    "https://images.unsplash.com/photo-1764050200027-c502a0eca0a4?auto=format&fit=crop&w=920&h=600&q=82",
  sim: "https://images.unsplash.com/photo-1766241632296-aebf4c0c3a27?auto=format&fit=crop&w=920&h=600&q=82",
  "sim-tray":
    "https://images.unsplash.com/photo-1676315487585-ccddc7934f50?auto=format&fit=crop&w=920&h=600&q=82",
  vibration:
    "https://images.unsplash.com/photo-1746005718015-a59f6fde6c65?auto=format&fit=crop&w=920&h=600&q=82",
  overheating:
    "https://images.unsplash.com/photo-1521372557841-004496c23b26?auto=format&fit=crop&w=920&h=600&q=82",
  other:
    "https://images.unsplash.com/photo-1746005847013-13291f371f0f?auto=format&fit=crop&w=920&h=600&q=82",
};

// ==========================================
// SERVICE CATEGORIES
// ==========================================

const categories = [
  { name: "All Services", icon: Grid2X2 },
  { name: "Display & Screen", icon: MonitorSmartphone },
  { name: "Battery", icon: BatteryCharging },
  { name: "Camera", icon: Camera },
  { name: "Charging & Power", icon: PlugZap },
  { name: "Audio", icon: Volume2 },
  { name: "Buttons & Keys", icon: Power },
  { name: "Body & Back Panel", icon: Smartphone },
  { name: "Software", icon: Settings2 },
  { name: "Network & Connectivity", icon: Wifi },
  { name: "Water Damage", icon: Droplets },
  { name: "Motherboard", icon: CircuitBoard },
  { name: "Sensors", icon: Fingerprint },
  { name: "SIM & Card Slot", icon: Tablet },
  { name: "Vibration", icon: Zap },
  { name: "Other Repairs", icon: Wrench },
];

// ==========================================
// ALL 34 REPAIR SERVICES
// ==========================================

const services = [
  [
    "display",
    "Display Replacement",
    "Display & Screen",
    "Broken or black screen? Screen replacement and testing.",
  ],
  [
    "touch",
    "Touchscreen Repair",
    "Display & Screen",
    "Ghost touch, dead touch areas or an unresponsive screen.",
  ],
  [
    "display-lines",
    "Display Lines & Flicker",
    "Display & Screen",
    "Diagnose flickering, green lines and display faults.",
  ],
  [
    "battery",
    "Battery Replacement",
    "Battery",
    "Fast battery drain, swelling or reduced battery backup.",
  ],
  [
    "battery-drain",
    "Battery Drain Diagnosis",
    "Battery",
    "Unusual overnight drain and battery health checks.",
  ],
  [
    "rear-camera",
    "Rear Camera Repair",
    "Camera",
    "Blurry photos, focus problems or failed rear camera.",
  ],
  [
    "front-camera",
    "Front Camera Repair",
    "Camera",
    "Selfie camera not working or showing a black screen.",
  ],
  [
    "camera-glass",
    "Camera Lens Glass",
    "Camera",
    "Scratched or cracked outer camera lens glass.",
  ],
  [
    "charging-port",
    "Charging Port Repair",
    "Charging & Power",
    "Loose connector, broken port or interrupted charging.",
  ],
  [
    "charging-ic",
    "Charging IC Diagnosis",
    "Charging & Power",
    "Charging circuit and power input fault diagnosis.",
  ],
  [
    "no-power",
    "Phone Not Turning On",
    "Charging & Power",
    "Dead phone, boot failure or no-power diagnosis.",
  ],
  [
    "earpiece",
    "Earpiece Repair",
    "Audio",
    "Call audio low, distorted or not working.",
  ],
  [
    "loudspeaker",
    "Speaker Repair",
    "Audio",
    "Low ringtone, crackling sound or speaker failure.",
  ],
  [
    "microphone",
    "Microphone Repair",
    "Audio",
    "People cannot hear you on calls or voice recordings.",
  ],
  [
    "power-button",
    "Power Button Repair",
    "Buttons & Keys",
    "Stuck, damaged or unresponsive power button.",
  ],
  [
    "volume-buttons",
    "Volume Button Repair",
    "Buttons & Keys",
    "Broken volume rocker or unresponsive keys.",
  ],
  [
    "back-panel",
    "Back Panel Replacement",
    "Body & Back Panel",
    "Cracked back cover or damaged glass panel.",
  ],
  [
    "frame",
    "Frame & Housing Repair",
    "Body & Back Panel",
    "Bent frame, housing damage or loose fittings.",
  ],
  [
    "software",
    "Software Troubleshooting",
    "Software",
    "Crashes, glitches, lagging and app issues.",
  ],
  [
    "system-update",
    "OS Update & Restore",
    "Software",
    "Update issues, boot loops and software restoration.",
  ],
  [
    "data",
    "Data Backup Assistance",
    "Software",
    "Help with backup, transfer and recovery assessment.",
  ],
  [
    "network",
    "Network & Signal Repair",
    "Network & Connectivity",
    "No network, weak signal and calling problems.",
  ],
  [
    "wifi",
    "Wi-Fi & Bluetooth Repair",
    "Network & Connectivity",
    "Wi-Fi, hotspot or Bluetooth not connecting.",
  ],
  [
    "water",
    "Water Damage Treatment",
    "Water Damage",
    "Liquid exposure inspection and corrosion treatment.",
  ],
  [
    "motherboard",
    "Motherboard Repair",
    "Motherboard",
    "Board-level repair assessment and faulty circuits.",
  ],
  [
    "board-component",
    "IC & Component Repair",
    "Motherboard",
    "Diagnosis of damaged connectors, ICs and micro-parts.",
  ],
  [
    "fingerprint",
    "Fingerprint Sensor Repair",
    "Sensors",
    "Fingerprint unlock not detecting your finger.",
  ],
  [
    "face",
    "Face Unlock & Sensors",
    "Sensors",
    "Face recognition, proximity and other sensor problems.",
  ],
  [
    "proximity",
    "Proximity Sensor Repair",
    "Sensors",
    "Screen not turning off during calls.",
  ],
  [
    "sim",
    "SIM Slot Repair",
    "SIM & Card Slot",
    "SIM not detected or a damaged SIM connector.",
  ],
  [
    "sim-tray",
    "SIM Tray Replacement",
    "SIM & Card Slot",
    "Lost, stuck or bent SIM tray.",
  ],
  [
    "vibration",
    "Vibration Motor Repair",
    "Vibration",
    "Phone not vibrating during calls or alerts.",
  ],
  [
    "overheating",
    "Overheating Diagnosis",
    "Other Repairs",
    "Unusual phone heating or thermal shutdowns.",
  ],
  [
    "other",
    "Other Mobile Repairs",
    "Other Repairs",
    "Tell us your phone issue for a custom assessment.",
  ],
].map(([id, name, category, description]) => ({
  id,
  name,
  category,
  description,
  image: servicePhotos[id],
}));

// ==========================================
// PHONE BRAND AND MODEL CATALOGUE
// Brand and model names are stored separately.
// ==========================================

const phoneModels = {
  Apple: `
iPhone 17 Pro Max
iPhone 17 Pro
iPhone 17
iPhone Air
iPhone 16 Pro Max
iPhone 16 Pro
iPhone 16 Plus
iPhone 16
iPhone 16e
iPhone 15 Pro Max
iPhone 15 Pro
iPhone 15 Plus
iPhone 15
iPhone 14 Pro Max
iPhone 14 Pro
iPhone 14 Plus
iPhone 14
iPhone SE (2022)
iPhone 13 Pro Max
iPhone 13 Pro
iPhone 13
iPhone 13 mini
iPhone 12 Pro Max
iPhone 12 Pro
iPhone 12
iPhone 12 mini
iPhone SE (2020)
iPhone 11 Pro Max
iPhone 11 Pro
iPhone 11
iPhone XS Max
iPhone XS
iPhone XR
`,

  Samsung: `
Galaxy S26 Ultra
Galaxy S26+
Galaxy S26
Galaxy Z Fold7
Galaxy Z Flip7
Galaxy Z Flip7 FE
Galaxy S25 Ultra
Galaxy S25+
Galaxy S25
Galaxy Z Fold6
Galaxy Z Flip6
Galaxy S24 Ultra
Galaxy S24+
Galaxy S24
Galaxy Z Fold5
Galaxy Z Flip5
Galaxy S23 Ultra
Galaxy S23+
Galaxy S23
Galaxy Z Fold4
Galaxy Z Flip4
Galaxy S22 Ultra
Galaxy S22+
Galaxy S22
Galaxy Z Fold3
Galaxy Z Flip3
Galaxy S21 Ultra
Galaxy S21+
Galaxy S21
Galaxy S20 Ultra
Galaxy S20+
Galaxy S20
Galaxy A56 5G
Galaxy A55 5G
Galaxy A54 5G
Galaxy A53 5G
Galaxy A52s 5G
Galaxy A52
Galaxy A35 5G
Galaxy A25 5G
Galaxy A16
Galaxy A15
Galaxy A14 5G
Galaxy A08
Galaxy A05s
Galaxy A05
Galaxy F70 5G
Galaxy F36 5G
Galaxy F55 5G
Galaxy F34 5G
Galaxy F15 5G
Galaxy M55 5G
Galaxy M35 5G
Galaxy M34 5G
Galaxy M33 5G
Galaxy M31
Galaxy Note20 Ultra
Galaxy Note20
Galaxy Note10+
Galaxy Note10
`,

  OnePlus: `
OnePlus 15
OnePlus 13
OnePlus 13R
OnePlus 12
OnePlus 12R
OnePlus 11
OnePlus 11R
OnePlus 10T
OnePlus 10 Pro
OnePlus 10R
OnePlus 9 Pro
OnePlus 9
OnePlus 9R
OnePlus 8 Pro
OnePlus 8T
OnePlus 8
OnePlus 7T Pro
OnePlus 7T
OnePlus 7 Pro
OnePlus 7
OnePlus Nord 5
OnePlus Nord CE5
OnePlus Nord 4
OnePlus Nord CE4
OnePlus Nord CE4 Lite
OnePlus Nord 3
OnePlus Nord CE3
OnePlus Nord CE3 Lite
OnePlus Nord 2T
OnePlus Nord 2
OnePlus Nord CE2
OnePlus Nord CE2 Lite
OnePlus Nord
`,

  Xiaomi: `
Xiaomi 17 Ultra
Xiaomi 17
Xiaomi 15 Ultra
Xiaomi 15
Xiaomi 14 Ultra
Xiaomi 14
Xiaomi 13 Pro
Xiaomi 12 Pro
Xiaomi 11T Pro
Mi 11 Ultra
Mi 11X Pro
Mi 11X
Mi 10T Pro
Mi 10T
Mi 10
`,

  Redmi: `
Redmi 17C 5G
Redmi Note 15 Pro+
Redmi Note 15 Pro
Redmi Note 15
Redmi Note 14 Pro+ 5G
Redmi Note 14 Pro 5G
Redmi Note 14 5G
Redmi 14C
Redmi 13 5G
Redmi 13C
Redmi 12
Redmi Note 13 Pro+ 5G
Redmi Note 13 Pro 5G
Redmi Note 13 5G
Redmi Note 12 Pro+ 5G
Redmi Note 12 Pro 5G
Redmi Note 12 5G
Redmi Note 11 Pro+
Redmi Note 11
Redmi Note 10 Pro Max
Redmi Note 10 Pro
Redmi Note 10
Redmi 10 Power
Redmi 10A
Redmi 10
Redmi 9 Power
Redmi 9A
Redmi 9
Redmi 8A
Redmi 8
Redmi 7A
Redmi 7
`,

  POCO: `
POCO X8 Pro
POCO X8 5G
POCO F7
POCO F6
POCO F6 Pro
POCO X6 Pro 5G
POCO X6 5G
POCO M6 Pro
POCO M6 5G
POCO F5 Pro
POCO F5
POCO X5 Pro 5G
POCO X5 5G
POCO F4
POCO X4 Pro 5G
POCO M4 Pro
POCO M3
POCO X3 Pro
POCO X3
POCO M2 Pro
POCO M2
POCO X2
POCO F1
`,

  Vivo: `
Vivo X Fold6
Vivo V80
Vivo V80
Vivo S2 FE 5G
Vivo X200 FE
Vivo X200
Vivo X100
Vivo X90
Vivo X80
Vivo X70 Pro
Vivo X60
Vivo X50
Vivo V40 Pro
Vivo V40
Vivo V30
Vivo V29
Vivo V27
Vivo V25 Pro
Vivo V23 5G
Vivo V21 5G
Vivo V20
Vivo V19
Vivo V17 Pro
Vivo V15 Pro
Vivo V11 Pro
Vivo V9
Vivo Y200
Vivo Y100
Vivo Y56 5G
Vivo Y35
Vivo Y33s
Vivo Y28
Vivo Y21
Vivo Y20
`,

  OPPO: `
OPPO Find X10 Pro Max
OPPO Find X10
OPPO F35 Pro
OPPO F35
OPPO Find X8
OPPO Reno14 Pro
OPPO Reno14
OPPO Reno13
OPPO Reno12
OPPO Reno11
OPPO Reno10 Pro
OPPO Reno8 Pro
OPPO Reno7 Pro
OPPO Reno6 Pro
OPPO Reno5 Pro
OPPO Reno4 Pro
OPPO Reno3 Pro
OPPO Reno2
OPPO Find X5 Pro
OPPO Find X2
OPPO F27 Pro+
OPPO F25 Pro
OPPO F23 5G
OPPO F21 Pro
OPPO F19 Pro
OPPO F17 Pro
OPPO F15
OPPO F11 Pro
OPPO F9 Pro
OPPO F7
OPPO A5 Pro
OPPO A3x
`,

  Realme: `
Realme 16 Pro+
Realme 16 Pro
Realme 16
Realme 15 Pro
Realme 15
Realme 14 Pro+
Realme 14 Pro
Realme 13 Pro+
Realme 13 Pro
Realme 12 Pro+
Realme 12 Pro
Realme 11 Pro+
Realme 10 Pro+
Realme 9 Pro+
Realme 8 Pro
Realme 7 Pro
Realme 6 Pro
Realme 5 Pro
Realme 3 Pro
Realme GT 7 Pro
Realme GT 6
Realme GT Neo 3
Realme GT 2 Pro
Realme Narzo 80 Lite
Realme Narzo 70 Pro
Realme Narzo 60 Pro
Realme Narzo 50 Pro
Realme Narzo 30 Pro
Realme Narzo 20 Pro
Realme C71
Realme C65 5G
Realme C55
Realme C35
Realme C33
Realme C30
Realme C25
Realme C21
Realme C15
Realme C11
`,

  Google: `
Google Pixel 10 Pro XL
Google Pixel 10 Pro
Google Pixel 10
Google Pixel 9 Pro XL
Google Pixel 9 Pro
Google Pixel 9a
Google Pixel 9
Google Pixel 8 Pro
Google Pixel 8a
Google Pixel 8
Google Pixel 7 Pro
Google Pixel 7a
Google Pixel 7
Google Pixel 6 Pro
Google Pixel 6a
Google Pixel 6
Google Pixel 5
Google Pixel 4a
Google Pixel 4
Google Pixel 3a
Google Pixel 3 XL
Google Pixel 3
`,

  Motorola: `
Motorola Edge 70 Fusion
Moto G96 5G
Moto G85 5G
Moto G84 5G
Moto G73 5G
Moto G62 5G
Moto G52
Moto G45 5G
Moto G34 5G
Moto G40 Fusion
Motorola Edge 50 Ultra
Motorola Edge 50 Pro
Motorola Edge 50 Fusion
Motorola Edge 40 Neo
Motorola Edge 30
Motorola Edge 20
Motorola Razr 60 Ultra
Motorola Razr 60
Motorola Razr 50 Ultra
Motorola Razr 50
Motorola Razr 40 Ultra
Motorola Razr 40
`,

  Nothing: `
Nothing Phone (3)
Nothing Phone (3a) Pro
Nothing Phone (3a)
Nothing Phone (2a) Plus
Nothing Phone (2a)
Nothing Phone (2)
Nothing Phone (1)
`,

  iQOO: `
iQOO 15
iQOO 13
iQOO 12
iQOO 11
iQOO 9 Pro
iQOO 9
iQOO 9 SE
iQOO 7 Legend
iQOO 7
iQOO 3
iQOO Neo 10
iQOO Neo 9 Pro
iQOO Neo 7 Pro
iQOO Neo 7
iQOO Neo 6
iQOO Z10R
iQOO Z9
iQOO Z9x
iQOO Z7
iQOO Z6
iQOO Z5
iQOO Z3
`,

  Infinix: `
Infinix GT 50 Pro
Infinix Hot 70 Pro
Infinix GT 20 Pro
Infinix GT 10 Pro
Infinix Zero 40
Infinix Zero 30
Infinix Zero 5G
Infinix Note 40 Pro
Infinix Note 40
Infinix Note 30
Infinix Note 12
Infinix Note 10 Pro
Infinix Hot 60 5G+
Infinix Hot 40i
Infinix Hot 30
Infinix Hot 12
Infinix Hot 11
Infinix Hot 10
`,

  Tecno: `
Tecno Spark 50s 5G
Tecno Pova 7 Pro
Tecno Pova 7
Tecno Phantom V Flip2
Tecno Phantom X2
Tecno Camon 30 Pro
Tecno Camon 30
Tecno Camon 20 Pro
Tecno Camon 19 Pro
Tecno Camon 18
Tecno Camon 17
Tecno Camon 16
Tecno Camon 15
Tecno Spark 20
Tecno Spark 10
Tecno Spark 8
Tecno Spark 6
Tecno Pova 6 Pro
Tecno Pova 5 Pro
Tecno Pova 2
`,

  Huawei: `
Huawei P40 Pro
Huawei P30 Pro
Huawei P20 Pro
Huawei Mate 40 Pro
Huawei Mate 30 Pro
Huawei Mate 20 Pro
Huawei Nova 5T
Huawei Nova 3
`,

  Sony: `
Sony Xperia 1 VI
Sony Xperia 1 V
Sony Xperia 1 IV
Sony Xperia 1 III
Sony Xperia 1 II
Sony Xperia 1
Sony Xperia 5 V
Sony Xperia 5 IV
Sony Xperia 5 III
Sony Xperia 5 II
Sony Xperia 10 VI
Sony Xperia 10 V
Sony Xperia 10 IV
`,

  ASUS: `
ASUS Zenfone 11 Ultra
ASUS Zenfone 10
ASUS Zenfone 9
ASUS Zenfone 8
ASUS Zenfone 7
ASUS Zenfone 6
ASUS ROG Phone 8
ASUS ROG Phone 7
ASUS ROG Phone 6
ASUS ROG Phone 5
ASUS ROG Phone 3
ASUS ROG Phone 2
`,

  Nokia: `
Nokia X30 5G
Nokia X20
Nokia G60 5G
Nokia G42 5G
Nokia G21
Nokia G20
Nokia G10
Nokia 8.3 5G
Nokia 7.2
Nokia 6.1 Plus
Nokia 5.4
Nokia 5.3
`,

  Lenovo: `
Lenovo Legion Phone Duel 2
Lenovo Legion Phone Duel
Lenovo Z5 Pro GT
Lenovo K9
Lenovo K8 Note
`,

  Lava: `
Lava Aura Curve
Lava Shark 2 Pro 5G
Lava Agni 3
Lava Agni 2 5G
Lava Blaze Dragon
Lava Blaze Curve 5G
Lava Blaze 5G
Lava Blaze Pro
Lava Blaze 2
Lava Yuva 3
Lava Z4
Lava Z2
`,

  Itel: `
Itel City 300 5G
Itel Zeno 300
Itel Zeno 100 Lite
Itel A80
Itel S24
Itel S23
Itel P55 5G
Itel P40
Itel A70
`,

  HONOR: `
HONOR Magic Series
HONOR Number Series
HONOR X Series
HONOR Other Model
`,
};

// Convert the phone catalogue into searchable options.
const phoneOptions = Object.entries(phoneModels).flatMap(([brand, modelText]) =>
  modelText
    .trim()
    .split("\n")
    .map((model) => model.trim())
    .filter(Boolean)
    .map((model) => ({
      brand,
      model,
      label: `${brand} — ${model}`,
    })),
);

// ==========================================
// BOOKING LINK
// ==========================================

function bookingLink(service, brand, model, otherModel) {
  const params = new URLSearchParams({ service: service.name });

  if (brand) params.set("brand", brand);

  if (model) params.set("model", model);

  if (otherModel.trim()) {
    params.set("otherModel", otherModel.trim());
  }

  return `/book-repair?${params.toString()}`;
}

// ==========================================
// SERVICE CARD
// ==========================================

function ServiceCard({ service, brand, model, otherModel }) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="svc-card">
      <div className="svc-card__photo">
        {!failed ? (
          <img
            src={service.image}
            alt={`${service.name} repair reference photo`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="svc-card__fallback">
            <Wrench size={42} />
          </div>
        )}
      </div>

      <div className="svc-card__body">
        <h3>{service.name}</h3>
        <p>{service.description}</p>

        <Link
          className="svc-card__button"
          to={bookingLink(service, brand, model, otherModel)}
        >
          Book Repair <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

// ==========================================
// SERVICES PAGE
// ==========================================

export default function Services() {
  const rootRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Services");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [otherModel, setOtherModel] = useState("");

  const [phoneSearch, setPhoneSearch] = useState("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  // ==========================================
  // PHONE SEARCH
  // ==========================================

  const handlePhoneSearch = (value) => {
    setPhoneSearch(value);
    setOtherModel("");

    const selectedPhone = phoneOptions.find(
      (phone) => phone.label.toLowerCase() === value.trim().toLowerCase(),
    );

    if (selectedPhone) {
      setBrand(selectedPhone.brand);
      setModel(selectedPhone.model);
    } else {
      setBrand("");
      setModel("");
    }
  };

  const clearPhoneSearch = () => {
    setPhoneSearch("");
    setBrand("");
    setModel("");
    setOtherModel("");
  };

  // ==========================================
  // FILTER SERVICES
  // ==========================================

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return services.filter((item) => {
      const matchesCategory =
        category === "All Services" || item.category === category;

      const haystack =
        `${item.name} ${item.description} ${item.category}`.toLowerCase();

      return matchesCategory && (!term || haystack.includes(term));
    });
  }, [category, query]);

  // ==========================================
  // GSAP ANIMATIONS
  // ==========================================

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(".svc-hero__text > *", {
        y: 28,
        opacity: 0,
        stagger: 0.09,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".svc-hero__visual", {
        x: 46,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
      });

      gsap.from(".svc-filterbar", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        delay: 0.25,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => cancelAnimationFrame(frame);
  }, [filtered.length]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearchText("");
    setQuery("");
    setCategory("All Services");
    clearPhoneSearch();
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="svc-page" ref={rootRef}>
      {/* EXISTING NAVBAR IS ALREADY RENDERED IN APP.JSX */}

      <section className="svc-hero" aria-labelledby="svc-title">
        <div className="svc-wrap svc-hero__layout">
          <div className="svc-hero__text">
            <span className="svc-kicker">
              <Wrench size={14} /> OUR SERVICES
            </span>

            <h1 id="svc-title">
              Complete Mobile <span>Repair Services</span>
            </h1>

            <p>
              From cracked screens to motherboard problems, find professional
              mobile repair options with convenient doorstep pickup, repair and
              return.
            </p>

            <div className="svc-hero__perks">
              <div>
                <ShieldCheck />
                <span>
                  <b>Original Part Options</b>
                  <small>Subject to device availability</small>
                </span>
              </div>

              <div>
                <Wrench />
                <span>
                  <b>Skilled Technicians</b>
                  <small>Careful diagnosis</small>
                </span>
              </div>

              <div>
                <House />
                <span>
                  <b>Doorstep Service</b>
                  <small>Pickup, repair & return</small>
                </span>
              </div>

              <div>
                <Check />
                <span>
                  <b>Clear Quotations</b>
                  <small>Before work begins</small>
                </span>
              </div>
            </div>
          </div>

          <div className="svc-hero__visual" aria-hidden="true">
            <span className="svc-hero__halo" />

            <img
              className="svc-hero__phone svc-hero__phone--back"
              src={servicePhotos["rear-camera"]}
              alt=""
            />

            <img
              className="svc-hero__phone svc-hero__phone--front"
              src={servicePhotos.display}
              alt=""
            />

            <div className="svc-hero__seal">
              <ShieldCheck size={27} />
              <b>ORIGINAL PARTS</b>
              <small>Where available</small>
            </div>
          </div>
        </div>
      </section>

      <div className="svc-wrap">
        {/* ======================================
            SEARCH AND PHONE SELECTOR
        ====================================== */}

        <form
          className="svc-filterbar"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(searchText);
          }}
        >
          <label className="svc-search">
            <Search size={21} />

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search a repair (display, battery, camera...)"
              aria-label="Search repair services"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setQuery("");
                }}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </label>

          {/* ONE SEARCHABLE BRAND + MODEL SELECTOR */}

          <div className="svc-select-wrap svc-phone-select">
            <input
              type="text"
              list="svc-phone-options"
              className="svc-phone-search"
              value={phoneSearch}
              onChange={(event) => handlePhoneSearch(event.target.value)}
              placeholder="Search brand or phone model..."
              aria-label="Search and select phone brand and model"
              autoComplete="off"
            />

            <datalist id="svc-phone-options">
              {phoneOptions.map((phone) => (
                <option key={phone.label} value={phone.label} />
              ))}
            </datalist>

            {phoneSearch && (
              <button
                type="button"
                className="svc-phone-clear"
                onClick={clearPhoneSearch}
                aria-label="Clear selected phone"
              >
                <X size={16} />
              </button>
            )}

            {!phoneSearch && <ChevronDown size={17} />}
          </div>

          <button type="submit" className="svc-filterbar__submit">
            Search <ArrowRight size={17} />
          </button>
        </form>

        {/* ======================================
            SERVICE CATALOGUE
        ====================================== */}

        <div className="svc-catalog">
          <aside className="svc-sidebar" aria-label="Service categories">
            <h2>Service Categories</h2>

            <button
              type="button"
              className="svc-sidebar__mobile-toggle"
              onClick={() => setCategoryMenuOpen((value) => !value)}
              aria-expanded={categoryMenuOpen}
            >
              {category} <ChevronDown size={18} />
            </button>

            <div
              className={`svc-sidebar__items ${
                categoryMenuOpen ? "svc-sidebar__items--open" : ""
              }`}
            >
              {categories.map(({ name, icon: Icon }) => (
                <button
                  type="button"
                  key={name}
                  className={`svc-sidebar__item ${
                    category === name ? "svc-sidebar__item--active" : ""
                  }`}
                  onClick={() => {
                    setCategory(name);
                    setCategoryMenuOpen(false);
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="svc-results" aria-labelledby="svc-results-title">
            <div className="svc-results__heading">
              <div>
                <span className="svc-kicker svc-kicker--small">
                  <Sparkles size={13} /> ALL REPAIR OPTIONS
                </span>

                <h2 id="svc-results-title">
                  All Mobile <span>Repair Services</span>
                </h2>
              </div>

              <div className="svc-results__counter">
                {filtered.length}{" "}
                {filtered.length === 1 ? "service" : "services"} available
              </div>
            </div>

            {filtered.length ? (
              <div className="svc-grid">
                {filtered.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    brand={brand}
                    model={model}
                    otherModel={otherModel}
                  />
                ))}
              </div>
            ) : (
              <div className="svc-empty">
                <Search size={40} />
                <h3>No matching repair found</h3>
                <p>Try a different search or choose All Services.</p>

                <button type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>

        {/* ======================================
            SERVICE NOTE
        ====================================== */}

        <section className="svc-note">
          <ShieldCheck size={22} />

          <p>
            <strong>Parts & warranty:</strong> Original manufacturer parts can
            be requested where available. Exact part type, availability, cost,
            repair eligibility and any warranty will be confirmed before
            service. We are not claiming manufacturer-authorized service.
          </p>
        </section>

        {/* ======================================
            CALL TO ACTION
        ====================================== */}

        <section className="svc-cta">
          <div className="svc-cta__icon">
            <MessageCircle size={28} />
          </div>

          <div>
            <span>NEED HELP WITH YOUR PHONE?</span>
            <h2>We come to you. Your phone gets the care it needs.</h2>
            <p>Tell us the problem and we'll help you arrange an assessment.</p>
          </div>

          <Link to="/book-repair">
            Book Your Repair <ArrowUpRight size={19} />
          </Link>
        </section>
      </div>
    </div>
  );
}
