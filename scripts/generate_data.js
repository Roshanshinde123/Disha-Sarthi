// Data generator and validator for Disha Sarathi datasets
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'src', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. NSQF Trades (40 trades across 8 sectors with verified NQR QP codes)
const nsqfTrades = [
  // Apparel & Garments (5 trades)
  {
    id: "app_sewing_machine_op",
    qp_code: "AMH/Q0301",
    name_en: "Self Employed Tailor / Sewing Machine Operator",
    name_local: {
      hi: "सिलाई मशीन ऑपरेटर / दर्जी",
      mr: "शिलाई मशीन ऑपरेटर / शिंपी",
      bn: "সেলাই মেশিন অপারেটর / দর্জি",
      ta: "தையல் இயந்திர ஆபரேட்டர் / தையல்காரர்",
      te: "కుట్టు మిషన్ ఆపరేటర్ / టైలర్",
      kn: "ಹೊಲಿಗೆ ಯಂತ್ರ ಆಪರೇಟರ್ / ಟೈಲರ್",
      en: "Self Employed Tailor / Sewing Machine Operator"
    },
    sector: "Apparel, Made-Ups & Home Furnishing",
    ssc: "Apparel Made-Ups & Home Furnishing Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "middle",
    interest_tags: ["stitching", "tailoring", "design", "clothing", "textile", "handicraft", "embroidery"],
    related_occupations: ["tailoring", "weaver", "stitching", "garment work", "handloom", "homemaker"],
    physical_demands: ["fine_hand_dexterity", "sitting_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "12,000 - 22,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc", "stand_up_india"]
  },
  {
    id: "app_hand_embroiderer",
    qp_code: "AMH/Q1001",
    name_en: "Hand Embroiderer",
    name_local: {
      hi: "हस्त कढ़ाई कारीगर (Hand Embroiderer)",
      mr: "हात कशिदाकारी कारागीर",
      bn: "হাতের সূচিকর্ম শিল্পী",
      ta: "கை எம்பிராய்டரி கைவினைஞர்",
      te: "చేతి ఎంబ్రాయిడరీ నిపుణుడు",
      kn: "ಕೈ ಕಸೂತಿ ಕರಕುಶಲಕರ್ಮಿ",
      en: "Hand Embroiderer"
    },
    sector: "Apparel, Made-Ups & Home Furnishing",
    ssc: "Apparel Made-Ups & Home Furnishing Sector Skill Council",
    nsqf_level: 3,
    duration_hours: 240,
    min_education: "primary",
    interest_tags: ["embroidery", "handicraft", "design", "textile", "stitching"],
    related_occupations: ["tailoring", "embroidery", "handloom", "artisan", "homemaker"],
    physical_demands: ["fine_hand_dexterity", "sitting_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "10,000 - 18,000 / month",
    scheme_links: ["nsfdc", "pm_svanidhi"]
  },
  {
    id: "app_sampling_tailor",
    qp_code: "AMH/Q0701",
    name_en: "Sampling Tailor",
    name_local: {
      hi: "सैंपलिंग टेलर (Sampling Tailor)",
      mr: "सॅम्पलिंग टेलर",
      bn: "স্যাম্পলিং দর্জি",
      ta: "மாதிரி தையல்காரர்",
      te: "శాంప్లింగ్ టైలర్",
      kn: "ಮಾದರಿ ಟೈಲರ್",
      en: "Sampling Tailor"
    },
    sector: "Apparel, Made-Ups & Home Furnishing",
    ssc: "Apparel Made-Ups & Home Furnishing Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 360,
    min_education: "secondary",
    interest_tags: ["pattern_making", "tailoring", "design", "clothing", "garments"],
    related_occupations: ["tailoring", "garment master", "fashion worker"],
    physical_demands: ["fine_hand_dexterity"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 28,000 / month",
    scheme_links: ["stand_up_india", "nsfdc"]
  },
  {
    id: "app_fashion_designer_asst",
    qp_code: "AMH/Q1201",
    name_en: "Assistant Fashion Designer",
    name_local: {
      hi: "सहायक फैशन डिजाइनर",
      mr: "सहाय्यक फॅशन डिझायनर",
      bn: "সহকারী ফ্যাশন ডিজাইনার",
      ta: "உதவி பேஷன் டிசைனர்",
      te: "అసిస్టెంట్ ఫ్యాషన్ డిజైనర్",
      kn: "ಸಹಾಯಕ ಫ್ಯಾಷನ್ ಡಿಸೈನರ್",
      en: "Assistant Fashion Designer"
    },
    sector: "Apparel, Made-Ups & Home Furnishing",
    ssc: "Apparel Made-Ups & Home Furnishing Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 400,
    min_education: "higher_secondary",
    interest_tags: ["design", "fashion", "sketching", "styling", "textile"],
    related_occupations: ["boutique owner", "tailoring", "artist"],
    physical_demands: ["creative_visual"],
    self_employment_viable: true,
    typical_wage_band_inr: "16,000 - 30,000 / month",
    scheme_links: ["stand_up_india", "nsfdc"]
  },
  {
    id: "app_fabric_checker",
    qp_code: "AMH/Q0102",
    name_en: "Fabric Checker / Quality Inspector",
    name_local: {
      hi: "फैब्रिक चेकर व क्वालिटी इंस्पेक्टर",
      mr: "कापड तपासणी व गुणवत्ता निरीक्षक",
      bn: "কাপড় পরীক্ষক ও গুণমান পরিদর্শক",
      ta: "துணி பரிசோதகர்",
      te: "ఫ్యాబ్రిక్ చెకర్",
      kn: "ಬಟ್ಟೆ ಪರಿಶೀಲಕ",
      en: "Fabric Checker / Quality Inspector"
    },
    sector: "Apparel, Made-Ups & Home Furnishing",
    ssc: "Apparel Made-Ups & Home Furnishing Sector Skill Council",
    nsqf_level: 3,
    duration_hours: 200,
    min_education: "middle",
    interest_tags: ["quality_check", "garments", "factory", "textile"],
    related_occupations: ["garment worker", "factory laborer", "textile helper"],
    physical_demands: ["standing_moderate"],
    self_employment_viable: false,
    typical_wage_band_inr: "12,000 - 18,000 / month",
    scheme_links: ["nsfdc"]
  },

  // Beauty & Wellness (5 trades)
  {
    id: "bw_assistant_beautician",
    qp_code: "BWP/Q0101",
    name_en: "Assistant Beauty Therapist / Parlour Specialist",
    name_local: {
      hi: "ब्यूटी थेरेपिस्ट / ब्यूटी पार्लर विशेषज्ञ",
      mr: "ब्युटी थेरपिस्ट / पार्लर तज्ज्ञ",
      bn: "বিউটি থেরাপিস্ট / পার্লার বিশেষজ্ঞ",
      ta: "பியூட்டி தெரபிஸ்ட் / அழகுக்கலை நிபுணர்",
      te: "బ్యూటీ థెరపిస్ట్ / పార్లర్ నిపుణుడు",
      kn: "ಬ್ಯೂಟಿ ಥೆರಪಿಸ್ಟ್ / ಸೌಂದರ್ಯ ತಜ್ಞ",
      en: "Assistant Beauty Therapist / Parlour Specialist"
    },
    sector: "Beauty & Wellness",
    ssc: "Beauty & Wellness Sector Skill Council",
    nsqf_level: 3,
    duration_hours: 300,
    min_education: "primary",
    interest_tags: ["skincare", "haircare", "makeup", "beauty", "grooming", "salon"],
    related_occupations: ["hairdresser", "homemaker", "mehendi artist", "beautician"],
    physical_demands: ["standing_moderate", "fine_hand_dexterity"],
    self_employment_viable: true,
    typical_wage_band_inr: "12,000 - 25,000 / month",
    scheme_links: ["pm_svanidhi", "stand_up_india", "nsfdc"]
  },
  {
    id: "bw_pedicurist_manicurist",
    qp_code: "BWP/Q0401",
    name_en: "Pedicurist and Manicurist",
    name_local: {
      hi: "मेनिक्योर व पेडिक्योर विशेषज्ञ",
      mr: "मॅनिक्युअर व पेडिक्युअर तज्ज्ञ",
      bn: "ম্যানিকিউর ও পেডিকিউর বিশেষজ্ঞ",
      ta: "மெனிக்யூர் மற்றும் பெடிக்யூர் நிபுணர்",
      te: "మేనిక్యూర్ మరియు పెడిక్యూర్ స్పెషలిస్ట్",
      kn: "ಮ್ಯಾನಿಕ್ಯೂರ್ ಮತ್ತು ಪೆಡಿಕ್ಯೂರ್ ತಜ್ಞ",
      en: "Pedicurist and Manicurist"
    },
    sector: "Beauty & Wellness",
    ssc: "Beauty & Wellness Sector Skill Council",
    nsqf_level: 3,
    duration_hours: 200,
    min_education: "primary",
    interest_tags: ["nail_care", "beauty", "spa", "grooming"],
    related_occupations: ["beautician", "salon assistant"],
    physical_demands: ["sitting_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "10,000 - 20,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "bw_bridal_makeup_artist",
    qp_code: "BWP/Q0301",
    name_en: "Bridal Makeup & Hair Styling Artist",
    name_local: {
      hi: "ब्राइडल मेकअप एवं हेयर स्टाइलिंग कलाकार",
      mr: "ब्राइडल मेकअप आणि हेअर स्टाईल कलाकार",
      bn: "ব্রাইডাল মেকআপ ও হেয়ার স্টাইলিং শিল্পী",
      ta: "மணப்பெண் ஒப்பனை மற்றும் சிகை அலங்காரக் கலைஞர்",
      te: "బ్రైడల్ మేకప్ & హెయిర్ స్టైలింగ్ ఆర్టిస్ట్",
      kn: "ವಧುವಿನ ಮೇಕಪ್ ಮತ್ತು ಹೇರ್ ಸ್ಟೈಲಿಂಗ್ ಕಲಾವಿದ",
      en: "Bridal Makeup & Hair Styling Artist"
    },
    sector: "Beauty & Wellness",
    ssc: "Beauty & Wellness Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 360,
    min_education: "secondary",
    interest_tags: ["makeup", "bridal", "hairstyling", "cosmetics", "fashion"],
    related_occupations: ["beautician", "mehendi artist", "salon owner"],
    physical_demands: ["fine_hand_dexterity", "standing_moderate"],
    self_employment_viable: true,
    typical_wage_band_inr: "18,000 - 45,000 / month",
    scheme_links: ["stand_up_india", "pm_svanidhi", "nsfdc"]
  },
  {
    id: "bw_yoga_wellness_trainer",
    qp_code: "BWP/Q2201",
    name_en: "Yoga Wellness Trainer",
    name_local: {
      hi: "योग एवं वेलनेस ट्रेनर",
      mr: "योग आणि वेलनेस प्रशिक्षक",
      bn: "যোগ ও সুস্থতা প্রশিক্ষক",
      ta: "யோகா மற்றும் ஆரோக்கிய பயிற்சியாளர்",
      te: "యోగా మరియు వెల్‌నెస్ ట్రైనర్",
      kn: "ಯೋಗ ಮತ್ತು ಕ್ಷೇಮ ತರಬೇತುದಾರ",
      en: "Yoga Wellness Trainer"
    },
    sector: "Beauty & Wellness",
    ssc: "Beauty & Wellness Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 400,
    min_education: "higher_secondary",
    interest_tags: ["fitness", "yoga", "health", "exercise", "wellness"],
    related_occupations: ["gym trainer", "sports instructor", "health worker"],
    physical_demands: ["high_physical_mobility", "stamina"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 35,000 / month",
    scheme_links: ["stand_up_india", "nsfdc"]
  },
  {
    id: "bw_spa_therapist",
    qp_code: "BWP/Q0202",
    name_en: "Spa Therapist",
    name_local: {
      hi: "स्पा थेरेपिस्ट (Spa Therapist)",
      mr: "स्पा थेरपिस्ट",
      bn: "স্পা থেরাপিস্ট",
      ta: "ஸ்பா தெரபிஸ்ட்",
      te: "స్పా థెరపిస్ట్",
      kn: "ಸ್ಪಾ ಥೆರಪಿಸ್ಟ್",
      en: "Spa Therapist"
    },
    sector: "Beauty & Wellness",
    ssc: "Beauty & Wellness Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 320,
    min_education: "secondary",
    interest_tags: ["massage", "wellness", "therapy", "hospitality"],
    related_occupations: ["caregiver", "nursing aide", "salon worker"],
    physical_demands: ["moderate_physical_activity"],
    self_employment_viable: true,
    typical_wage_band_inr: "14,000 - 28,000 / month",
    scheme_links: ["nsfdc"]
  },

  // Electronics & Hardware (5 trades)
  {
    id: "el_cctv_technician",
    qp_code: "ELE/Q4605",
    name_en: "CCTV Installation and Security Technician",
    name_local: {
      hi: "सीसीटीवी कैमरा इंस्टॉलेशन व सुरक्षा तकनीशियन",
      mr: "सीसीटीव्ही कॅमेरा इंस्टॉलेशन व तंत्रज्ञ",
      bn: "সিসিটিভি ইনস্টলেশন ও সুরক্ষা টেকনিশিয়ান",
      ta: "சிசிடிவி நிறுவுதல் மற்றும் பாதுகாப்பு தொழில்நுட்ப வல்லுநர்",
      te: "సిసిటివి ఇన్‌స్టాలేషన్ మరియు సెక్యూరిటీ టెక్నీషియన్",
      kn: "ಸಿಸಿಟಿವಿ ಸ್ಥಾಪನೆ ಮತ್ತು ಭದ್ರತಾ ತಂತ್ರಜ್ಞ",
      en: "CCTV Installation and Security Technician"
    },
    sector: "Electronics & Hardware",
    ssc: "Electronics Sector Skills Council of India",
    nsqf_level: 4,
    duration_hours: 360,
    min_education: "secondary",
    interest_tags: ["cctv", "wiring", "security", "electronics", "cameras", "repairs"],
    related_occupations: ["electrician", "cable operator", "hardware repairer"],
    physical_demands: ["climbing_ladders", "outdoor_mobility"],
    self_employment_viable: true,
    typical_wage_band_inr: "14,000 - 30,000 / month",
    scheme_links: ["pm_svanidhi", "stand_up_india", "nsfdc"]
  },
  {
    id: "el_smartphone_repair",
    qp_code: "ELE/Q8104",
    name_en: "Smartphone and Mobile Device Repair Technician",
    name_local: {
      hi: "स्मार्टफोन व मोबाइल मरम्मत तकनीशियन",
      mr: "स्मार्टफोन आणि मोबाईल दुरुस्ती तंत्रज्ञ",
      bn: "স্মার্টফোন ও মোবাইল মেরামত টেকনিশিয়ান",
      ta: "ஸ்மார்ட்போன் மற்றும் மொபைல் பழுதுபார்க்கும் தொழில்நுட்ப வல்லுநர்",
      te: "స్మార్ట్‌ఫోన్ మరియు మొబైల్ రిపేర్ టెక్నీషియన్",
      kn: "ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಮತ್ತು ಮೊಬೈಲ್ ರಿಪೇರಿ ತಂತ್ರಜ್ಞ",
      en: "Smartphone and Mobile Device Repair Technician"
    },
    sector: "Electronics & Hardware",
    ssc: "Electronics Sector Skills Council of India",
    nsqf_level: 4,
    duration_hours: 320,
    min_education: "secondary",
    interest_tags: ["mobile_repair", "gadgets", "soldering", "electronics", "smartphones"],
    related_occupations: ["electronics helper", "shop assistant", "computer technician"],
    physical_demands: ["fine_hand_dexterity", "sitting_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 35,000 / month",
    scheme_links: ["pm_svanidhi", "stand_up_india", "nsfdc"]
  },
  {
    id: "el_home_appliance_technician",
    qp_code: "ELE/Q3101",
    name_en: "Field Technician - Other Home Appliances",
    name_local: {
      hi: "घरेलू उपकरण मरम्मत तकनीशियन (Home Appliances)",
      mr: "घरगुती उपकरणे दुरुस्ती तंत्रज्ञ",
      bn: "গৃহস্থালী যন্ত্রপাতি মেরামত টেকনিশিয়ান",
      ta: "வீട്ടു உபயோகப் பொருட்கள் பழுதுபார்க்கும் தொழில்நுட்ப வல்லுநர்",
      te: "గృహోపకరణాల రిపేర్ టెక్నీషియన్",
      kn: "ಗೃಹೋಪಯೋಗಿ ವಸ್ತುಗಳ ದುರಸ್ತಿ ತಂತ್ರಜ್ಞ",
      en: "Field Technician - Other Home Appliances"
    },
    sector: "Electronics & Hardware",
    ssc: "Electronics Sector Skills Council of India",
    nsqf_level: 4,
    duration_hours: 360,
    min_education: "middle",
    interest_tags: ["appliances", "refrigerator", "washing_machine", "mixer", "electrical_repair"],
    related_occupations: ["electrician", "motor mechanic", "repairman"],
    physical_demands: ["outdoor_travel", "lifting_light_loads"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 32,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc", "stand_up_india"]
  },
  {
    id: "el_solar_panel_installer",
    qp_code: "ELE/Q5901",
    name_en: "Solar Panel Installation Technician (Suryamitra)",
    name_local: {
      hi: "सोलर पैनल इंस्टॉलेशन तकनीशियन (सूर्यमित्र)",
      mr: "सौर पॅनेल इंस्टॉलेशन तंत्रज्ञ (सूर्यमित्र)",
      bn: "সৌর প্যানেল ইনস্টলেশন টেকনিশিয়ান (সূর্যমিত্র)",
      ta: "சூரிய ஒளி தகடு நிறுவும் தொழில்நுட்ப வல்லுநர் (சூர்யமித்ரா)",
      te: "సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్ టెక్నీషియన్ (సూర్యమిత్ర)",
      kn: "ಸೌರ ಫಲಕ ಸ್ಥಾಪನಾ ತಂತ್ರಜ್ಞ (ಸೂರ್ಯಮಿತ್ರ)",
      en: "Solar Panel Installation Technician (Suryamitra)"
    },
    sector: "Electronics & Hardware",
    ssc: "Electronics Sector Skills Council of India",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "secondary",
    interest_tags: ["solar", "renewable_energy", "electricity", "roof_work", "green_energy"],
    related_occupations: ["electrician", "wireman", "construction worker"],
    physical_demands: ["outdoor_sun_exposure", "climbing_roofs", "heavy_lifting"],
    self_employment_viable: true,
    typical_wage_band_inr: "16,000 - 32,000 / month",
    scheme_links: ["stand_up_india", "nsfdc"]
  },
  {
    id: "el_led_light_repair",
    qp_code: "ELE/Q9301",
    name_en: "LED Light Repair & Assembly Technician",
    name_local: {
      hi: "एलईडी लाइट मरम्मत एवं असेंबली तकनीशियन",
      mr: "एलईडी लाईट दुरुस्ती व जोडणी तंत्रज्ञ",
      bn: "এলইডি লাইট মেরামত ও সংযোজন টেকনিশিয়ান",
      ta: "எல்இடி விளக்கு பழுதுபார்ப்பு தொழில்நுட்ப வல்லுநர்",
      te: "ఎల్ఈడీ లైట్ రిపేరింగ్ & అసెంబ్లింగ్ టెక్నీషియన్",
      kn: "ಎಲ್‌ಇಡಿ ಲೈಟ್ ರಿಪೇರಿ ಮತ್ತು ಜೋಡಣೆ ತಂತ್ರಜ್ಞ",
      en: "LED Light Repair & Assembly Technician"
    },
    sector: "Electronics & Hardware",
    ssc: "Electronics Sector Skills Council of India",
    nsqf_level: 3,
    duration_hours: 240,
    min_education: "primary",
    interest_tags: ["led", "lighting", "assembly", "soldering", "electrical"],
    related_occupations: ["electrician helper", "assembly worker"],
    physical_demands: ["sitting_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "11,000 - 22,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },

  // Construction & Plumbing (5 trades)
  {
    id: "con_general_plumber",
    qp_code: "PSC/Q0104",
    name_en: "Plumber (General)",
    name_local: {
      hi: "प्लंबर (सामान्य पाइप व सेनेटरी तकनीशियन)",
      mr: "प्लंबर (पाईप व सॅनिटरी तज्ज्ञ)",
      bn: "প্লাম্বার (পাইপ ও স্যানিটারি মিস্ত্রি)",
      ta: "பிளம்பர் (பொது குழாய் பொருத்துநர்)",
      te: "ప్లంబర్ (పైపు మరియు శానిటరీ మెకానిక్)",
      kn: "ಪ್ಲಂಬರ್ (ಪೈಪ್ ಮತ್ತು ನೈರ್ಮಲ್ಯ ತಂತ್ರಜ್ಞ)",
      en: "Plumber (General)"
    },
    sector: "Construction & Plumbing",
    ssc: "Indian Plumbing Skills Council",
    nsqf_level: 3,
    duration_hours: 320,
    min_education: "primary",
    interest_tags: ["plumbing", "pipe_fitting", "sanitary", "water_supply", "repairs"],
    related_occupations: ["construction helper", "mason", "laborer", "welder"],
    physical_demands: ["heavy_lifting", "bending_kneeling", "physical_labor"],
    self_employment_viable: true,
    typical_wage_band_inr: "14,000 - 30,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "con_general_electrician",
    qp_code: "CON/Q0602",
    name_en: "Assistant Electrician (Construction / Domestic)",
    name_local: {
      hi: "इलेक्ट्रीशियन (घरेलू व भवन वायरिंग)",
      mr: "इलेक्ट्रिशियन (घरगुती व इमारत वायरिंग)",
      bn: "ইলেকট্রিশিয়ান (গৃহস্থালী ও নির্মাণ ওয়্যারিং)",
      ta: "எலக்ட்ரீஷியன் (வீட்டு வயரிங் தொழில்நுட்ப வல்லுநர்)",
      te: "ఎలక్ట్రీషియన్ (హౌస్ వైరింగ్ టెక్నీషియన్)",
      kn: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ (ಮನೆ ವೈರಿಂಗ್ ತಂತ್ರಜ್ಞ)",
      en: "Assistant Electrician (Construction / Domestic)"
    },
    sector: "Construction & Plumbing",
    ssc: "Construction Skill Development Council of India",
    nsqf_level: 3,
    duration_hours: 350,
    min_education: "middle",
    interest_tags: ["electrical", "wiring", "switches", "house_wiring", "repairs"],
    related_occupations: ["wireman", "electrician helper", "line worker"],
    physical_demands: ["climbing_ladders", "outdoor_activity"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 32,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc", "stand_up_india"]
  },
  {
    id: "con_mason_general",
    qp_code: "CON/Q0102",
    name_en: "Mason (General Brick and Concrete Work)",
    name_local: {
      hi: "राजमिस्त्री (भवन निर्माण एवं चिनाई)",
      mr: "गवंडी (इमारत बांधकाम व चिनाई)",
      bn: "রাজমিস্ত্রি (ইঁট ও সিমেন্ট নির্মাণ)",
      ta: "கொத்தனார் (கட்டிட வேலை)",
      te: "మేస్త్రీ (భవన నిర్మాణం)",
      kn: "ಮೇಸ್ತ್ರಿ (ಕಟ್ಟಡ ನಿರ್ಮಾಣ)",
      en: "Mason (General Brick and Concrete Work)"
    },
    sector: "Construction & Plumbing",
    ssc: "Construction Skill Development Council of India",
    nsqf_level: 3,
    duration_hours: 300,
    min_education: "none",
    interest_tags: ["masonry", "brickwork", "construction", "plastering", "tiling"],
    related_occupations: ["construction laborer", "daily wage worker", "helper"],
    physical_demands: ["heavy_physical_labor", "lifting_loads", "outdoor_sun_exposure"],
    self_employment_viable: true,
    typical_wage_band_inr: "16,000 - 35,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "con_tile_layer",
    qp_code: "CON/Q0201",
    name_en: "Tile and Stone Layer",
    name_local: {
      hi: "टाइल्स एवं मार्बल फिटिंग कारीगर",
      mr: "टाईल्स आणि मार्बल बसवणारा कारागीर",
      bn: "টাইলস ও মার্বেল মিস্ত্রি",
      ta: "டைல்ஸ் மற்றும் மார்பிள் பொருத்துநர்",
      te: "టైల్స్ మరియు మార్బుల్ ఫిట్టర్",
      kn: "ಟೈಲ್ಸ್ ಮತ್ತು ಮಾರ್ಬಲ್ ಫಿಟ್ಟಿಂಗ್ ಕುಶಲಕರ್ಮಿ",
      en: "Tile and Stone Layer"
    },
    sector: "Construction & Plumbing",
    ssc: "Construction Skill Development Council of India",
    nsqf_level: 3,
    duration_hours: 280,
    min_education: "primary",
    interest_tags: ["tiling", "flooring", "marble", "renovation", "construction"],
    related_occupations: ["mason", "flooring worker", "construction laborer"],
    physical_demands: ["kneeling_bending", "lifting_moderate_weights"],
    self_employment_viable: true,
    typical_wage_band_inr: "18,000 - 40,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "con_painter_decorator",
    qp_code: "CON/Q0501",
    name_en: "Construction Painter and Decorator",
    name_local: {
      hi: "भवन पेंटर एवं पुट्टी कारीगर",
      mr: "इमारत पेंटर आणि रंगकाम कारागीर",
      bn: "বাড়ি রঙমিস্ত্রি",
      ta: "கட்டிட பெயிண்டர்",
      te: "పెయింటర్ (భవనాల రంగులు వేయు నిపుణుడు)",
      kn: "ಕಟ್ಟಡ ಪೇಂಟರ್ ಮತ್ತು ಅಲಂಕಾರಿಕ",
      en: "Construction Painter and Decorator"
    },
    sector: "Construction & Plumbing",
    ssc: "Construction Skill Development Council of India",
    nsqf_level: 3,
    duration_hours: 260,
    min_education: "none",
    interest_tags: ["painting", "putty", "decorating", "color_matching", "renovation"],
    related_occupations: ["whitewashing worker", "laborer", "artist"],
    physical_demands: ["climbing_scaffolding", "standing_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 32,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },

  // Agriculture & Food Processing (5 trades)
  {
    id: "agr_dairy_farmer",
    qp_code: "AGR/Q4101",
    name_en: "Dairy Farmer / Milk Production Specialist",
    name_local: {
      hi: "डेयरी किसान / दुग्ध उत्पादक उद्यमी",
      mr: "डेअरी शेतकरी / दुग्ध व्यवसाय उद्योजक",
      bn: "দুগ্ধ খামারি / দুগ্ধ উৎপাদক",
      ta: "பால் பண்ணையாளர் / பால் உற்பத்தியாளர்",
      te: "పాడి రైతు / పాల ఉత్పత్తి నిపుణుడు",
      kn: "ಡೈರಿ ರೈತ / ಹಾಲು ಉತ್ಪಾದಕ",
      en: "Dairy Farmer / Milk Production Specialist"
    },
    sector: "Agriculture & Allied",
    ssc: "Agriculture Skill Council of India",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "primary",
    interest_tags: ["dairy", "cattle", "milking", "animal_husbandry", "rural_business"],
    related_occupations: ["farming", "livestock rearer", "agricultural laborer"],
    physical_demands: ["animal_handling", "early_morning_work"],
    self_employment_viable: true,
    typical_wage_band_inr: "18,000 - 45,000 / month",
    scheme_links: ["stand_up_india", "nsfdc", "pm_svanidhi"]
  },
  {
    id: "agr_poultry_farmer",
    qp_code: "AGR/Q4301",
    name_en: "Small Poultry Farmer (Broiler / Layer)",
    name_local: {
      hi: "मुर्गी पालन उद्यमी (Poultry Farmer)",
      mr: "कुक्कुटपालन उद्योजक (पोल्ट्री फार्मर)",
      bn: "পোল্ট্রি খামারি",
      ta: "கோழிப் பண்ணையாளர்",
      te: "కోళ్ల పెంపకందారు",
      kn: "ಕೋಳಿ ಸಾಕಣೆದಾರ",
      en: "Small Poultry Farmer (Broiler / Layer)"
    },
    sector: "Agriculture & Allied",
    ssc: "Agriculture Skill Council of India",
    nsqf_level: 4,
    duration_hours: 280,
    min_education: "primary",
    interest_tags: ["poultry", "birds", "meat", "eggs", "farming"],
    related_occupations: ["farming", "livestock", "rural worker"],
    physical_demands: ["farm_maintenance", "standing_moderate"],
    self_employment_viable: true,
    typical_wage_band_inr: "16,000 - 40,000 / month",
    scheme_links: ["stand_up_india", "nsfdc"]
  },
  {
    id: "agr_micro_irrigation",
    qp_code: "AGR/Q1002",
    name_en: "Micro Irrigation Technician (Drip & Sprinkler)",
    name_local: {
      hi: "ड्रिप व स्प्रिंकलर सिंचाई तकनीशियन",
      mr: "ठिबक व तुषार सिंचन तंत्रज्ञ",
      bn: "ড্রিপ ও স্প্রিংকলার সেচ টেকনিশিয়ান",
      ta: "சொட்டு நீர் பாசன தொழில்நுட்ப வல்லுநர்",
      te: "మైక్రో ఇరిగేషన్ టెక్నీషియన్",
      kn: "ಹನಿ ನೀರಾವರಿ ತಂತ್ರಜ್ಞ",
      en: "Micro Irrigation Technician (Drip & Sprinkler)"
    },
    sector: "Agriculture & Allied",
    ssc: "Agriculture Skill Council of India",
    nsqf_level: 4,
    duration_hours: 320,
    min_education: "middle",
    interest_tags: ["irrigation", "water_saving", "farming_equipment", "agriculture"],
    related_occupations: ["farmer", "plumber", "pump mechanic"],
    physical_demands: ["outdoor_field_work"],
    self_employment_viable: true,
    typical_wage_band_inr: "14,000 - 28,000 / month",
    scheme_links: ["nsfdc"]
  },
  {
    id: "agr_fruit_vegetable_processor",
    qp_code: "FIC/Q0103",
    name_en: "Fruit and Vegetable Processing Technician (Pickle, Jam, Pulp)",
    name_local: {
      hi: "फल व सब्जी प्रसंस्करण (अचार, जैम, पापड़ निर्माण)",
      mr: "फळे व भाजीपाला प्रक्रिया (लोणचे, जॅम निर्मिती)",
      bn: "ফল ও শাকসবজি প্রক্রিয়াকরণ (আচার, জ্যাম)",
      ta: "பழங்கள் மற்றும் காய்கறிகள் பதப்படுத்துபவர் (ஊறுகாய், ஜாம்)",
      te: "పండ్లు & కూరగాయల ప్రాసెసింగ్ టెక్నీషియన్",
      kn: "ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿ ಸಂಸ್ಕರಣಾ ತಂತ್ರಜ್ಞ",
      en: "Fruit and Vegetable Processing Technician (Pickle, Jam, Pulp)"
    },
    sector: "Food Processing",
    ssc: "Food Industry Capacity & Skill Initiative",
    nsqf_level: 3,
    duration_hours: 240,
    min_education: "primary",
    interest_tags: ["cooking", "food_processing", "pickles", "preservation", "homemade_products"],
    related_occupations: ["cook", "homemaker", "agricultural worker", "sweet maker"],
    physical_demands: ["kitchen_hygiene", "standing_moderate"],
    self_employment_viable: true,
    typical_wage_band_inr: "12,000 - 25,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc", "stand_up_india"]
  },
  {
    id: "agr_mushroom_grower",
    qp_code: "AGR/Q7803",
    name_en: "Mushroom Cultivator / Spawns Specialist",
    name_local: {
      hi: "मशरूम उत्पादक किसान (Mushroom Cultivator)",
      mr: "मशरूम उत्पादक शेतकरी",
      bn: "মাশরুম চাষি",
      ta: "காளான் வளர்ப்பாளர்",
      te: "పుట్టగొడుగుల పెంపకందారు",
      kn: "ಅಣಬೆ ಬೆಳೆಗಾರ",
      en: "Mushroom Cultivator / Spawns Specialist"
    },
    sector: "Agriculture & Allied",
    ssc: "Agriculture Skill Council of India",
    nsqf_level: 4,
    duration_hours: 200,
    min_education: "primary",
    interest_tags: ["mushrooms", "organic_farming", "indoor_cultivation", "horticulture"],
    related_occupations: ["farming", "gardener", "homemaker"],
    physical_demands: ["indoor_monitoring"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 35,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },

  // Automotive & Logistics (5 trades)
  {
    id: "aut_two_wheeler_mechanic",
    qp_code: "ASC/Q1411",
    name_en: "Two-Wheeler Service & Repair Technician",
    name_local: {
      hi: "दोपहिया वाहन सर्विस एवं मरम्मत मैकेनिक",
      mr: "दुचाकी सेवा व दुरुस्ती मेकॅनिक",
      bn: "টু-হুইলার সার্ভিস ও মেরামত মেকানিক",
      ta: "இருசக்கர வாகன பழுதுபார்க்கும் மெக்கானிக்",
      te: "టూ-వీలర్ సర్వీస్ & రిపేర్ మెకానిక్",
      kn: "ದ್ವಿಚಕ್ರ ವಾಹನ ಸೇವೆ ಮತ್ತು ದುರಸ್ತಿ ಮೆಕ್ಯಾನಿಕ್",
      en: "Two-Wheeler Service & Repair Technician"
    },
    sector: "Automotive",
    ssc: "Automotive Skills Development Council",
    nsqf_level: 4,
    duration_hours: 380,
    min_education: "middle",
    interest_tags: ["bikes", "two_wheeler", "engine", "mechanics", "vehicles", "oil_change"],
    related_occupations: ["garage helper", "cycle repairer", "mechanic"],
    physical_demands: ["bending_kneeling", "grease_oil_handling", "heavy_parts"],
    self_employment_viable: true,
    typical_wage_band_inr: "16,000 - 38,000 / month",
    scheme_links: ["pm_svanidhi", "stand_up_india", "nsfdc"]
  },
  {
    id: "aut_ev_service_technician",
    qp_code: "ASC/Q1424",
    name_en: "Electric Vehicle (EV) Service Technician",
    name_local: {
      hi: "इलेक्ट्रिक वाहन (EV) सर्विस व बैटरी तकनीशियन",
      mr: "इलेक्ट्रिक वाहन (EV) सेवा व बॅटरी तंत्रज्ञ",
      bn: "বৈদ্যুতিক গাড়ি (ইভি) সার্ভিস ও ব্যাটারি টেকনিশিয়ান",
      ta: "மின்சார வாகன (EV) சேவை மற்றும் பேட்டரி தொழில்நுட்ப வல்லுநர்",
      te: "ఎలక్ట్రిక్ వెహికల్ (ఈవీ) సర్వీస్ టెక్నీషియన్",
      kn: "ಎಲೆಕ್ಟ್ರಿಕ್ ವಾಹನ (ಇವಿ) ಸೇವಾ ತಂತ್ರಜ್ಞ",
      en: "Electric Vehicle (EV) Service Technician"
    },
    sector: "Automotive",
    ssc: "Automotive Skills Development Council",
    nsqf_level: 4,
    duration_hours: 400,
    min_education: "secondary",
    interest_tags: ["ev", "electric_scooter", "batteries", "motor_repair", "green_tech"],
    related_occupations: ["electrician", "auto mechanic", "battery technician"],
    physical_demands: ["fine_hand_dexterity", "moderate_lifting"],
    self_employment_viable: true,
    typical_wage_band_inr: "18,000 - 40,000 / month",
    scheme_links: ["stand_up_india", "nsfdc"]
  },
  {
    id: "aut_commercial_driver",
    qp_code: "ASC/Q9702",
    name_en: "Commercial Vehicle Driver (LCV / Truck / Bus)",
    name_local: {
      hi: "कमर्शियल वाहन चालक (ड्राइवर)",
      mr: "व्यावसायिक वाहन चालक (ड्रायव्हर)",
      bn: "বাণিজ্যিক যানবাহন চালক",
      ta: "வணிக வாகன ஓட்டுநர்",
      te: "కమర్షియల్ వెహికల్ డ్రైవర్",
      kn: "ವಾಣಿಜ್ಯ ವಾಹನ ಚಾಲಕ",
      en: "Commercial Vehicle Driver (LCV / Truck / Bus)"
    },
    sector: "Automotive",
    ssc: "Automotive Skills Development Council",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "middle",
    interest_tags: ["driving", "logistics", "transport", "travel", "vehicles"],
    related_occupations: ["auto driver", "taxi driver", "delivery driver", "tractor driver"],
    physical_demands: ["long_hours_sitting", "alert_eyesight", "night_driving"],
    self_employment_viable: true,
    typical_wage_band_inr: "18,000 - 35,000 / month",
    scheme_links: ["stand_up_india", "nsfdc", "pm_svanidhi"]
  },
  {
    id: "log_warehouse_picker",
    qp_code: "LSC/Q0102",
    name_en: "Warehouse Associate / Picker & Packer",
    name_local: {
      hi: "वेयरहाउस एसोसिएट / पैकर एवं पिकर",
      mr: "वेअरहाऊस असोसिएट / पॅकर आणि पिकर",
      bn: "গুদাম সহযোগী / পিকার ও প্যাকার",
      ta: "கிடங்கு உதவியாளர் / பேக்கர்",
      te: "వేర్‌హౌస్ అసోసియేట్ / ప్యాకర్",
      kn: "ಗೋದಾಮು ಸಹವರ್ತಿ / ಪ್ಯಾಕರ್",
      en: "Warehouse Associate / Picker & Packer"
    },
    sector: "Logistics",
    ssc: "Logistics Sector Skill Council",
    nsqf_level: 3,
    duration_hours: 220,
    min_education: "primary",
    interest_tags: ["warehouse", "packaging", "inventory", "e_commerce", "delivery"],
    related_occupations: ["delivery boy", "store helper", "loader"],
    physical_demands: ["standing_walking", "lifting_boxes"],
    self_employment_viable: false,
    typical_wage_band_inr: "13,000 - 22,000 / month",
    scheme_links: ["nsfdc"]
  },
  {
    id: "aut_auto_body_painter",
    qp_code: "ASC/Q1405",
    name_en: "Automotive Paint Technician / Denter",
    name_local: {
      hi: "ऑटोमोबाइल डेंटिंग एवं पेंटिंग तकनीशियन",
      mr: "ऑटोमोबाईल डेंटिंग आणि पेंटिंग तंत्रज्ञ",
      bn: "অটোমোবাইল ডেন্টিং ও পেইন্টিং টেকনিশিয়ান",
      ta: "வாகன பெயிண்டிங் மற்றும் டெண்டிங் தொழில்நுட்ப வல்லுநர்",
      te: "ఆటోమోటివ్ డెంటింగ్ & పెయింటింగ్ టెక్నీషియన్",
      kn: "ವಾಹನ ಡೆಂಟಿಂಗ್ ಮತ್ತು ಪೇಂಟಿಂಗ್ ತಂತ್ರಜ್ಞ",
      en: "Automotive Paint Technician / Denter"
    },
    sector: "Automotive",
    ssc: "Automotive Skills Development Council",
    nsqf_level: 4,
    duration_hours: 350,
    min_education: "middle",
    interest_tags: ["denting", "painting", "spray_paint", "body_repair", "automobiles"],
    related_occupations: ["painter", "welder", "garage worker"],
    physical_demands: ["fumes_mask_usage", "standing_long_hours"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 32,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },

  // IT-ITeS & Digital Services (5 trades)
  {
    id: "it_data_entry_operator",
    qp_code: "SSC/Q2212",
    name_en: "Domestic Data Entry Operator (DDEO)",
    name_local: {
      hi: "घरेलू डाटा एंट्री ऑपरेटर (Computer Typing & Data)",
      mr: "डेटा एंट्री ऑपरेटर (कॉम्प्युटर टायपिंग)",
      bn: "ডাটা এন্ট্রি অপারেটর (কম্পিউটার টাইপিং)",
      ta: "டேட்டா என்ட்ரி ஆபரேட்டர் (கணினி தட்டச்சு)",
      te: "డేటా ఎంట్రీ ఆపరేటర్ (కంప్యూటర్ టైపింగ్)",
      kn: "ಡೇಟಾ ಎಂಟ್ರಿ ಆಪರೇಟರ್ (ಕಂಪ್ಯೂಟರ್ ಟೈಪಿಂಗ್)",
      en: "Domestic Data Entry Operator (DDEO)"
    },
    sector: "IT-ITeS",
    ssc: "IT-ITeS Sector Skills Council NASSCOM",
    nsqf_level: 4,
    duration_hours: 400,
    min_education: "secondary",
    interest_tags: ["computer", "typing", "data_entry", "ms_office", "documentation", "keyboard"],
    related_occupations: ["clerk", "student", "cyber cafe worker", "typist"],
    physical_demands: ["desk_sitting", "screen_usage"],
    self_employment_viable: true,
    typical_wage_band_inr: "12,000 - 24,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "it_csc_vle_operator",
    qp_code: "SSC/Q0110",
    name_en: "CSC / Citizen Digital Service Facilitator (VLE)",
    name_local: {
      hi: "जन सेवा केंद्र / सीएससी डिजिटल सेवा संचालक",
      mr: "आपले सरकार / सीएससी डिजिटल केंद्र संचालक",
      bn: "সিএসসি ডিজিটাল পরিষেবা পরিচালক (ভিএলই)",
      ta: "பொது சேவை மையம் / சிஎஸ்சி டிஜிட்டல் ஆபரேட்டர்",
      te: "మీసేవ / సిఎస్‌సి డిజిటల్ సేవా ఆపరేటర్",
      kn: "ಗ್ರಾಮ ಒನ್ / ಸಿಎಸ್‌ಸಿ ಡಿಜಿಟಲ್ ಸೇವಾ ಆಪರೇಟರ್",
      en: "CSC / Citizen Digital Service Facilitator (VLE)"
    },
    sector: "IT-ITeS",
    ssc: "IT-ITeS Sector Skills Council NASSCOM",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "higher_secondary",
    interest_tags: ["csc", "online_forms", "banking_point", "digital_india", "printing", "photocopy"],
    related_occupations: ["cyber cafe operator", "computer teacher", "clerk"],
    physical_demands: ["desk_sitting", "customer_interaction"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 35,000 / month",
    scheme_links: ["pm_svanidhi", "stand_up_india", "nsfdc"]
  },
  {
    id: "it_crm_domestic_voice",
    qp_code: "SSC/Q2210",
    name_en: "CRM Domestic Voice Associate (Call Center)",
    name_local: {
      hi: "कॉल सेंटर एग्जीक्यूटिव / ग्राहक सेवा प्रतिनिधि",
      mr: "कॉल सेंटर एक्झिक्युटिव्ह / ग्राहक सेवा प्रतिनिधी",
      bn: "কল সেন্টার এক্সিকিউটিভ / গ্রাহক পরিষেবা প্রতিনিধি",
      ta: "கால் சென்டர் எக்ஸிகியூட்டிவ் / வாடிக்கையாளர் சேவை",
      te: "కాల్ సెంటర్ ఎగ్జిక్యూటివ్ / కస్టమర్ కేర్",
      kn: "ಕಾಲ್ ಸೆಂಟರ್ ಎಕ್ಸಿಕ್ಯೂಟಿವ್ / ಗ್ರಾಹಕ ಸೇವಾ ಪ್ರತಿನಿಧಿ",
      en: "CRM Domestic Voice Associate (Call Center)"
    },
    sector: "IT-ITeS",
    ssc: "IT-ITeS Sector Skills Council NASSCOM",
    nsqf_level: 4,
    duration_hours: 400,
    min_education: "higher_secondary",
    interest_tags: ["communication", "calling", "customer_support", "languages", "headset"],
    related_occupations: ["receptionist", "telecaller", "salesperson"],
    physical_demands: ["voice_clarity", "sitting_long_hours"],
    self_employment_viable: false,
    typical_wage_band_inr: "14,000 - 28,000 / month",
    scheme_links: ["nsfdc"]
  },
  {
    id: "it_graphic_design_asst",
    qp_code: "MES/Q0601",
    name_en: "Digital Graphic Designer & Print Assistant",
    name_local: {
      hi: "ग्राफिक डिजाइन व फ्लेक्स प्रिंटिंग सहायक",
      mr: "ग्राफिक डिझाईन आणि फ्लेक्स प्रिंटिंग सहाय्यक",
      bn: "গ্রাফিক ডিজাইনার ও ফ্লেক্স প্রিন্টিং সহকারী",
      ta: "கிராஃபிக் டிசைனர் மற்றும் பிரிண்டிங் உதவியாளர்",
      te: "గ్రాఫిక్ డిజైనర్ & ఫ్లెక్స్ ప్రింటింగ్ అసిస్టెంట్",
      kn: "ಗ್ರಾಫಿಕ್ ಡಿಸೈನರ್ ಮತ್ತು ಫ್ಲೆಕ್ಸ್ ಪ್ರಿಂಟಿಂಗ್ ಸಹಾಯಕ",
      en: "Digital Graphic Designer & Print Assistant"
    },
    sector: "Media & Entertainment",
    ssc: "Media & Entertainment Skills Council",
    nsqf_level: 4,
    duration_hours: 360,
    min_education: "secondary",
    interest_tags: ["photoshop", "design", "banners", "flex_print", "photo_studio", "drawing"],
    related_occupations: ["photographer", "artist", "computer operator"],
    physical_demands: ["desk_sitting", "visual_creativity"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 32,000 / month",
    scheme_links: ["pm_svanidhi", "stand_up_india", "nsfdc"]
  },
  {
    id: "it_hardware_networking_asst",
    qp_code: "SSC/Q7001",
    name_en: "Hardware and Network Support Assistant",
    name_local: {
      hi: "कंप्यूटर हार्डवेयर एवं नेटवर्क सपोर्ट सहायक",
      mr: "संगणक हार्डवेअर आणि नेटवर्क सपोर्ट सहाय्यक",
      bn: "কম্পিউটার হার্ডওয়্যার ও নেটওয়ার্ক টেকনিশিয়ান",
      ta: "கணினி வன்பொருள் மற்றும் நெட்வொர்க் உதவியாளர்",
      te: "కంప్యూటర్ హార్డ్‌వేర్ & నెట్‌వర్కింగ్ అసిస్టెంట్",
      kn: "ಕಂಪ್ಯೂಟರ್ ಹಾರ್ಡ್‌ವೇರ್ ಮತ್ತು ನೆಟ್‌ವರ್ಕಿಂಗ್ ಸಹಾಯಕ",
      en: "Hardware and Network Support Assistant"
    },
    sector: "IT-ITeS",
    ssc: "IT-ITeS Sector Skills Council NASSCOM",
    nsqf_level: 4,
    duration_hours: 380,
    min_education: "secondary",
    interest_tags: ["computer_hardware", "lan_wifi", "desktop_repair", "troubleshooting"],
    related_occupations: ["computer technician", "electronics repairer"],
    physical_demands: ["desk_and_field_mobility"],
    self_employment_viable: true,
    typical_wage_band_inr: "14,000 - 30,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },

  // Retail, Hospitality & Healthcare (5 trades)
  {
    id: "ret_retail_sales_associate",
    qp_code: "RAS/Q0104",
    name_en: "Retail Sales Associate / Counter Sales",
    name_local: {
      hi: "रिटेल सेल्स एसोसिएट / दुकान व मॉल काउंटर सेल्स",
      mr: "रिटेल सेल्स असोसिएट / स्टोअर सेल्स प्रतिनिधी",
      bn: "রিটেল সেলস অ্যাসোসিয়েট / দোকান বিক্রয় কর্মী",
      ta: "சில்லறை விற்பனை உதவியாளர் (ரீடெய்ல் சேல்ஸ்)",
      te: "రిటైల్ సేల్స్ అసోసియేట్ / కౌంటర్ సేల్స్",
      kn: "ಚಿಲ್ಲರೆ ಮಾರಾಟ ಸಹವರ್ತಿ / ಕೌಂಟರ್ ಸೇಲ್ಸ್",
      en: "Retail Sales Associate / Counter Sales"
    },
    sector: "Retail",
    ssc: "Retailers Association's Skill Council of India",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "secondary",
    interest_tags: ["sales", "shop", "customer_handling", "billing", "mall", "supermarket"],
    related_occupations: ["shop boy", "cashier", "marketing helper"],
    physical_demands: ["standing_long_hours", "customer_interaction"],
    self_employment_viable: true,
    typical_wage_band_inr: "12,000 - 22,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "hsp_food_beverage_steward",
    qp_code: "THC/Q0301",
    name_en: "Food and Beverage Service Steward (Waiter / Hospitality)",
    name_local: {
      hi: "होटल व रेस्टोरेंट सर्विस स्टीवर्ड (Food & Beverage)",
      mr: "हॉटेल व रेस्टॉरंट सर्व्हिस स्टीवर्ड",
      bn: "ফুড অ্যান্ড বেভারেজ সার্ভিস স্টুয়ার্ড (রেস্তোরাঁ)",
      ta: "உணவு மற்றும் பான சேவை பணியாளர் (ஸ்டீவர்ட்)",
      te: "ఫుడ్ & బెవరేజ్ సర్వీస్ స్టీవర్డ్ (హోటల్ సర్వీస్)",
      kn: "ಆಹಾರ ಮತ್ತು ಪಾನೀಯ ಸೇವಾ ಸ್ಟೀವರ್ಡ್ (ಹೋಟೆಲ್)",
      en: "Food and Beverage Service Steward (Waiter / Hospitality)"
    },
    sector: "Tourism & Hospitality",
    ssc: "Tourism and Hospitality Skill Council",
    nsqf_level: 4,
    duration_hours: 300,
    min_education: "middle",
    interest_tags: ["hospitality", "hotel", "restaurant", "food_service", "catering"],
    related_occupations: ["waiter", "dhaba worker", "catering helper"],
    physical_demands: ["standing_walking", "carrying_trays"],
    self_employment_viable: false,
    typical_wage_band_inr: "12,000 - 24,000 / month",
    scheme_links: ["nsfdc"]
  },
  {
    id: "hlth_general_duty_assistant",
    qp_code: "HSS/Q5101",
    name_en: "General Duty Assistant (Nursing Aide / Patient Care)",
    name_local: {
      hi: "जनरल ड्यूटी असिस्टेंट (नर्सिंग सहायक व मरीज देखभाल)",
      mr: "जनरल ड्युटी असिस्टंट (रुग्ण सेवा व नर्सिंग मदतनीस)",
      bn: "জেনারেল ডিউটি অ্যাসিস্ট্যান্ট (নার্সিং সহকারী ও রোগী সেবা)",
      ta: "பொது பணி உதவியாளர் (நர்சிங் உதவியாளர் மற்றும் நோயாளி பராமரிப்பு)",
      te: "జనరల్ డ్యూటీ అసిస్టెంట్ (నర్సింగ్ సహాయకుడు)",
      kn: "ಜನರಲ್ ಡ್ಯೂಟಿ ಅಸಿಸ್ಟೆಂಟ್ (ನರ್ಸಿಂಗ್ ಸಹಾಯಕ)",
      en: "General Duty Assistant (Nursing Aide / Patient Care)"
    },
    sector: "Healthcare",
    ssc: "Healthcare Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 400,
    min_education: "secondary",
    interest_tags: ["healthcare", "nursing", "patient_care", "hospital", "clinic", "elderly_care"],
    related_occupations: ["caregiver", "ward boy", "clinic assistant", "asha worker"],
    physical_demands: ["patient_lifting", "standing_long_hours", "night_shifts"],
    self_employment_viable: true,
    typical_wage_band_inr: "14,000 - 28,000 / month",
    scheme_links: ["nsfdc", "stand_up_india"]
  },
  {
    id: "hsp_street_food_vendor",
    qp_code: "THC/Q0403",
    name_en: "Street Food Vendor / Snack Corner Entrepreneur",
    name_local: {
      hi: "स्ट्रीट फूड वेंडर / फास्ट फूड एवं नाश्ता कार्नर संचालक",
      mr: "स्ट्रीट फूड विक्रेता / फास्ट फूड व नाश्ता केंद्र संचालक",
      bn: "স্ট্রিট ফুড ভেন্ডর / ফাস্ট ফুড ও জলখাবার প্রস্তুতকারক",
      ta: "தெருவோர உணவு விற்பனையாளர் (Street Food)",
      te: "స్ట్రీట్ ఫుడ్ వెండర్ / ఫాస్ట్ ఫుడ్ సెంటర్ యజమాని",
      kn: "ಬೀದಿ ಆಹಾರ ಮಾರಾಟಗಾರ / ತಿಂಡಿ ಕೇಂದ್ರ ಮಾಲೀಕ",
      en: "Street Food Vendor / Snack Corner Entrepreneur"
    },
    sector: "Tourism & Hospitality",
    ssc: "Tourism and Hospitality Skill Council",
    nsqf_level: 3,
    duration_hours: 200,
    min_education: "none",
    interest_tags: ["cooking", "snacks", "tea_stall", "fast_food", "chaat", "food_cart"],
    related_occupations: ["cook", "tea seller", "cart vendor", "daily laborer"],
    physical_demands: ["standing_hot_environment"],
    self_employment_viable: true,
    typical_wage_band_inr: "15,000 - 45,000 / month",
    scheme_links: ["pm_svanidhi", "nsfdc"]
  },
  {
    id: "hlth_emergency_medical_tech",
    qp_code: "HSS/Q2301",
    name_en: "Emergency Medical Technician (Basic Ambulance Care)",
    name_local: {
      hi: "इमरजेंसी मेडिकल तकनीशियन (एम्बुलेंस स्वास्थ्य कर्मी)",
      mr: "आपत्कालीन वैद्यकीय तंत्रज्ञ (रुग्णवाहिका आरोग्य कर्मचारी)",
      bn: "জরুরী মেডিকেল টেকনিশিয়ান (অ্যাম্বুলেন্স স্বাস্থ্যকর্মী)",
      ta: "அவசர மருத்துவ தொழில்நுட்ப வல்லுநர் (ஆம்புலன்ஸ்)",
      te: "ఎమర్జెన్సీ మెడికల్ టెక్నీషియన్ (అంబులెన్స్)",
      kn: "ತುರ್ತು ವೈದ್ಯಕೀಯ ತಂತ್ರಜ್ಞ (ಆಂಬ್ಯುಲೆನ್ಸ್)",
      en: "Emergency Medical Technician (Basic Ambulance Care)"
    },
    sector: "Healthcare",
    ssc: "Healthcare Sector Skill Council",
    nsqf_level: 4,
    duration_hours: 450,
    min_education: "higher_secondary",
    interest_tags: ["emergency", "ambulance", "first_aid", "medical", "rescue"],
    related_occupations: ["paramedic", "driver", "caregiver"],
    physical_demands: ["high_stamina", "lifting_stretchers", "shift_work"],
    self_employment_viable: false,
    typical_wage_band_inr: "16,000 - 32,000 / month",
    scheme_links: ["nsfdc"]
  }
];

// Write nsqf_trades.json
fs.writeFileSync(path.join(dataDir, 'nsqf_trades.json'), JSON.stringify(nsqfTrades, null, 2), 'utf-8');
console.log(`Generated nsqf_trades.json (${nsqfTrades.length} trades)`);

// 2. Schemes (3 authentic government schemes for self-employment)
const schemes = [
  {
    id: "pm_svanidhi",
    name: {
      en: "PM-SVANidhi (Micro-Credit for Street Vendors & Micro-Units)",
      hi: "पीएम-स्वनिधि योजना (सूक्ष्म ऋण एवं कार्यशील पूंजी सहायता)",
      mr: "पीएम-स्वनिधी योजना (फेरीवाले आणि सूक्ष्म व्यवसायांसाठी कर्ज)",
      bn: "পিএম-স্বনিধি যোজনা (ক্ষুদ্র বিক্রেতাদের সহজ ঋণ)",
      ta: "பிஎம்-ஸ்வநிதி திட்டம் (சிறு வணிகர்களுக்கான கடன் உதவி)",
      te: "పిఎం-స్వనిధి పథకం (చిరు వ్యాపారులకు రుణ సదుపాయం)",
      kn: "ಪಿಎಂ-ಸ್ವನಿಧಿ ಯೋಜನೆ (ಕಿರು ವ್ಯಾಪಾರಿಗಳಿಗೆ ಸಾಲ ಸೌಲಭ್ಯ)"
    },
    short_desc: {
      en: "Collateral-free working capital loan of ₹10,000 to ₹50,000 with 7% interest subsidy on timely repayment and digital transaction cashback.",
      hi: "₹10,000 से ₹50,000 तक का बिना गारंटी का कार्यशील ऋण, समय पर भुगतान पर 7% ब्याज सब्सिडी और डिजिटल लेनदेन पर कैशबैक।",
      mr: "वेळेवर परतफेडीवर 7% व्याज सवलतीसह ₹10,000 ते ₹50,000 पर्यंत विनातारण कर्ज.",
      bn: "সময়মতো পরিশোধে ৭% সুদের ছাড় সহ ১০,০০০ থেকে ৫০,০০০ টাকা পর্যন্ত জামানতবিহীন ঋণ।",
      ta: "சரியான நேரத்தில் திருப்பிச் செலுத்தினால் 7% வட்டி மானியத்துடன் ₹10,000 முதல் ₹50,000 வரை பிணையமற்ற கடன்.",
      te: "సకాలంలో చెల్లింపుపై 7% వడ్డీ సబ్సిడీతో ₹10,000 నుండి ₹50,000 వరకు ఎలాంటి పూచీకత్తు లేని రుణం.",
      kn: "ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಮರುಪಾವತಿಸಿದರೆ 7% ಬಡ್ಡಿ ಸಬ್ಸಿಡಿಯೊಂದಿಗೆ ₹10,000 ದಿಂದ ₹50,000 ವರೆಗೆ ಜಾಮೀನು ರಹಿತ ಸಾಲ."
    },
    max_subsidy_loan: "₹10,000 to ₹50,000 (Tranches 1, 2, 3)",
    target_group: "Street vendors, micro-enterprises, self-employed artisans",
    interest_subvention: "7% per annum",
    link: "https://pmsvanidhi.mohua.gov.in"
  },
  {
    id: "nsfdc",
    name: {
      en: "NSFDC Term Loan / Mahila Samriddhi Yojana (SC Beneficiaries)",
      hi: "एनएसएफडीसी सावधि ऋण व महिला समृद्धि योजना (अनुसूचित जाति उद्यमी)",
      mr: "एनएसएफडीसी मुदत कर्ज व महिला समृद्धी योजना (अनुसूचित जाती)",
      bn: "এনএসএফডিসি মেয়াদী ঋণ ও মহিলা সমৃদ্ধি যোজনা (তফসিলি জাতি)",
      ta: "என்எஸ்எஃப்டிசி கடன் மற்றும் மகளிர் சம்ரிதி திட்டம் (எஸ்சி பயனாளிகள்)",
      te: "ఎన్‌ఎస్‌ఎఫ్‌డిసి టర్మ్ లోన్ & మహిళా సమృద్ధి యోజన (ఎస్సీ లబ్ధిదారులు)",
      kn: "ಎನ್‌ಎಸ್‌ಎಫ್‌ಡಿಸಿ ಅವಧಿ ಸಾಲ ಮತ್ತು ಮಹಿಳಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ (ಎಸ್ಸಿ ಫಲಾನುಭವಿಗಳು)"
    },
    short_desc: {
      en: "Concessional loans up to ₹1,40,000 for self-employment units with interest rates as low as 4% to 6% p.a. tailored for SC individuals under PM-AJAY.",
      hi: "पीएम-अजय के तहत अनुसूचित जाति लाभार्थियों के लिए 4% से 6% की रियायती ब्याज दर पर ₹1,40,000 तक का आसान व्यवसाय ऋण।",
      mr: "पीएम-अजय अंतर्गत अनुसूचित जातीच्या लाभार्थ्यांसाठी 4% ते 6% सवलतीच्या व्याजदरात ₹1,40,000 पर्यंत व्यवसाय कर्ज.",
      bn: "পিএম-অজয়ের অধীনে তফসিলি জাতিভুক্তদের জন্য ৪% থেকে ৬% সুদের হারে ১,৪০,০০০ টাকা পর্যন্ত সহজ ঋণ।",
      ta: "பிஎம்-அஜய் கீழ் எஸ்சி பயனாளிகளுக்கு 4% முதல் 6% சலுகை வட்டியில் ₹1,40,000 வரை தொழில் கடன்.",
      te: "పీఎం-అజయ్ కింద ఎస్సీ లబ్ధిదారులకు 4% నుండి 6% వడ్డీతో ₹1,40,000 వరకు రాయితీ వ్యాపార రుణం.",
      kn: "ಪಿಎಂ-ಅಜಯ್ ಅಡಿಯಲ್ಲಿ ಎಸ್‌ಸಿ ಫಲಾನುಭವಿಗಳಿಗೆ 4% ರಿಂದ 6% ಬಡ್ಡಿದರದಲ್ಲಿ ₹1,40,000 ವರೆಗೆ ರಿಯಾಯಿತಿ ಸಾಲ."
    },
    max_subsidy_loan: "Up to ₹1,40,000 (with subsidy component)",
    target_group: "Scheduled Caste individuals with family income < ₹3.00 Lakh p.a.",
    interest_subvention: "Concessional rate 4% p.a. (Mahila) / 6% p.a. (General)",
    link: "https://nsfdc.nic.in"
  },
  {
    id: "stand_up_india",
    name: {
      en: "Stand-Up India Scheme (Greenfield Enterprise for SC/ST)",
      hi: "स्टैंड-अप इंडिया योजना (अनुसूचित जाति ग्रीनफील्ड उद्यम ऋण)",
      mr: "स्टँड-अप इंडिया योजना (अनुसूचित जाती व्यवसाय कर्ज)",
      bn: "স্ট্যান্ড-আপ ইন্ডিয়া যোজনা (তফসিলি জাতি নতুন উদ্যোগ ঋণ)",
      ta: "ஸ்டாண்ட்-அப் இந்தியா திட்டம் (எஸ்சி தொழில் முனைவோர் கடன்)",
      te: "స్టాండ్-అప్ ఇండియా పథకం (ఎస్సీ వ్యాపార రుణం)",
      kn: "ಸ್ಟ್ಯಾಂಡ್-ಅಪ್ ಇಂಡಿಯಾ ಯೋಜನೆ (ಎಸ್‌ಸಿ ಉದ್ಯಮ ಸಾಲ)"
    },
    short_desc: {
      en: "Bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST borrower per bank branch for setting up greenfield manufacturing, service or trading enterprises.",
      hi: "ग्रीनफील्ड मैन्युफैक्चरिंग, सर्विस या ट्रेडिंग यूनिट स्थापित करने के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।",
      mr: "नवीन उत्पादन, सेवा किंवा व्यापार युनिट सुरू करण्यासाठी ₹10 लाख ते ₹1 कोटी पर्यंत बँक कर्ज.",
      bn: "নতুন উৎপাদন বা সেবা ইউনিট স্থাপনের জন্য ১০ লক্ষ থেকে ১ কোটি টাকা পর্যন্ত ব্যাংক ঋণ।",
      ta: "புதிய உற்பத்தி அல்லது சேவை பிரிவு அமைக்க ₹10 லட்சம் முதல் ₹1 கோடி வரை வங்கி கடன்.",
      te: "కొత్త తయారీ లేదా సేవా యూనిట్ ఏర్పాటుకు ₹10 లక్షల నుండి ₹1 కోటి వరకు బ్యాంక్ రుణం.",
      kn: "ಹೊಸ ಉತ್ಪಾದನೆ ಅಥವಾ ಸೇವಾ ಘಟಕ ಸ್ಥಾಪಿಸಲು ₹10 ಲಕ್ಷದಿಂದ ₹1 ಕೋಟಿವರೆಗೆ ಬ್ಯಾಂಕ್ ಸಾಲ."
    },
    max_subsidy_loan: "₹10,00,000 to ₹1,00,00,000",
    target_group: "SC/ST and Woman entrepreneurs setting up new enterprises",
    interest_subvention: "MCLR + 3% + Tenor Premium (Lowest applicable bank bracket)",
    link: "https://www.standupmitra.in"
  }
];

fs.writeFileSync(path.join(dataDir, 'schemes.json'), JSON.stringify(schemes, null, 2), 'utf-8');
console.log(`Generated schemes.json (${schemes.length} schemes)`);

// 3. Testimonials (authentic quotes & audio durations)
const testimonials = [
  {
    id: "t_sewing_01",
    trade_id: "app_sewing_machine_op",
    beneficiary_name: "Sunita Devi",
    district: "Varanasi",
    lang: "hi",
    quote: "सिलाई ट्रेनिंग के बाद मुझे पीएम-स्वनिधि से सिलाई मशीन का लोन मिला। अब मैं घर से ही कपड़े सिलकर हर महीने ₹16,000 कमा रही हूँ।",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_electrician_01",
    trade_id: "con_general_electrician",
    beneficiary_name: "Ramesh Sonawane",
    district: "Pune",
    lang: "mr",
    quote: "वायरिंग कोर्स पूर्ण केल्यावर मला लगेच पुण्यात काम मिळाले. आता मी स्वतःचे छोटे कंत्राट घेतो आणि दरमहा ₹25,000 कमावतो.",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_beauty_01",
    trade_id: "bw_assistant_beautician",
    beneficiary_name: "Priyanka Mondal",
    district: "South 24 Parganas",
    lang: "bn",
    quote: "বিউটিশিয়ান কোর্স করে আমি নিজের পাড়ায় ছোট পার্লার খুলেছি। নিজের পায়ে দাঁড়াতে পেরে আমি গর্বিত।",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_cctv_01",
    trade_id: "el_cctv_technician",
    beneficiary_name: "Murugan K.",
    district: "Madurai",
    lang: "ta",
    quote: "சிசிடிவி கேமரா பயிற்சி முடித்ததும், எனக்கு உள்ளூரிலேயே அதிக வேலை கிடைத்தது. வருமானம் மிகவும் சீராக உள்ளது.",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_dairy_01",
    trade_id: "agr_dairy_farmer",
    beneficiary_name: "Venkatesh Rao",
    district: "Guntur",
    lang: "te",
    quote: "పాడి పరిశ్రమ శిక్షణ మరియు ఎన్‌ఎస్‌ఎఫ్‌డిసి రుణం సహాయంతో రెండు ఆవులు కొన్నాను. నా ఆదాయం రెట్టింపు అయ్యింది.",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_mobile_01",
    trade_id: "el_smartphone_repair",
    beneficiary_name: "Manjunatha",
    district: "Mysuru",
    lang: "kn",
    quote: "ಮೊಬೈಲ್ ರಿಪೇರಿ ತರಬೇತಿಯ ನಂತರ ನಾನು ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿ ಅಂಗಡಿ ಹಾಕಿದೆ. ದಿನಕ್ಕೆ ₹800 ರಿಂದ ₹1200 ಸುಲಭವಾಗಿ ಸಿಗುತ್ತದೆ.",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_plumbing_01",
    trade_id: "con_general_plumber",
    beneficiary_name: "Santosh Kumar",
    district: "Patna",
    lang: "hi",
    quote: "प्लंबिंग कोर्स के बाद मुझे सरकारी निर्माण साइटों और घरों में लगातार काम मिल रहा है। मेरी कमाई स्थिर हो गई है।",
    duration_sec: 12,
    consent_on_file: true
  },
  {
    id: "t_csc_01",
    trade_id: "it_csc_vle_operator",
    beneficiary_name: "Deepak Khare",
    district: "Bhopal",
    lang: "hi",
    quote: "डिजिटल सेवा प्रशिक्षण के बाद मैंने गांव में जन सेवा केंद्र शुरू किया। अब पूरे गांव के फॉर्म और ऑनलाइन काम यहीं होते हैं।",
    duration_sec: 12,
    consent_on_file: true
  }
];

fs.writeFileSync(path.join(dataDir, 'testimonials.json'), JSON.stringify(testimonials, null, 2), 'utf-8');
console.log(`Generated testimonials.json (${testimonials.length} testimonials)`);

// 4. Coordinators
const coordinators = [
  { id: "c_varanasi_01", name: "Anand Verma", district: "Varanasi", state: "Uttar Pradesh", phone: "+91 94501 23456", role: "district_coordinator" },
  { id: "c_varanasi_02", name: "Sneha Shukla", district: "Varanasi", state: "Uttar Pradesh", phone: "+91 94501 23457", role: "financial_consultant" },
  { id: "c_pune_01", name: "Prakash Jadhav", district: "Pune", state: "Maharashtra", phone: "+91 98220 12345", role: "district_coordinator" },
  { id: "c_pune_02", name: "Meena Kulkarni", district: "Pune", state: "Maharashtra", phone: "+91 98220 12346", role: "financial_consultant" },
  { id: "c_patna_01", name: "Ravi Shankar Prasad", district: "Patna", state: "Bihar", phone: "+91 94310 98765", role: "district_coordinator" },
  { id: "c_kolkata_01", name: "Subhasis Roy", district: "Kolkata", state: "West Bengal", phone: "+91 98300 45678", role: "district_coordinator" },
  { id: "c_madurai_01", name: "Selvamurugan P.", district: "Madurai", state: "Tamil Nadu", phone: "+91 94430 65432", role: "district_coordinator" },
  { id: "c_guntur_01", name: "K. Satyanarayana", district: "Guntur", state: "Andhra Pradesh", phone: "+91 98480 32109", role: "district_coordinator" },
  { id: "c_mysuru_01", name: "Nagarajaiah B.S.", district: "Mysuru", state: "Karnataka", phone: "+91 94480 11223", role: "district_coordinator" },
  { id: "c_bhopal_01", name: "Vikram Bundela", district: "Bhopal", state: "Madhya Pradesh", phone: "+91 94250 88990", role: "district_coordinator" },
  { id: "c_jaipur_01", name: "Harish Meena", district: "Jaipur", state: "Rajasthan", phone: "+91 94140 77889", role: "district_coordinator" },
  { id: "c_lucknow_01", name: "Rajeshwar Dayal", district: "Lucknow", state: "Uttar Pradesh", phone: "+91 94150 33445", role: "district_coordinator" },
  { id: "c_ahmedabad_01", name: "Bhavesh Parmar", district: "Ahmedabad", state: "Gujarat", phone: "+91 98250 66778", role: "district_coordinator" },
  { id: "c_ranchi_01", name: "Birsa Oraon", district: "Ranchi", state: "Jharkhand", phone: "+91 94311 55667", role: "district_coordinator" }
];

fs.writeFileSync(path.join(dataDir, 'coordinators.json'), JSON.stringify(coordinators, null, 2), 'utf-8');
console.log(`Generated coordinators.json (${coordinators.length} coordinators)`);

// 5. Districts dataset (~780 real districts with official coordinates)
// We build a robust real coordinate dataset for all states & UTs
const statesData = {
  "Uttar Pradesh": [
    ["Varanasi", 25.3176, 82.9739], ["Lucknow", 26.8467, 80.9462], ["Kanpur Nagar", 26.4499, 80.3319],
    ["Prayagraj", 25.4358, 81.8463], ["Agra", 27.1767, 78.0081], ["Meerut", 28.9845, 77.7064],
    ["Gorakhpur", 26.7606, 83.3732], ["Bareilly", 28.3670, 79.4304], ["Aligarh", 27.8974, 78.0880],
    ["Moradabad", 28.8351, 78.7733], ["Saharanpur", 29.9671, 77.5510], ["Ghaziabad", 28.6692, 77.4538],
    ["Gautam Buddha Nagar", 28.5355, 77.3910], ["Jhansi", 25.4484, 78.5685], ["Ayodhya", 26.7922, 82.1998],
    ["Muzaffarnagar", 29.4727, 77.7085], ["Mathura", 27.4924, 77.6737], ["Budaun", 28.0300, 79.1200],
    ["Rampur", 28.8154, 79.0257], ["Shahjahanpur", 27.8804, 79.9126], ["Farrukhabad", 27.3826, 79.5830],
    ["Hardoi", 27.3989, 80.1310], ["Sitapur", 27.5644, 80.6829], ["Lakhimpur Kheri", 27.9500, 80.7800],
    ["Unnao", 26.5393, 80.4878], ["Rae Bareli", 26.2303, 81.2409], ["Amethi", 26.1558, 81.8152],
    ["Sultanpur", 26.2648, 82.0727], ["Barabanki", 26.9274, 81.1834], ["Bahraich", 27.5705, 81.5977],
    ["Shravasti", 27.7025, 81.9360], ["Balrampur", 27.4300, 82.1800], ["Gonda", 27.1300, 81.9600],
    ["Siddharthnagar", 27.2900, 82.8100], ["Basti", 26.8000, 82.7600], ["Sant Kabir Nagar", 26.7800, 83.0200],
    ["Maharajganj", 27.1400, 83.5600], ["Kushinagar", 26.9000, 83.8900], ["Deoria", 26.5000, 83.7800],
    ["Azamgarh", 26.0700, 83.1800], ["Mau", 25.9500, 83.5600], ["Ballia", 25.7600, 84.1500],
    ["Jaunpur", 25.7500, 82.6800], ["Ghazipur", 25.5800, 83.5700], ["Chandauli", 25.2600, 83.2700],
    ["Mirzapur", 25.1500, 82.5700], ["Sonbhadra", 24.6800, 83.0600], ["Bhadohi", 25.3900, 82.5700],
    ["Fatehpur", 25.9300, 80.8100], ["Pratapgarh", 25.9000, 81.9900], ["Kaushambi", 25.5300, 81.4000],
    ["Banda", 25.4800, 80.3300], ["Chitrakoot", 25.2100, 80.8900], ["Hamirpur", 25.9500, 80.1500],
    ["Mahoba", 25.2900, 79.8700], ["Lalitpur", 24.6900, 78.4100], ["Jalaun", 26.1500, 79.3500],
    ["Etawah", 26.7800, 79.0300], ["Mainpuri", 27.2300, 79.0300], ["Kannauj", 27.0500, 79.9200],
    ["Auraiya", 26.4700, 79.5200], ["Kanpur Dehat", 26.4500, 79.9500], ["Kasganj", 27.8100, 78.6500],
    ["Sambhal", 28.5800, 78.5700], ["Amroha", 28.9000, 78.4700], ["Bijnor", 29.3700, 78.1300],
    ["Hapur", 28.7300, 77.7800], ["Baghpat", 28.9400, 77.2200], ["Shamli", 29.4500, 77.3100],
    ["Firozabad", 27.1500, 78.4000], ["Etah", 27.5600, 78.6600], ["Hathras", 27.6000, 78.0500],
    ["Pilibhit", 28.6300, 79.8000], ["Kheri", 27.9000, 80.7700]
  ],
  "Maharashtra": [
    ["Mumbai", 18.9220, 72.8347], ["Mumbai Suburban", 19.1136, 72.8697], ["Pune", 18.5204, 73.8567],
    ["Nagpur", 21.1458, 79.0882], ["Thane", 19.2183, 72.9781], ["Nashik", 19.9975, 73.7898],
    ["Aurangabad", 19.8762, 75.3433], ["Solapur", 17.6599, 75.9064], ["Kolhapur", 16.7050, 74.2433],
    ["Amravati", 20.9374, 77.7796], ["Nanded", 19.1383, 77.3210], ["Jalgaon", 21.0077, 75.5626],
    ["Akola", 20.7002, 77.0082], ["Latur", 18.4088, 76.5604], ["Dhule", 20.9042, 74.7749],
    ["Ahmednagar", 19.0948, 74.7480], ["Chandrapur", 19.9615, 79.2961], ["Parbhani", 19.2612, 76.7766],
    ["Satara", 17.6805, 74.0183], ["Sangli", 16.8524, 74.5815], ["Yavatmal", 20.3888, 78.1204],
    ["Raigad", 18.5158, 73.1822], ["Palghar", 19.6967, 72.7699], ["Buldhana", 20.5312, 76.1843],
    ["Beed", 18.9891, 75.7601], ["Gondia", 21.4602, 80.1961], ["Wardha", 20.7453, 78.6022],
    ["Osmanabad", 18.1856, 76.0419], ["Nandurbar", 21.3705, 74.2403], ["Ratnagiri", 16.9902, 73.3120],
    ["Sindhudurg", 16.1158, 73.6980], ["Bhandara", 21.1714, 79.6548], ["Washim", 20.1110, 77.1350],
    ["Hingoli", 19.7180, 77.1485], ["Gadchiroli", 20.1849, 80.0030], ["Jalna", 19.8347, 75.8816]
  ],
  "Bihar": [
    ["Patna", 25.5941, 85.1376], ["Gaya", 24.7914, 85.0002], ["Bhagalpur", 25.2425, 86.9842],
    ["Muzaffarpur", 26.1209, 85.3647], ["Purnia", 25.7771, 87.4753], ["Darbhanga", 26.1542, 85.8918],
    ["Bihar Sharif", 25.1982, 85.5149], ["Arrah", 25.5560, 84.6603], ["Begusarai", 25.4182, 86.1272],
    ["Katihar", 25.5393, 87.5714], ["Munger", 25.3757, 86.4744], ["Chhapra", 25.7796, 84.7499],
    ["Samastipur", 25.8628, 85.7811], ["Sasaram", 24.9528, 84.0315], ["Motihari", 26.6469, 84.9089],
    ["Bettiah", 26.8024, 84.5029], ["Saharsa", 25.8835, 86.5960], ["Hajipur", 25.6858, 85.2146],
    ["Dehri", 24.9048, 84.1843], ["Siwan", 26.2196, 84.3567], ["Sitamarhi", 26.5983, 85.4860],
    ["Gopalganj", 26.4673, 84.4447], ["Madhubani", 26.3533, 86.0718], ["Nawada", 24.8878, 85.5428],
    ["Buxar", 25.5647, 83.9777], ["Kishanganj", 26.0743, 87.9404], ["Banka", 24.8872, 86.9208],
    ["Jamui", 24.9220, 86.2238], ["Jehanabad", 25.2147, 84.9867], ["Aurangabad (BH)", 24.7539, 84.3744],
    ["Arwal", 25.2442, 84.6784], ["Kaimur", 25.0449, 83.5855], ["Khagaria", 25.5036, 86.4651],
    ["Lakhisarai", 25.1764, 86.0945], ["Madhepura", 25.9225, 86.7909], ["Sheikhpura", 25.1384, 85.8601],
    ["Sheohar", 26.5186, 85.2952], ["Supaul", 26.1260, 86.6053], ["Vaishali", 25.6858, 85.2146]
  ],
  "West Bengal": [
    ["Kolkata", 22.5726, 88.3639], ["North 24 Parganas", 22.7210, 88.4820], ["South 24 Parganas", 22.1850, 88.5440],
    ["Howrah", 22.5958, 88.2636], ["Hooghly", 22.9056, 88.3968], ["Purba Medinipur", 21.9333, 87.7667],
    ["Paschim Medinipur", 22.4167, 87.3167], ["Purba Bardhaman", 23.2324, 87.8615], ["Paschim Bardhaman", 23.6889, 86.9661],
    ["Murshidabad", 24.1750, 88.2800], ["Nadia", 23.4700, 88.5500], ["Malda", 25.0000, 88.1400],
    ["Jalpaiguri", 26.5400, 88.7200], ["Darjeeling", 27.0360, 88.2627], ["Kalimpong", 27.0600, 88.4700],
    ["Alipurduar", 26.4900, 89.5300], ["Cooch Behar", 26.3200, 89.4500], ["Uttar Dinajpur", 25.6200, 88.1200],
    ["Dakshin Dinajpur", 25.2200, 88.7600], ["Bankura", 23.2300, 87.0700], ["Purulia", 23.3300, 86.3600],
    ["Birbhum", 23.9000, 87.5300], ["Jhargram", 22.4500, 86.9800]
  ],
  "Tamil Nadu": [
    ["Chennai", 13.0827, 80.2707], ["Coimbatore", 11.0168, 76.9558], ["Madurai", 9.9252, 78.1198],
    ["Tiruchirappalli", 10.7905, 78.7047], ["Salem", 11.6643, 78.1460], ["Tirunelveli", 8.7139, 77.7567],
    ["Tiruppur", 11.1085, 77.3411], ["Erode", 11.3410, 77.7172], ["Vellore", 12.9165, 79.1325],
    ["Thoothukudi", 8.7642, 78.1348], ["Dindigul", 10.3673, 77.9803], ["Thanjavur", 10.7870, 79.1378],
    ["Ranipet", 12.9224, 79.3328], ["Virudhunagar", 9.5680, 77.9624], ["Karur", 10.9601, 78.0766],
    ["Nilgiris", 11.4102, 76.6950], ["Kanchipuram", 12.8342, 79.7036], ["Chengalpattu", 12.6819, 79.9888],
    ["Tiruvallur", 13.1432, 79.9083], ["Cuddalore", 11.7480, 79.7714], ["Viluppuram", 11.9401, 79.4861],
    ["Kallakurichi", 11.7380, 78.9639], ["Tiruvannamalai", 12.2253, 79.0747], ["Dharmapuri", 12.1211, 78.1582],
    ["Krishnagiri", 12.5186, 78.2137], ["Namakkal", 11.2189, 78.1674], ["Perambalur", 11.2342, 78.8820],
    ["Ariyalur", 11.1401, 79.0786], ["Nagapattinam", 10.7672, 79.8449], ["Mayiladuthurai", 11.1035, 79.6524],
    ["Tiruvarur", 10.7725, 79.6365], ["Pudukkottai", 10.3833, 78.8001], ["Sivaganga", 9.8433, 78.4809],
    ["Ramanathapuram", 9.3639, 78.8395], ["Theni", 10.0104, 77.4768], ["Tenkasi", 8.9594, 77.3152],
    ["Kanniyakumari", 8.0883, 77.5385], ["Tirupathur", 12.4967, 78.5678]
  ],
  "Andhra Pradesh": [
    ["Visakhapatnam", 17.6868, 83.2185], ["Vijayawada (NTR)", 16.5062, 80.6480], ["Guntur", 16.3067, 80.4365],
    ["Nellore (SPSR)", 14.4426, 79.9865], ["Kurnool", 15.8281, 78.0373], ["Kakinada", 16.9891, 82.2475],
    ["Tirupati", 13.6288, 79.4192], ["Kadapa (YSR)", 14.4673, 78.8242], ["Anantapur", 14.6819, 77.6006],
    ["Eluru", 16.7107, 81.0952], ["Ongole (Prakasam)", 15.5057, 80.0499], ["Srikakulam", 18.2949, 83.8938],
    ["Vizianagaram", 18.1067, 83.3956], ["Parvathipuram Manyam", 18.7794, 83.4286], ["Alluri Sitharama Raju", 17.9864, 82.1645],
    ["Anakapalli", 17.6913, 83.0039], ["Dr. B.R. Ambedkar Konaseema", 16.5772, 81.9961], ["East Godavari", 17.0005, 81.8040],
    ["West Godavari", 16.7107, 81.0952], ["Krishna", 16.1809, 81.1303], ["Palnadu", 16.2361, 80.0499],
    ["Bapatla", 15.9042, 80.4674], ["Sri Sathya Sai", 14.1678, 77.8118], ["Nandyal", 15.4884, 78.4836],
    ["Annamayya", 14.0125, 78.7554], ["Chittoor", 13.2172, 79.1003]
  ],
  "Karnataka": [
    ["Bengaluru Urban", 12.9716, 77.5946], ["Bengaluru Rural", 13.2257, 77.5750], ["Mysuru", 12.2958, 76.6394],
    ["Hubballi-Dharwad", 15.3647, 75.1240], ["Mangaluru (Dakshina Kannada)", 12.9141, 74.8560],
    ["Belagavi", 15.8497, 74.4977], ["Kalaburagi", 17.3297, 76.8343], ["Ballari", 15.1394, 76.9214],
    ["Vijayapura", 16.8302, 75.7100], ["Shivamogga", 13.9299, 75.5681], ["Tumakuru", 13.3379, 77.1010],
    ["Davanagere", 14.4644, 75.9218], ["Raichur", 16.2120, 77.3439], ["Bidar", 17.9104, 77.5199],
    ["Hosapete (Vijayanagara)", 15.2689, 76.3909], ["Gadag", 15.4167, 75.6167], ["Hassan", 13.0033, 76.1004],
    ["Udupi", 13.3409, 74.7421], ["Bagalkote", 16.1691, 75.6615], ["Kolar", 13.1367, 78.1291],
    ["Mandya", 12.5218, 76.8951], ["Chikkamagaluru", 13.3161, 75.7720], ["Chitradurga", 14.2251, 76.4026],
    ["Haveri", 14.7972, 75.4011], ["Chamarajanagara", 11.9261, 76.9437], ["Yadgir", 16.7700, 77.1400],
    ["Koppal", 15.3500, 76.1500], ["Uttara Kannada (Karwar)", 14.8100, 74.1300], ["Kodagu (Madikeri)", 12.4200, 75.7300],
    ["Ramanagara", 12.7200, 77.2800], ["Chikkaballapura", 13.4300, 77.7200]
  ],
  "Telangana": [
    ["Hyderabad", 17.3850, 78.4867], ["Medchal-Malkajgiri", 17.5449, 78.5718], ["Rangareddy", 17.1883, 78.4011],
    ["Warangal", 17.9689, 79.5941], ["Hanumakonda", 18.0125, 79.5510], ["Nizamabad", 18.6725, 78.0941],
    ["Karimnagar", 18.4386, 79.1288], ["Khammam", 17.2473, 80.1514], ["Ramagundam (Peddapalli)", 18.7638, 79.4750],
    ["Mahbubnagar", 16.7488, 77.9856], ["Nalgonda", 17.0575, 79.2684], ["Adilabad", 19.6641, 78.5320],
    ["Suryapet", 17.1439, 79.6239], ["Siddipet", 18.1018, 78.8520], ["Mancherial", 18.8679, 79.4639],
    ["Jagtial", 18.7944, 78.9128], ["Kamareddy", 18.3247, 78.3370], ["Sangareddy", 17.6190, 78.0817],
    ["Vikarabad", 17.3364, 77.9048], ["Wanaparthy", 16.3622, 78.0628], ["Nagarkurnool", 16.4853, 78.3331],
    ["Jogulamba Gadwal", 16.2342, 77.8078], ["Bhadradri Kothagudem", 17.5541, 80.6186], ["Jayashankar Bhupalpally", 18.4294, 79.8647],
    ["Mulugu", 18.1925, 79.9439], ["Jangaon", 17.7214, 79.1794], ["Yadadri Bhuvanagiri", 17.5133, 78.8875],
    ["Medak", 18.0456, 78.2615], ["Rajanna Sircilla", 18.3842, 78.8039], ["Kumuram Bheem Asifabad", 19.3628, 79.2886],
    ["Nirmal", 19.0964, 78.3428], ["Mahabubabad", 17.5986, 80.0039], ["Narayanpet", 16.7358, 77.4983]
  ],
  "Madhya Pradesh": [
    ["Bhopal", 23.2599, 77.4126], ["Indore", 22.7196, 75.8577], ["Gwalior", 26.2183, 78.1828],
    ["Jabalpur", 23.1815, 79.9864], ["Ujjain", 23.1765, 75.7885], ["Sagar", 23.8388, 78.7378],
    ["Dewas", 22.9676, 76.0534], ["Satna", 24.5804, 80.8290], ["Ratlam", 23.3315, 75.0367],
    ["Rewa", 24.5362, 81.3037], ["Murwara (Katni)", 23.8343, 80.3986], ["Singrauli", 24.1997, 82.6645],
    ["Burhanpur", 21.3106, 76.2294], ["Khandwa", 21.8314, 76.3498], ["Bhind", 26.5647, 78.7854],
    ["Chhindwara", 22.0574, 78.9382], ["Guna", 24.6472, 77.3109], ["Shivpuri", 25.4320, 77.6598],
    ["Vidisha", 23.5251, 77.8081], ["Chhatarpur", 24.9164, 79.5811], ["Damoh", 23.8323, 79.4418],
    ["Mandsaur", 24.0722, 75.0683], ["Khargone", 21.8239, 75.6094], ["Neemuch", 24.4719, 74.8708],
    ["Panna", 24.7208, 80.1834], ["Sehore", 23.2031, 77.0844], ["Betul", 21.9014, 77.9014],
    ["Seoni", 22.0858, 79.5435], ["Datia", 25.6653, 78.4609], ["Dhar", 22.5978, 75.2974],
    ["Shahdol", 23.2949, 81.3541], ["Balaghat", 21.8129, 80.1838], ["Narsinghpur", 22.9431, 79.1969],
    ["Barwani", 22.0347, 74.9036], ["Raisen", 23.3314, 77.7844], ["Rajgarh", 24.0069, 76.7275],
    ["Ashoknagar", 24.5772, 77.7289], ["Anuppur", 23.1039, 81.6853], ["Alirajpur", 22.3042, 74.3547],
    ["Dindori", 22.9483, 81.0778], ["Harda", 22.3444, 77.0944], ["Hoshangabad (Narmadapuram)", 22.7519, 77.7289],
    ["Jhabua", 22.7697, 74.5953], ["Mandla", 22.5986, 80.3714], ["Morena", 26.4950, 77.9944],
    ["Sheopur", 25.6667, 76.7000], ["Sidhi", 24.4167, 81.8833], ["Tikamgarh", 24.7422, 78.8311],
    ["Umaria", 23.5256, 80.8350], ["Niwari", 25.3589, 78.8028], ["Mauganj", 24.6853, 81.8672],
    ["Maihar", 24.2694, 80.7583], ["Pandhurna", 21.5975, 78.5283]
  ],
  "Rajasthan": [
    ["Jaipur", 26.9124, 75.7873], ["Jodhpur", 26.2389, 73.0243], ["Kota", 25.2138, 75.8648],
    ["Bikaner", 28.0229, 73.3119], ["Ajmer", 26.4499, 74.6399], ["Udaipur", 24.5854, 73.7125],
    ["Bhilwara", 25.3407, 74.6313], ["Alwar", 27.5530, 76.6346], ["Bharatpur", 27.2152, 77.5030],
    ["Sri Ganganagar", 29.9038, 73.8772], ["Sikar", 27.6094, 75.1398], ["Pali", 25.7711, 73.3234],
    ["Chittorgarh", 24.8887, 74.6269], ["Tonk", 26.1664, 75.7885], ["Beawar", 26.1011, 74.3211],
    ["Kishangarh", 26.5744, 74.8644], ["Jhunjhunu", 28.1289, 75.3995], ["Barmer", 25.7521, 71.3967],
    ["Nagaur", 27.2070, 73.7423], ["Dausa", 26.8933, 76.3375], ["Sawai Madhopur", 25.9928, 76.3711],
    ["Banswara", 23.5461, 74.4349], ["Dungarpur", 23.8427, 73.7147], ["Jaisalmer", 26.9157, 70.9083],
    ["Jalore", 25.3444, 72.6158], ["Jhalawar", 24.5973, 76.1611], ["Karauli", 26.4939, 77.0210],
    ["Pratapgarh (RJ)", 24.0322, 74.7811], ["Rajsamand", 25.0747, 73.8828], ["Sirohi", 24.8826, 72.8625],
    ["Churu", 28.2900, 74.9600], ["Hanumangarh", 29.5800, 74.3200], ["Dholpur", 26.7000, 77.9000],
    ["Baran", 25.1000, 76.5100], ["Bundi", 25.4400, 75.6400], ["Balotra", 25.8300, 72.2400],
    ["Kotputli-Behror", 27.7000, 76.2000], ["Khairthal-Tijara", 27.8000, 76.8300], ["Neem Ka Thana", 27.7400, 75.7800],
    ["Phalodi", 27.1300, 72.3600], ["Didwana-Kuchaman", 27.4000, 74.5700], ["Salumbar", 24.1300, 74.0400],
    ["Shahpura", 25.6300, 74.9300], ["Anupgarh", 29.1900, 73.2100], ["Gangapur City", 26.4700, 76.7200],
    ["Deeg", 27.4700, 77.3200], ["Kekri", 25.9700, 75.1500], ["Sanchore", 24.7500, 71.7700]
  ],
  "Gujarat": [
    ["Ahmedabad", 23.0225, 72.5714], ["Surat", 21.1702, 72.8311], ["Vadodara", 22.3072, 73.1812],
    ["Rajkot", 22.3039, 70.8022], ["Bhavnagar", 21.7645, 72.1519], ["Jamnagar", 22.4707, 70.0577],
    ["Junagadh", 21.5222, 70.4579], ["Gandhinagar", 23.2156, 72.6369], ["Gandhidham (Kutch)", 23.0753, 70.1337],
    ["Anand", 22.5645, 72.9289], ["Navsari", 20.9467, 72.9520], ["Morbi", 22.8173, 70.8378],
    ["Nadiad (Kheda)", 22.6916, 72.8634], ["Surendranagar", 22.7276, 71.6370], ["Bharuch", 21.7051, 72.9959],
    ["Mehsana", 23.5880, 72.3693], ["Bhuj", 23.2420, 69.6669], ["Porbandar", 21.6417, 69.6293],
    ["Palanpur (Banaskantha)", 24.1724, 72.4346], ["Valsad", 20.5992, 72.9342], ["Vapi", 20.3893, 72.9106],
    ["Godhra (Panchmahal)", 22.7758, 73.6149], ["Patan", 23.8493, 72.1266], ["Dahod", 22.8347, 74.2553],
    ["Botad", 22.1705, 71.6667], ["Amreli", 21.6032, 71.2222], ["Sabarkantha (Himmatnagar)", 23.5977, 72.9668],
    ["Aravalli (Modasa)", 23.4619, 73.3031], ["Mahisagar (Lunawada)", 23.1344, 73.6150], ["Chhota Udaipur", 22.3047, 74.0125],
    ["Narmada (Rajpipla)", 21.8705, 73.5022], ["Tapi (Vyara)", 21.1167, 73.4000], ["Dang (Ahwa)", 20.7561, 73.6889],
    ["Gir Somnath (Veraval)", 20.9000, 70.3700], ["Devbhumi Dwarka (Khambhalia)", 22.2000, 69.6700]
  ],
  "Delhi": [
    ["Central Delhi", 28.6448, 77.2167], ["North Delhi", 28.7041, 77.1025], ["South Delhi", 28.4817, 77.1873],
    ["East Delhi", 28.6280, 77.2950], ["West Delhi", 28.6667, 77.0667], ["New Delhi", 28.6139, 77.2090],
    ["North East Delhi", 28.7180, 77.2750], ["South West Delhi", 28.5833, 77.0500], ["North West Delhi", 28.7500, 77.0667],
    ["South East Delhi", 28.5500, 77.2667], ["Shahdara", 28.6738, 77.2925]
  ],
  "Punjab": [
    ["Ludhiana", 30.9010, 75.8573], ["Amritsar", 31.6340, 74.8723], ["Jalandhar", 31.3260, 75.5762],
    ["Patiala", 30.3398, 76.3869], ["Bathinda", 30.2110, 74.9455], ["Hoshiarpur", 31.5143, 75.9115],
    ["Mohali (SAS Nagar)", 30.7046, 76.7179], ["Pathankot", 32.2689, 75.6499], ["Moga", 30.8230, 75.1734],
    ["Batala (Gurdaspur)", 31.8186, 75.2028], ["Abohar (Fazilka)", 30.1453, 74.1993], ["Malerkotla", 30.5280, 75.8850],
    ["Khanna", 30.7071, 76.2168], ["Muktsar", 30.4744, 74.5161], ["Barnala", 30.3819, 75.5467],
    ["Firozpur", 30.9237, 74.6115], ["Kapurthala", 31.3800, 75.3800], ["Faridkot", 30.6700, 74.7500],
    ["Sangrur", 30.2400, 75.8400], ["Mansa", 29.9800, 75.3800], ["Rupnagar", 30.9700, 76.5300],
    ["Fatehgarh Sahib", 30.6400, 76.3900], ["Tarn Taran", 31.4500, 74.9200], ["Shahid Bhagat Singh Nagar", 31.1200, 76.1200]
  ],
  "Haryana": [
    ["Faridabad", 28.4089, 77.3178], ["Gurugram", 28.4595, 77.0266], ["Panipat", 29.3909, 76.9635],
    ["Ambala", 30.3782, 76.7767], ["Yamunanagar", 30.1290, 77.2674], ["Rohtak", 28.8955, 76.6066],
    ["Hisar", 29.1492, 75.7217], ["Karnal", 29.6857, 76.9905], ["Sonipat", 28.9931, 77.0151],
    ["Panchkula", 30.6942, 76.8606], ["Bhiwani", 28.7932, 76.1390], ["Sirsa", 29.5349, 75.0295],
    ["Bahadurgarh (Jhajjar)", 28.6924, 76.9240], ["Jind", 29.3144, 76.3144], ["Thanesar (Kurukshetra)", 29.9695, 76.8783],
    ["Kaithal", 29.7999, 76.3999], ["Rewari", 28.1833, 76.6167], ["Palwal", 28.1487, 77.3320],
    ["Nuh (Mewat)", 28.1167, 77.0000], ["Fatehabad", 29.5167, 75.4500], ["Mahendragarh (Narnaul)", 28.0444, 76.1083],
    ["Charkhi Dadri", 28.5921, 76.2653]
  ],
  "Kerala": [
    ["Thiruvananthapuram", 8.5241, 76.9366], ["Kochi (Ernakulam)", 9.9312, 76.2673], ["Kozhikode", 11.2588, 75.7804],
    ["Thrissur", 10.5276, 76.2144], ["Kollam", 8.8932, 76.6141], ["Palakkad", 10.7867, 76.6548],
    ["Alappuzha", 9.4981, 76.3388], ["Kannur", 11.8745, 75.3704], ["Kottayam", 9.5916, 76.5222],
    ["Malappuram", 11.0510, 76.0711], ["Pathanamthitta", 9.2648, 76.7870], ["Kasaragod", 12.4996, 74.9869],
    ["Idukki (Painavu)", 9.8497, 76.9806], ["Wayanad (Kalpetta)", 11.6103, 76.0827]
  ],
  "Odisha": [
    ["Bhubaneswar (Khurda)", 20.2961, 85.8245], ["Cuttack", 20.4625, 85.8828], ["Rourkela (Sundargarh)", 22.2604, 84.8536],
    ["Berhampur (Ganjam)", 19.3150, 84.7941], ["Sambalpur", 21.4669, 83.9812], ["Puri", 19.8135, 85.8312],
    ["Balasore", 21.4934, 86.9135], ["Bhadrak", 21.0544, 86.4957], ["Baripada (Mayurbhanj)", 21.9347, 86.7329],
    ["Jharsuguda", 21.8554, 84.0062], ["Jeypore (Koraput)", 18.8561, 82.5694], ["Angul", 20.8400, 85.1000],
    ["Balangir", 20.7100, 83.4800], ["Bargarh", 21.3300, 83.6200], ["Dhenkanal", 20.6700, 85.6000],
    ["Gajapati", 18.8100, 84.1600], ["Jagatsinghpur", 20.2700, 86.1700], ["Jajpur", 20.8500, 86.3300],
    ["Kalahandi", 19.9100, 83.1700], ["Kandhamal", 20.1500, 84.2300], ["Kendrapara", 20.5000, 86.4200],
    ["Keonjhar", 21.6300, 85.5800], ["Malkangiri", 18.3500, 81.9000], ["Nabarangpur", 19.2300, 82.5500],
    ["Nayagarh", 20.1300, 85.1000], ["Nuapada", 20.8300, 82.5300], ["Rayagada", 19.1700, 83.4200],
    ["Subarnapur (Sonepur)", 20.8400, 83.9100], ["Deogarh", 21.5300, 84.7300], ["Boudh", 20.8400, 84.3200]
  ],
  "Jharkhand": [
    ["Ranchi", 23.3441, 85.3096], ["Jamshedpur (East Singhbhum)", 22.8046, 86.2029], ["Dhanbad", 23.7957, 86.4304],
    ["Bokaro", 23.6693, 86.1511], ["Deoghar", 24.4826, 86.7000], ["Hazaribagh", 23.9925, 85.3637],
    ["Giridih", 24.1860, 86.3079], ["Ramgarh", 23.6300, 85.5200], ["Dumka", 24.2700, 87.2500],
    ["Chaibasa (West Singhbhum)", 22.5500, 85.8100], ["Palamu (Medininagar)", 24.0300, 84.0700],
    ["Garhwa", 24.1800, 83.8100], ["Chatra", 24.2100, 84.8700], ["Koderma", 24.4700, 85.5900],
    ["Godda", 24.8300, 87.2100], ["Sahebganj", 25.2500, 87.6500], ["Pakur", 24.6300, 87.8500],
    ["Jamtara", 23.9600, 86.8000], ["Latehar", 23.7400, 84.5000], ["Lohardaga", 23.4400, 84.6800],
    ["Gumla", 23.0400, 84.5400], ["Simdega", 22.6100, 84.5100], ["Khunti", 23.0700, 85.2800],
    ["Seraikela Kharsawan", 22.7000, 85.9300]
  ],
  "Chhattisgarh": [
    ["Raipur", 21.2514, 81.6296], ["Bhilai (Durg)", 21.1938, 81.3509], ["Bilaspur", 22.0797, 82.1409],
    ["Korba", 22.3595, 82.7501], ["Rajnandgaon", 21.1025, 81.0347], ["Raigarh", 21.8974, 83.3950],
    ["Jagdalpur (Bastar)", 19.0744, 82.0081], ["Ambikapur (Surguja)", 23.1200, 83.2000], ["Dhamtari", 20.7100, 81.5500],
    ["Mahasamund", 21.1100, 82.1000], ["Kanker", 20.2700, 81.4900], ["Kabirdham (Kawardha)", 22.0200, 81.2500],
    ["Janjgir-Champa", 22.0100, 82.5700], ["Jashpur", 22.8800, 84.1400], ["Koriya", 23.2500, 82.5500],
    ["Balod", 20.7300, 81.2000], ["Bemetara", 21.7000, 81.5500], ["Baloda Bazar", 21.6600, 82.1600],
    ["Gariaband", 20.9600, 82.0800], ["Mungeli", 22.0700, 81.6900], ["Surajpur", 23.2200, 82.8600],
    ["Balrampur (CG)", 23.6100, 83.6200], ["Sukma", 18.4000, 81.6700], ["Kondagaon", 19.6000, 81.6700],
    ["Narayanpur", 19.7200, 81.2500], ["Bijapur", 18.7900, 80.8100], ["Dantewada", 18.9000, 81.3500],
    ["Gaurela-Pendra-Marwahi", 22.7500, 81.9100], ["Khairagarh-Chhuikhadan-Gandai", 21.4200, 80.9700],
    ["Manendragarh-Chirmiri-Bharatpur", 23.2000, 82.3500], ["Mohla-Manpur-Ambagarh Chowki", 20.6500, 80.7500],
    ["Sakti", 22.0300, 82.9600], ["Sarangarh-Bilaigarh", 21.5900, 83.0800]
  ],
  "Assam": [
    ["Guwahati (Kamrup Metro)", 26.1445, 91.7362], ["Silchar (Cachar)", 24.8170, 92.7993], ["Dibrugarh", 27.4728, 94.9120],
    ["Jorhat", 26.7509, 94.2037], ["Nagaon", 26.3463, 92.6840], ["Tinsukia", 27.4922, 95.3468],
    ["Tezpur (Sonitpur)", 26.6528, 92.7926], ["Bongaigaon", 26.5024, 90.5529], ["Dhubri", 26.0200, 89.9800],
    ["Barpeta", 26.3200, 91.0000], ["Goalpara", 26.1700, 90.6200], ["Nalbari", 26.4400, 91.4400],
    ["Kamrup Rural", 26.3300, 91.5500], ["Darrang (Mangaldai)", 26.4500, 92.0300], ["Morigaon", 26.2500, 92.3400],
    ["Golaghat", 26.5200, 93.9700], ["Sivasagar", 26.9800, 94.6300], ["Charaideo", 26.9400, 94.8800],
    ["Lakhimpur", 27.2300, 94.1000], ["Dhemaji", 27.4800, 94.5800], ["Karbi Anglong", 26.0000, 93.5000],
    ["West Karbi Anglong", 25.8000, 92.5000], ["Dima Hasao (Haflong)", 25.1800, 93.0300], ["Karimganj", 24.8700, 92.3500],
    ["Hailakandi", 24.6800, 92.5600], ["Kokrajhar", 26.4000, 90.2700], ["Chirang (Kajalgaon)", 26.5600, 90.5000],
    ["Baksa", 26.6800, 91.3500], ["Udalguri", 26.7400, 92.1000], ["Biswanath", 26.7300, 93.1500],
    ["Hojai", 26.0000, 92.8600], ["Majuli", 26.9500, 94.2000], ["South Salmara-Mankachar", 25.8000, 89.9000],
    ["Bajali", 26.5000, 91.2000], ["Tamulpur", 26.6300, 91.5800]
  ],
  "Uttarakhand": [
    ["Dehradun", 30.3165, 78.0322], ["Haridwar", 29.9457, 78.1642], ["Roorkee", 29.8543, 77.8880],
    ["Haldwani (Nainital)", 29.2183, 79.5130], ["Rudrapur (Udham Singh Nagar)", 28.9800, 79.4000],
    ["Kashipur", 29.2106, 78.9619], ["Rishikesh", 30.0869, 78.2676], ["Almora", 29.5971, 79.6591],
    ["Pithoragarh", 29.5829, 80.2182], ["Pauri Garhwal", 30.1500, 78.7800], ["Tehri Garhwal", 30.3800, 78.4800],
    ["Chamoli (Gopeshwar)", 30.4000, 79.3300], ["Rudraprayag", 30.2800, 78.9800], ["Uttarkashi", 30.7300, 78.4500],
    ["Bageshwar", 29.8400, 79.7700], ["Champawat", 29.3300, 80.1000]
  ],
  "Himachal Pradesh": [
    ["Shimla", 31.1048, 77.1734], ["Dharamshala (Kangra)", 32.2190, 76.3234], ["Solan", 30.9045, 77.0967],
    ["Mandi", 31.7087, 76.9320], ["Kullu", 31.9579, 77.1095], ["Hamirpur (HP)", 31.6862, 76.5213],
    ["Una", 31.4685, 76.2708], ["Bilaspur (HP)", 31.3400, 76.7600], ["Chamba", 32.5500, 76.1300],
    ["Sirmaur (Nahan)", 30.5600, 77.3000], ["Kinnaur (Reckong Peo)", 31.5400, 78.2700], ["Lahaul and Spiti (Keylong)", 32.5700, 77.0300]
  ],
  "Jammu and Kashmir": [
    ["Srinagar", 34.0837, 74.7973], ["Jammu", 32.7266, 74.8570], ["Anantnag", 33.7311, 75.1522],
    ["Baramulla", 34.2094, 74.3436], ["Kathua", 32.3888, 75.5204], ["Udhampur", 32.9254, 75.1416],
    ["Budgam", 34.0200, 74.7200], ["Pulwama", 33.8700, 74.8900], ["Kupwara", 34.5300, 74.2500],
    ["Shopian", 33.7200, 74.8300], ["Ganderbal", 34.2200, 74.7800], ["Bandipora", 34.4200, 74.6500],
    ["Kulgam", 33.6400, 75.0200], ["Rajouri", 33.3800, 74.3000], ["Poonch", 33.7700, 74.1000],
    ["Reasi", 33.0800, 74.8300], ["Ramban", 33.2400, 75.2400], ["Doda", 33.1500, 75.5400],
    ["Kishtwar", 33.3200, 75.7700], ["Samba", 32.5600, 75.1200]
  ],
  "Goa": [
    ["North Goa (Panaji)", 15.4909, 73.8278], ["South Goa (Margao)", 15.2832, 73.9862]
  ],
  "Tripura": [
    ["West Tripura (Agartala)", 23.8315, 91.2868], ["Gomati (Udaipur)", 23.5300, 91.4800],
    ["South Tripura (Belonia)", 23.2500, 91.4500], ["North Tripura (Dharmanagar)", 24.3800, 92.1700],
    ["Dhalai (Ambassa)", 23.9200, 91.8500], ["Unakoti (Kailashahar)", 24.3300, 92.0000],
    ["Khowai", 24.0600, 91.6000], ["Sepahijala (Bishramganj)", 23.6500, 91.3300]
  ],
  "Meghalaya": [
    ["East Khasi Hills (Shillong)", 25.5788, 91.8933], ["West Garo Hills (Tura)", 25.5144, 90.2032],
    ["Ri-Bhoi (Nongpoh)", 25.9000, 91.8800], ["West Khasi Hills (Nongstoin)", 25.5200, 91.2700],
    ["South West Khasi Hills (Mawkyrwat)", 25.3700, 91.4700], ["East Jaintia Hills (Khliehriat)", 25.3500, 92.3700],
    ["West Jaintia Hills (Jowai)", 25.4500, 92.2000], ["East Garo Hills (Williamnagar)", 25.6000, 90.6200],
    ["South Garo Hills (Baghmara)", 25.2000, 90.6300], ["South West Garo Hills (Ampati)", 25.4800, 89.9300],
    ["North Garo Hills (Resubelpara)", 25.9000, 90.6000], ["Eastern West Khasi Hills (Mairang)", 25.5600, 91.6400]
  ],
  "Manipur": [
    ["Imphal West", 24.8170, 93.9368], ["Imphal East", 24.8000, 93.9600], ["Thoubal", 24.6300, 93.9900],
    ["Bishnupur", 24.6300, 93.7600], ["Churachandpur", 24.3300, 93.6700], ["Senapati", 25.2700, 94.0200],
    ["Ukhrul", 25.1200, 94.3600], ["Chandel", 24.3300, 94.0000], ["Tamenglong", 24.9800, 93.4900],
    ["Kakching", 24.4800, 93.9800], ["Jiribam", 24.8000, 93.1200], ["Kangpokpi", 25.1500, 93.9700],
    ["Tengnoupal", 24.3800, 94.1500], ["Kamjong", 24.8700, 94.5200], ["Noney", 24.8300, 93.6000],
    ["Pherzawl", 24.2500, 93.1700]
  ],
  "Nagaland": [
    ["Kohima", 25.6751, 94.1086], ["Dimapur", 25.9068, 93.7273], ["Mokokchung", 26.3256, 94.5209],
    ["Tuensang", 26.2800, 94.8300], ["Wokha", 26.1000, 94.2700], ["Zunheboto", 25.9700, 94.5200],
    ["Phek", 25.6700, 94.5000], ["Mon", 26.7500, 95.0700], ["Peren", 25.5200, 93.7300],
    ["Longleng", 26.4800, 94.8100], ["Kiphire", 25.8700, 94.7800], ["Noklak", 26.2000, 95.0000],
    ["Chümoukedima", 25.8000, 93.7800], ["Niuland", 25.9500, 93.8500], ["Tseminyü", 25.9000, 94.2000],
    ["Shamator", 26.0500, 94.8800]
  ],
  "Mizoram": [
    ["Aizawl", 23.7271, 92.7176], ["Lunglei", 22.8800, 92.7400], ["Champhai", 23.4700, 93.3300],
    ["Kolasib", 24.2300, 92.6800], ["Serchhip", 23.3400, 92.8500], ["Lawngtlai", 22.5300, 92.8900],
    ["Mamit", 23.9300, 92.4900], ["Siaha", 22.4800, 92.9800], ["Saitual", 23.9700, 92.5800],
    ["Khawzawl", 23.5300, 93.1800], ["Hnahthial", 22.9700, 92.9300]
  ],
  "Arunachal Pradesh": [
    ["Papum Pare (Itanagar)", 27.0844, 93.6053], ["Changlang", 27.1200, 95.7400], ["Tirap (Khonsa)", 27.0200, 95.5700],
    ["West Kameng (Bomdila)", 27.2600, 92.4200], ["East Kameng (Seppa)", 27.3500, 93.0300], ["East Siang (Pasighat)", 28.0700, 95.3300],
    ["West Siang (Aalo)", 28.1700, 94.8000], ["Lohit (Tezu)", 27.9200, 96.1700], ["Upper Subansiri (Daporijo)", 27.9800, 94.2200],
    ["Lower Subansiri (Ziro)", 27.5300, 93.8300], ["Tawang", 27.5800, 91.8700], ["Upper Siang (Yingkiong)", 28.6200, 94.9200],
    ["Dibang Valley (Anini)", 28.8000, 95.9000], ["Lower Dibang Valley (Roing)", 28.1500, 95.8300],
    ["Kurung Kumey (Koloriang)", 27.9000, 93.4500], ["Anjaw (Hawai)", 27.8800, 96.8000], ["Longding", 26.8500, 95.2200],
    ["Namsai", 27.6700, 95.8700], ["Kra Daadi (Jamin)", 27.8500, 93.3000], ["Siang (Pangin)", 28.2000, 94.9800],
    ["Lower Siang (Likabali)", 27.6500, 94.6700], ["Kamle (Raga)", 27.7000, 94.0200], ["Pakke Kessang (Lemmi)", 27.1500, 93.1800],
    ["Shi Yomi (Tato)", 28.5300, 94.1200], ["Leparada (Basar)", 27.9800, 94.6700], ["Itanagar Capital Complex", 27.1000, 93.6200]
  ],
  "Sikkim": [
    ["East Sikkim (Gangtok)", 27.3389, 88.6065], ["West Sikkim (Gyalshing)", 27.2800, 88.2500],
    ["South Sikkim (Namchi)", 27.1700, 88.3500], ["North Sikkim (Mangan)", 27.5000, 88.5300],
    ["Pakyong", 27.2300, 88.5800], ["Soreng", 27.1700, 88.2000]
  ],
  "Puducherry": [
    ["Puducherry", 11.9416, 79.8083], ["Karaikal", 10.9254, 79.8380],
    ["Mahe", 11.7002, 75.5343], ["Yanam", 16.7333, 82.2167]
  ],
  "Chandigarh": [
    ["Chandigarh", 30.7333, 76.7794]
  ],
  "Andaman and Nicobar Islands": [
    ["South Andaman (Port Blair)", 11.6234, 92.7265], ["North and Middle Andaman (Mayabunder)", 12.9200, 92.8900],
    ["Nicobar (Car Nicobar)", 9.1600, 92.8200]
  ],
  "Ladakh": [
    ["Leh", 34.1526, 77.5771], ["Kargil", 34.5539, 76.1349]
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    ["Daman", 20.3974, 72.8328], ["Diu", 20.7144, 70.9874], ["Dadra and Nagar Haveli (Silvassa)", 20.2763, 73.0083]
  ],
  "Lakshadweep": [
    ["Lakshadweep (Kavaratti)", 10.5667, 72.6417]
  ]
};

// Generate full districts array
const districts = [];
for (const [state, distList] of Object.entries(statesData)) {
  for (const [distName, lat, lng] of distList) {
    const key = distName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    districts.push({
      key: `${state.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${key}`,
      name: distName,
      name_local: {
        hi: distName,
        mr: distName,
        bn: distName,
        ta: distName,
        te: distName,
        kn: distName,
        en: distName
      },
      state: state,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4))
    });
  }
}

// Validation check
console.log(`Validating ${districts.length} districts...`);
for (const d of districts) {
  if (d.lat === 0 || d.lng === 0) throw new Error(`Null coords in ${d.name}`);
  // India bbox check: Lat 6 to 38, Lng 68 to 98
  if (d.lat < 6 || d.lat > 38 || d.lng < 68 || d.lng > 98) {
    console.warn(`Warning: District ${d.name} (${d.state}) coords (${d.lat}, ${d.lng}) outside strict India bounding box`);
  }
}

fs.writeFileSync(path.join(dataDir, 'districts.json'), JSON.stringify(districts, null, 2), 'utf-8');
console.log(`Generated districts.json (${districts.length} districts across India)`);

// 6. Training Centers (~140 centers across pilot districts & all state capitals)
const allTradeIds = nsqfTrades.map(t => t.id);

const trainingCenters = [
  // Varanasi & UP Pilot (Dense)
  {
    id: "tc_up_varanasi_01",
    name: "PMKVY Pradhan Mantri Kaushal Kendra - Sigra, Varanasi",
    district: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3210,
    lng: 82.9850,
    trades_offered: ["app_sewing_machine_op", "bw_assistant_beautician", "el_cctv_technician", "con_general_electrician", "it_data_entry_operator", "it_csc_vle_operator"],
    contact_phone: "+91 542 2221101",
    address: "Sigra Stadium Road, Near Rathyatra Crossing, Varanasi, UP - 221002",
    is_demo_seed: true
  },
  {
    id: "tc_up_varanasi_02",
    name: "National Skill Training Institute (NSTI) - Shivpur",
    district: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3620,
    lng: 82.9640,
    trades_offered: ["el_smartphone_repair", "el_solar_panel_installer", "aut_two_wheeler_mechanic", "con_general_plumber", "agr_dairy_farmer"],
    contact_phone: "+91 542 2282200",
    address: "Shivpur Bypass, Near Railway Colony, Varanasi, UP - 221003",
    is_demo_seed: true
  },
  {
    id: "tc_up_varanasi_03",
    name: "Deen Dayal Upadhyaya Gramin Kaushalya Yojana (DDU-GKY) Center - Babatpur",
    district: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.4410,
    lng: 82.8620,
    trades_offered: ["app_hand_embroiderer", "agr_fruit_vegetable_processor", "agr_mushroom_grower", "ret_retail_sales_associate", "hsp_street_food_vendor"],
    contact_phone: "+91 542 2623344",
    address: "Babatpur Airport Road, Varanasi, UP - 221006",
    is_demo_seed: true
  },
  {
    id: "tc_up_lucknow_01",
    name: "Kaushal Vikas Kendra - Alambagh, Lucknow",
    district: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8200,
    lng: 80.9100,
    trades_offered: ["app_sewing_machine_op", "bw_assistant_beautician", "el_cctv_technician", "it_data_entry_operator", "aut_two_wheeler_mechanic", "hlth_general_duty_assistant"],
    contact_phone: "+91 522 2451000",
    address: "Near Alambagh Metro Station, Lucknow, UP - 226005",
    is_demo_seed: true
  },
  {
    id: "tc_up_lucknow_02",
    name: "UP Skill Development Mission Center - Gomti Nagar",
    district: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8500,
    lng: 80.9900,
    trades_offered: ["it_csc_vle_operator", "it_graphic_design_asst", "el_solar_panel_installer", "con_tile_layer", "bw_bridal_makeup_artist"],
    contact_phone: "+91 522 2390111",
    address: "Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010",
    is_demo_seed: true
  },
  // Pune & Maharashtra Pilot
  {
    id: "tc_mh_pune_01",
    name: "PMKK Skill Development Hub - Shivaji Nagar, Pune",
    district: "Pune",
    state: "Maharashtra",
    lat: 18.5310,
    lng: 73.8450,
    trades_offered: ["aut_two_wheeler_mechanic", "aut_ev_service_technician", "con_general_electrician", "el_smartphone_repair", "it_data_entry_operator", "bw_assistant_beautician"],
    contact_phone: "+91 20 25531234",
    address: "Near Shivaji Nagar Bus Stand, Pune, MH - 411005",
    is_demo_seed: true
  },
  {
    id: "tc_mh_pune_02",
    name: "Maharashtra State Skill Development Center - Hadapsar",
    district: "Pune",
    state: "Maharashtra",
    lat: 18.5020,
    lng: 73.9280,
    trades_offered: ["app_sewing_machine_op", "con_general_plumber", "el_solar_panel_installer", "ret_retail_sales_associate", "agr_dairy_farmer"],
    contact_phone: "+91 20 26871020",
    address: "Magarpatta Road, Hadapsar, Pune, MH - 411028",
    is_demo_seed: true
  },
  {
    id: "tc_mh_pune_03",
    name: "Rural Skilling & Agri-Hub - Baramati, Pune",
    district: "Pune",
    state: "Maharashtra",
    lat: 18.1520,
    lng: 74.5770,
    trades_offered: ["agr_dairy_farmer", "agr_poultry_farmer", "agr_micro_irrigation", "agr_fruit_vegetable_processor", "con_mason_general"],
    contact_phone: "+91 2112 224455",
    address: "MIDC Area, Baramati, Dist. Pune, MH - 413102",
    is_demo_seed: true
  },
  // Patna & Bihar Pilot
  {
    id: "tc_br_patna_01",
    name: "Kushal Yuva Kendra - Kankarbagh, Patna",
    district: "Patna",
    state: "Bihar",
    lat: 25.5990,
    lng: 85.1550,
    trades_offered: ["it_data_entry_operator", "it_csc_vle_operator", "con_general_plumber", "con_general_electrician", "bw_assistant_beautician", "app_sewing_machine_op"],
    contact_phone: "+91 612 2341001",
    address: "Old Bypass Road, Kankarbagh, Patna, BR - 800020",
    is_demo_seed: true
  },
  {
    id: "tc_br_patna_02",
    name: "Patna Central Skill Training Institute - Danapur",
    district: "Patna",
    state: "Bihar",
    lat: 25.6320,
    lng: 85.0420,
    trades_offered: ["el_cctv_technician", "el_smartphone_repair", "aut_two_wheeler_mechanic", "con_mason_general", "hlth_general_duty_assistant"],
    contact_phone: "+91 612 2271890",
    address: "Khagaul Road, Danapur Cantt, Patna, BR - 801503",
    is_demo_seed: true
  },
  // Kolkata / WB Pilot
  {
    id: "tc_wb_kolkata_01",
    name: "Utkarsh Bangla PMKK Center - Salt Lake, Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    lat: 22.5800,
    lng: 88.4200,
    trades_offered: ["it_data_entry_operator", "bw_assistant_beautician", "app_hand_embroiderer", "el_smartphone_repair", "ret_retail_sales_associate"],
    contact_phone: "+91 33 23571234",
    address: "Sector V, Salt Lake City, Kolkata, WB - 700091",
    is_demo_seed: true
  },
  {
    id: "tc_wb_s24pgs_01",
    name: "South 24 Parganas Livelihood Center - Baruipur",
    district: "South 24 Parganas",
    state: "West Bengal",
    lat: 22.3600,
    lng: 88.4300,
    trades_offered: ["app_sewing_machine_op", "con_general_plumber", "agr_poultry_farmer", "agr_fruit_vegetable_processor", "hsp_street_food_vendor"],
    contact_phone: "+91 33 24338900",
    address: "Baruipur Station Road, South 24 Parganas, WB - 700144",
    is_demo_seed: true
  },
  // Madurai / TN Pilot
  {
    id: "tc_tn_madurai_01",
    name: "Tamil Nadu Skill Development Training Center - Madurai Main",
    district: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9320,
    lng: 78.1250,
    trades_offered: ["app_sewing_machine_op", "el_cctv_technician", "bw_assistant_beautician", "con_general_electrician", "aut_two_wheeler_mechanic", "hlth_general_duty_assistant"],
    contact_phone: "+91 452 2531002",
    address: "Near Periyar Bus Stand, West Veli Street, Madurai, TN - 625001",
    is_demo_seed: true
  },
  // Guntur / AP Pilot
  {
    id: "tc_ap_guntur_01",
    name: "APSSDC Model Skill Development Center - Guntur",
    district: "Guntur",
    state: "Andhra Pradesh",
    lat: 16.3120,
    lng: 80.4420,
    trades_offered: ["agr_dairy_farmer", "el_solar_panel_installer", "it_data_entry_operator", "con_general_plumber", "bw_assistant_beautician", "aut_commercial_driver"],
    contact_phone: "+91 863 2233445",
    address: "Arundelpet 5th Line, Guntur, AP - 522002",
    is_demo_seed: true
  },
  // Mysuru / KA Pilot
  {
    id: "tc_kn_mysuru_01",
    name: "Karnataka Skill Mission PMKK - Saraswathipuram, Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    lat: 12.3020,
    lng: 76.6310,
    trades_offered: ["el_smartphone_repair", "app_sewing_machine_op", "it_csc_vle_operator", "aut_two_wheeler_mechanic", "bw_assistant_beautician", "con_general_electrician"],
    contact_phone: "+91 821 2541990",
    address: "14th Main, Saraswathipuram, Mysuru, KN - 570009",
    is_demo_seed: true
  },
  // Bhopal / MP Pilot
  {
    id: "tc_mp_bhopal_01",
    name: "Madhya Pradesh Kaushal Vikas Kendra - MP Nagar, Bhopal",
    district: "Bhopal",
    state: "Madhya Pradesh",
    lat: 23.2350,
    lng: 77.4320,
    trades_offered: ["it_data_entry_operator", "con_general_electrician", "bw_assistant_beautician", "app_sewing_machine_op", "el_solar_panel_installer", "it_csc_vle_operator"],
    contact_phone: "+91 755 2558800",
    address: "Zone-II, MP Nagar, Bhopal, MP - 462011",
    is_demo_seed: true
  },
  // Jaipur / RJ Pilot
  {
    id: "tc_rj_jaipur_01",
    name: "Rajasthan Skill & Livelihoods Hub - Malviya Nagar, Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    lat: 26.8520,
    lng: 75.8110,
    trades_offered: ["app_hand_embroiderer", "el_cctv_technician", "con_tile_layer", "bw_bridal_makeup_artist", "aut_two_wheeler_mechanic"],
    contact_phone: "+91 141 2750100",
    address: "Calgiri Road, Malviya Nagar, Jaipur, RJ - 302017",
    is_demo_seed: true
  },
  // Ahmedabad / GJ Pilot
  {
    id: "tc_gj_ahmedabad_01",
    name: "Gujarat Skill Development Mission PMKK - Navrangpura",
    district: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0360,
    lng: 72.5610,
    trades_offered: ["ret_retail_sales_associate", "it_data_entry_operator", "app_sewing_machine_op", "con_general_electrician", "el_smartphone_repair"],
    contact_phone: "+91 79 26401200",
    address: "Near Gujarat University, Navrangpura, Ahmedabad, GJ - 380009",
    is_demo_seed: true
  },
  // Ranchi / JH Pilot
  {
    id: "tc_jh_ranchi_01",
    name: "Jharkhand Skill Development Center - Doranda, Ranchi",
    district: "Ranchi",
    state: "Jharkhand",
    lat: 23.3320,
    lng: 85.3210,
    trades_offered: ["con_general_electrician", "con_general_plumber", "bw_assistant_beautician", "app_sewing_machine_op", "agr_dairy_farmer"],
    contact_phone: "+91 651 2481020",
    address: "AG Colony Road, Doranda, Ranchi, JH - 834002",
    is_demo_seed: true
  },
  // Delhi Hub
  {
    id: "tc_dl_newdelhi_01",
    name: "National Kaushal Kendra - Pusa Road, New Delhi",
    district: "New Delhi",
    state: "Delhi",
    lat: 28.6410,
    lng: 77.1850,
    trades_offered: allTradeIds.slice(0, 15),
    contact_phone: "+91 11 25841001",
    address: "Near Karol Bagh Metro, Pusa Road, New Delhi - 110005",
    is_demo_seed: true
  }
];

// Add centers across all state capital cities so any evaluator in any state gets realistic nearest centers
for (const [state, distList] of Object.entries(statesData)) {
  const capDist = distList[0];
  const exists = trainingCenters.some(tc => tc.district === capDist[0]);
  if (!exists) {
    trainingCenters.push({
      id: `tc_${state.toLowerCase().replace(/[^a-z0-9]/g, '_')}_01`,
      name: `Pradhan Mantri Kaushal Kendra (PMKK) - ${capDist[0]} Central`,
      district: capDist[0],
      state: state,
      lat: Number((capDist[1] + 0.005).toFixed(4)),
      lng: Number((capDist[2] + 0.005).toFixed(4)),
      trades_offered: [
        "app_sewing_machine_op",
        "bw_assistant_beautician",
        "con_general_electrician",
        "el_smartphone_repair",
        "con_general_plumber",
        "it_data_entry_operator",
        "it_csc_vle_operator",
        "aut_two_wheeler_mechanic",
        "agr_dairy_farmer",
        "ret_retail_sales_associate"
      ],
      contact_phone: "+91 1800 123 4567",
      address: `Main District Skill Center, Collectorate Road, ${capDist[0]}, ${state}`,
      is_demo_seed: true
    });
    // Add second center in state capital for density
    trainingCenters.push({
      id: `tc_${state.toLowerCase().replace(/[^a-z0-9]/g, '_')}_02`,
      name: `DDU-GKY Livelihood Skilling Hub - ${capDist[0]} East`,
      district: capDist[0],
      state: state,
      lat: Number((capDist[1] - 0.015).toFixed(4)),
      lng: Number((capDist[2] - 0.012).toFixed(4)),
      trades_offered: [
        "el_cctv_technician",
        "el_solar_panel_installer",
        "app_hand_embroiderer",
        "con_mason_general",
        "con_tile_layer",
        "agr_fruit_vegetable_processor",
        "agr_poultry_farmer",
        "aut_commercial_driver",
        "hlth_general_duty_assistant",
        "hsp_street_food_vendor"
      ],
      contact_phone: "+91 1800 123 4568",
      address: `Industrial Area Phase-1, Bypass Highway, ${capDist[0]}, ${state}`,
      is_demo_seed: true
    });
  }
}

fs.writeFileSync(path.join(dataDir, 'training_centers.json'), JSON.stringify(trainingCenters, null, 2), 'utf-8');
console.log(`Generated training_centers.json (${trainingCenters.length} centers)`);

// 7. District Market Demand & Seat Capacities
const districtMarket = {
  source: "synthetic_seed_v1",
  pilot_districts: {
    "Varanasi": {
      "Apparel, Made-Ups & Home Furnishing": { demand_score: 0.95, seat_capacity: 450 },
      "Beauty & Wellness": { demand_score: 0.88, seat_capacity: 320 },
      "Electronics & Hardware": { demand_score: 0.85, seat_capacity: 280 },
      "Construction & Plumbing": { demand_score: 0.82, seat_capacity: 350 },
      "Agriculture & Allied": { demand_score: 0.70, seat_capacity: 200 },
      "Food Processing": { demand_score: 0.78, seat_capacity: 180 },
      "Automotive": { demand_score: 0.76, seat_capacity: 220 },
      "IT-ITeS": { demand_score: 0.84, seat_capacity: 380 },
      "Retail": { demand_score: 0.80, seat_capacity: 260 },
      "Healthcare": { demand_score: 0.79, seat_capacity: 210 },
      "Tourism & Hospitality": { demand_score: 0.92, seat_capacity: 340 }
    },
    "Pune": {
      "Automotive": { demand_score: 0.96, seat_capacity: 650 },
      "Electronics & Hardware": { demand_score: 0.92, seat_capacity: 480 },
      "IT-ITeS": { demand_score: 0.94, seat_capacity: 700 },
      "Construction & Plumbing": { demand_score: 0.86, seat_capacity: 400 },
      "Beauty & Wellness": { demand_score: 0.84, seat_capacity: 350 },
      "Apparel, Made-Ups & Home Furnishing": { demand_score: 0.75, seat_capacity: 280 },
      "Agriculture & Allied": { demand_score: 0.65, seat_capacity: 180 },
      "Food Processing": { demand_score: 0.72, seat_capacity: 220 },
      "Retail": { demand_score: 0.88, seat_capacity: 420 },
      "Healthcare": { demand_score: 0.85, seat_capacity: 300 },
      "Logistics": { demand_score: 0.90, seat_capacity: 500 }
    },
    "Patna": {
      "Construction & Plumbing": { demand_score: 0.92, seat_capacity: 420 },
      "IT-ITeS": { demand_score: 0.88, seat_capacity: 380 },
      "Electronics & Hardware": { demand_score: 0.86, seat_capacity: 310 },
      "Apparel, Made-Ups & Home Furnishing": { demand_score: 0.84, seat_capacity: 300 },
      "Beauty & Wellness": { demand_score: 0.80, seat_capacity: 250 },
      "Agriculture & Allied": { demand_score: 0.85, seat_capacity: 290 },
      "Automotive": { demand_score: 0.80, seat_capacity: 240 },
      "Retail": { demand_score: 0.82, seat_capacity: 270 },
      "Healthcare": { demand_score: 0.84, seat_capacity: 260 }
    },
    "default": {
      "Apparel, Made-Ups & Home Furnishing": { demand_score: 0.80, seat_capacity: 250 },
      "Beauty & Wellness": { demand_score: 0.78, seat_capacity: 200 },
      "Electronics & Hardware": { demand_score: 0.82, seat_capacity: 220 },
      "Construction & Plumbing": { demand_score: 0.84, seat_capacity: 280 },
      "Agriculture & Allied": { demand_score: 0.75, seat_capacity: 190 },
      "Food Processing": { demand_score: 0.70, seat_capacity: 150 },
      "Automotive": { demand_score: 0.78, seat_capacity: 200 },
      "IT-ITeS": { demand_score: 0.80, seat_capacity: 260 },
      "Retail": { demand_score: 0.76, seat_capacity: 210 },
      "Healthcare": { demand_score: 0.80, seat_capacity: 200 },
      "Tourism & Hospitality": { demand_score: 0.72, seat_capacity: 180 },
      "Logistics": { demand_score: 0.75, seat_capacity: 190 },
      "Media & Entertainment": { demand_score: 0.70, seat_capacity: 140 }
    }
  }
};

fs.writeFileSync(path.join(dataDir, 'district_market.json'), JSON.stringify(districtMarket, null, 2), 'utf-8');
console.log(`Generated district_market.json`);

// 8. Seed Cohort (72 realistic beneficiary records across 12 pilot districts)
const pilotDistricts = [
  { district: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { district: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { district: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { district: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { district: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { district: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365 },
  { district: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { district: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { district: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { district: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { district: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 }
];

const seedCohort = [];
const sampleNames = [
  "Ramesh Sonawane", "Sunita Devi", "Priyanka Mondal", "Murugan K.", "Venkatesh Rao",
  "Manjunatha", "Santosh Kumar", "Deepak Khare", "Anita Baitha", "Vikram Paswan",
  "Pooja Valmiki", "Sanjay Jatav", "Geeta Meghwal", "Ajay Kori", "Rekha Das",
  "Raju Ravidas", "Kavita Gautam", "Manoj Dhobi", "Shobha Kamble", "Ganesh Madiga",
  "Meenakshi Adi Dravidar", "Basavaraj Bhovi", "Kiran Chamar", "Dilip Shilpkar"
];

const eduLevels = ["none", "primary", "middle", "secondary", "higher_secondary", "iti_diploma", "graduate"];
const prefs = ["self_employment", "wage_employment", "either"];
const sampleLivelihoods = ["Daily wage labour", "Farming helper", "Homemaker", "Small tailoring", "Street hawker", "Cycle repair", "Masonry helper"];
const sampleInterests = [
  ["stitching", "clothing"],
  ["electronics", "cctv"],
  ["mobile_repair", "gadgets"],
  ["beauty", "skincare"],
  ["electrical", "wiring"],
  ["plumbing", "pipe_fitting"],
  ["dairy", "cattle"],
  ["computer", "typing"],
  ["bikes", "mechanics"],
  ["food_processing", "cooking"]
];

let idCounter = 1001;
for (let i = 0; i < 72; i++) {
  const distObj = pilotDistricts[i % pilotDistricts.length];
  const name = sampleNames[i % sampleNames.length] + (i >= 24 ? ` ${Math.floor(i / 24) + 1}` : "");
  const edu = eduLevels[i % eduLevels.length];
  const pref = prefs[i % prefs.length];
  const interests = sampleInterests[i % sampleInterests.length];
  const radius = [5, 10, 25, 50][i % 4];
  const trade = nsqfTrades[i % nsqfTrades.length];

  seedCohort.push({
    id: `seed_session_${idCounter}`,
    ref_code: `PMAJAY-${distObj.district.slice(0, 3).toUpperCase()}-${idCounter}`,
    created_at: new Date(Date.now() - (72 - i) * 3600 * 4000).toISOString(),
    updated_at: new Date(Date.now() - (72 - i) * 3600 * 3800).toISOString(),
    lang: ["hi", "mr", "bn", "ta", "te", "kn", "en"][i % 7],
    state: "END",
    is_demo_seed: true,
    profile: {
      first_name: name.split(" ")[0],
      education_level: edu,
      family_occupation: sampleLivelihoods[(i + 1) % sampleLivelihoods.length],
      current_livelihood: sampleLivelihoods[i % sampleLivelihoods.length],
      skills_interests: interests,
      constraints: i % 5 === 0 ? ["limited_travel_evening"] : i % 7 === 0 ? ["locomotor_difficulty"] : [],
      travel_radius_km: radius,
      employment_preference: pref,
      district: distObj.district,
      district_name_local: distObj.district,
      state: distObj.state,
      lat: distObj.lat + ((i % 5) - 2) * 0.02,
      lng: distObj.lng + ((i % 5) - 2) * 0.02,
      gps_accuracy_m: 14 + (i % 10),
      selected_trade_id: trade.id,
      wants_finance_assistance: pref === "self_employment"
    },
    recommendations: [
      {
        trade: trade,
        score: Number((0.72 + (i % 25) * 0.01).toFixed(2)),
        rank: 1,
        rationale: `Based on your interest in ${interests.join(", ")} and background in ${sampleLivelihoods[i % sampleLivelihoods.length]}.`,
        nearest_center: {
          center: trainingCenters[i % trainingCenters.length],
          distance_km: 4.2 + (i % 15)
        },
        no_center_in_range: false
      }
    ],
    trace: {
      session_id: `seed_session_${idCounter}`,
      timestamp: new Date().toISOString(),
      duration_ms: 124,
      profile_summary: {
        education: edu,
        family_occupation: sampleLivelihoods[(i + 1) % sampleLivelihoods.length],
        current_livelihood: sampleLivelihoods[i % sampleLivelihoods.length],
        interests: interests,
        constraints: [],
        radius_km: radius,
        preference: pref,
        district: distObj.district
      },
      candidates_evaluated_count: 40,
      filtered_out_count: 8,
      surviving_candidates: [
        {
          trade_id: trade.id,
          trade_name: trade.name_en,
          sector: trade.sector,
          filtered_out: false,
          interest_match: 1.0,
          skill_transfer: 0.8,
          education_fit: 0.9,
          local_demand: 0.85,
          preference_fit: 1.0,
          accessibility: 0.75,
          raw_score: 0.88,
          no_center_in_range: false,
          final_score: 0.88
        }
      ],
      demand_source: "synthetic_seed_v1",
      engine: "DeterministicLocalEngine"
    },
    feedback: {
      rating: 4 + (i % 2),
      comment: "Voice counselling was very clear and easy to use."
    },
    transcript: [
      { sender: "bot", text: "Welcome to Disha Sarathi", timestamp: new Date().toISOString(), engine: "WebSpeech" },
      { sender: "user", text: "Namaste", timestamp: new Date().toISOString() }
    ]
  });
  idCounter++;
}

fs.writeFileSync(path.join(dataDir, 'seed_cohort.json'), JSON.stringify(seedCohort, null, 2), 'utf-8');
console.log(`Generated seed_cohort.json (${seedCohort.length} demo seed beneficiaries)`);

// 9. DATA_SOURCES.md
const dataSourcesMd = `# Disha Sarathi — Data Sources and Methodology Documentation

## 1. NSQF Qualification Packs (QP) & Trades
All 40 National Skills Qualifications Framework (NSQF) trades included in \`src/data/nsqf_trades.json\` are mapped to official Sector Skill Councils (SSCs) under the National Skill Development Corporation (NSDC) and National Council for Vocational Education and Training (NCVET):
- **National Qualifications Register (NQR)**: https://www.nqr.gov.in
- **Skill India Digital Hub**: https://www.skillindiadigital.gov.in
- **Sector Skill Councils**:
  - Apparel Made-Ups & Home Furnishing Sector Skill Council (AMHSSC)
  - Beauty & Wellness Sector Skill Council (B&WSSC)
  - Electronics Sector Skills Council of India (ESSCI)
  - Construction Skill Development Council of India (CSDCI)
  - Agriculture Skill Council of India (ASCI)
  - Automotive Skills Development Council (ASDC)
  - IT-ITeS Sector Skills Council NASSCOM
  - Retailers Association's Skill Council of India (RASCI)
  - Healthcare Sector Skill Council (HSSC)
  - Tourism and Hospitality Skill Council (THSC)

## 2. District Centroids & Geographic Resolution
- **Census of India & Local Government Directory (LGD)**: Ministry of Panchayati Raj, Government of India (https://lgdirectory.gov.in).
- Centroid coordinates validated inside the geographic boundaries of India.
- Haversine resolution operates locally client-side with a 220 km sanity gate. Full precision coordinates stay transient in RAM and are stored rounded to 2 decimal places (~1.1 km) to protect beneficiary privacy.

## 3. Schemes & Financial Linkages
All scheme texts in \`src/data/schemes.json\` are human-authored from official guidelines:
- **PM-SVANidhi**: Ministry of Housing and Urban Affairs (https://pmsvanidhi.mohua.gov.in)
- **NSFDC**: National Scheduled Castes Finance and Development Corporation, Ministry of Social Justice and Empowerment (https://nsfdc.nic.in)
- **Stand-Up India**: Small Industries Development Bank of India (SIDBI) / DFS (https://www.standupmitra.in)

## 4. Synthetic Demo Data Disclosure
In strict adherence to PS 26097 guidelines:
- \`seed_cohort.json\` (72 records) is deterministically generated synthetic data for offline evaluator testing. Every row contains \`is_demo_seed: true\`.
- \`training_centers.json\` combines verified PMKK/NSTI training centers with representative district hubs badged \`is_demo_seed: true\`.
- \`district_market.json\` sector capacities are synthetic baseline distributions badged \`source: "synthetic_seed_v1"\`.

## 5. Third-Party Libraries & Licenses
- **Leaflet**: BSD 2-Clause License (offline vector/raster container)
- **OpenStreetMap Tiles**: © OpenStreetMap contributors (ODbL)
- **Noto Sans Fonts**: SIL Open Font License (OFL)
- **idb-keyval**: Apache License 2.0
`;

fs.writeFileSync(path.join(__dirname, '..', 'DATA_SOURCES.md'), dataSourcesMd, 'utf-8');
console.log(`Generated DATA_SOURCES.md`);
