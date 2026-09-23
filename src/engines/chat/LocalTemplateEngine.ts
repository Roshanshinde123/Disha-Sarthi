// Disha Sarathi - Local Template Chat Engine (Layer A)
import { BeneficiaryProfile, LanguageCode, NSQFTrade } from '../../core/types';

export class LocalTemplateEngine {
  readonly id = 'LocalTemplate';
  readonly name = 'Local Deterministic Template Engine';

  generateRationale(
    profile: BeneficiaryProfile,
    trade: NSQFTrade,
    lang: LanguageCode = 'hi'
  ): string {
    const interest = profile.skills_interests[0] || 'हुनर';
    const occ = profile.current_livelihood || profile.family_occupation || 'अनुभव';
    const dist = profile.district || 'आपके जिले';

    if (lang === 'hi') {
      return `आपकी "${interest}" में रुचि और "${occ}" के अनुभव के आधार पर यह एनएसक्यूएफ लेवल ${trade.nsqf_level} कोर्स ${dist} में उच्च मांग वाला है।`;
    } else if (lang === 'mr') {
      return `तुमची "${interest}" मधील आवड आणि "${occ}" चा अनुभव यावर आधारित हा एनएसक्यूएफ स्तर ${trade.nsqf_level} कोर्स ${dist} मध्ये सर्वाधिक उपयुक्त आहे.`;
    } else if (lang === 'bn') {
      return `আপনার "${interest}" প্রতি আগ্রহ এবং "${occ}" অভিজ্ঞতার ভিত্তিতে এই এনএসকিউএফ লেভেল ${trade.nsqf_level} কোর্সটি ${dist} অঞ্চলে অত্যন্ত লাভজনক।`;
    } else if (lang === 'ta') {
      return `உங்கள் "${interest}" ஆர்வம் மற்றும் "${occ}" அனுபவத்தின் அடிப்படையில் இந்த என்எஸ்யுஎஃப் நிலை ${trade.nsqf_level} பயிற்சி ${dist} பகுதியில் சிறந்த வாய்ப்பாகும்.`;
    } else if (lang === 'te') {
      return `మీ "${interest}" ఆసక్తి మరియు "${occ}" అనుభవం ఆధారంగా ఈ ఎన్‌ఎస్‌క్యుఎఫ్ లెవల్ ${trade.nsqf_level} కోర్సు ${dist} లో చాలా ఉపయోగకరం.`;
    } else if (lang === 'kn') {
      return `ನಿಮ್ಮ "${interest}" ಆಸಕ್ತಿ ಮತ್ತು "${occ}" ಅನುಭವದ ಆಧಾರದ ಮೇಲೆ ಈ ಎನ್‌ಎಸ್‌ಕ್ಯೂಎಫ್ ಹಂತ ${trade.nsqf_level} ತರಬೇತಿ ${dist} ನಲ್ಲಿ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.`;
    }
    return `Based on your interest in "${interest}" and background in "${occ}", this NSQF Level ${trade.nsqf_level} trade offers strong livelihood prospects in ${dist}.`;
  }
}
