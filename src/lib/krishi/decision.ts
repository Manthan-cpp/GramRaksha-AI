import {
  CropDecisionSchema,
  type Claim,
  type CropBrief,
  type CropDecision,
  type CropDecisionStep,
  type Evidence,
  type EvidenceMetrics,
  type EvidenceRunRequest
} from "@/lib/schemas";

type CropRequest = Extract<EvidenceRunRequest, { module: "krishi" }>;

const DISPLAY_NAMES: Record<string, { crops: Record<string, string>; stages: Record<string, string> }> = {
  en: {
    crops: { Rice: "Rice", Wheat: "Wheat", Maize: "Maize", Cotton: "Cotton", Sugarcane: "Sugarcane", Pulses: "Pulses", Potato: "Potato", Vegetables: "Vegetables" },
    stages: { Sowing: "Sowing", Vegetative: "Growing", Flowering: "Flowering", Fruiting: "Fruiting", Harvesting: "Harvest" }
  },
  hi: {
    crops: { Rice: "धान", Wheat: "गेहूं", Maize: "मक्का", Cotton: "कपास", Sugarcane: "गन्ना", Pulses: "दालें", Potato: "आलू", Vegetables: "सब्जियां" },
    stages: { Sowing: "बुवाई", Vegetative: "फसल बढ़वार", Flowering: "फूल आना", Fruiting: "फल आना", Harvesting: "कटाई" }
  },
  bn: {
    crops: { Rice: "ধান", Wheat: "গম", Maize: "ভুট্টা", Cotton: "তুলা", Sugarcane: "আখ", Pulses: "ডাল", Potato: "আলু", Vegetables: "সবজি" },
    stages: { Sowing: "বপন", Vegetative: "বৃদ্ধি পর্যায়", Flowering: "ফুল আসা", Fruiting: "ফল আসা", Harvesting: "ফসল কাটা" }
  }
};

interface AgronomyStepTemplate {
  text: string;
  kind: "source_action" | "watch" | "contact" | "verify";
}

const AGRONOMY_STEPS: Record<string, Record<string, Record<string, AgronomyStepTemplate[]>>> = {
  en: {
    Sugarcane: {
      Harvesting: [
        { text: "Cut low at ground level: The sweetest juice is at the very bottom of the sugarcane stalk. Do not leave tall stumps in the soil, or you will lose 10 to 15 percent of your total sugar harvest.", kind: "source_action" },
        { text: "Stop watering 10 to 15 days before cutting: Let the field dry out before you start harvesting. This concentrates the sweetness in the stalks and makes it easy to walk and cut in the field without getting stuck in mud.", kind: "source_action" },
        { text: "Clean off dried leaves and mud: Pull off dry leaves, green top shoots, and dirt before tying the canes into bundles. Clean canes get weighed accurately and fetch a better price at the sugar mill or market.", kind: "source_action" },
        { text: "Send to the mill within 24 to 48 hours: Take your cut sugarcane to the mill or crusher within 1 to 2 days. If cut cane sits out in the hot sun for days, the juice dries up and loses weight.", kind: "source_action" }
      ],
      Flowering: [
        { text: "Keep the soil moist: Make sure the field has steady moisture. Lack of water when flowers appear makes the stalks thin and reduces juice.", kind: "source_action" },
        { text: "Tie stalks together: Tie neighboring sugarcane clumps together so strong winds or sudden rain do not knock down the tall canes.", kind: "source_action" },
        { text: "Check for red rot or top borers: Walk through your field. If any stalks turn yellow or dry up, cut them out and remove them from the field.", kind: "watch" }
      ],
      Vegetative: [
        { text: "Remove weeds early: Weed your field while the cane is young so the crop gets all the nutrients and sunlight.", kind: "source_action" },
        { text: "Apply fertilizer on moist soil: Give the recommended fertilizer in split doses when the soil is damp so roots absorb it quickly.", kind: "source_action" },
        { text: "Keep water channels clear: Ensure irrigation ditches are clean so water reaches every row evenly without waterlogging.", kind: "source_action" }
      ],
      Sowing: [
        { text: "Use healthy seed cane: Select thick, healthy 8 to 10 month old canes with active buds for planting.", kind: "source_action" },
        { text: "Plant in deep furrows: Lay the cut setts in moist furrows with organic compost and cover with 2 inches of soil.", kind: "source_action" },
        { text: "Water lightly right after planting: Give a light watering immediately so the buds sprout quickly.", kind: "source_action" }
      ]
    },
    Rice: {
      Harvesting: [
        { text: "Harvest when golden: Cut your paddy when 80 to 85 percent of the earheads turn golden yellow and grain moisture is around 20 to 22 percent.", kind: "source_action" },
        { text: "Cut after morning dew dries: Cut during dry sunny hours. Place harvested sheaves on clean tarpaulins rather than wet soil.", kind: "source_action" },
        { text: "Thresh and sun-dry promptly: Thresh within 1 to 2 days. Dry grains on clean sheets for 2 to 3 days until moisture drops to 12 to 14 percent for safe keeping.", kind: "source_action" },
        { text: "Store off the ground: Put clean grain in dry bags placed on wooden planks at least 1 foot away from walls to keep moisture and rats away.", kind: "source_action" }
      ],
      Flowering: [
        { text: "Maintain shallow water: Keep 1 to 2 inches of standing water in the field while flowers are blooming.", kind: "source_action" },
        { text: "Avoid morning chemical sprays: Do not spray between 9 AM and 11 AM so friendly pollinating bees are not harmed.", kind: "watch" },
        { text: "Inspect panicles for blast: Check newly emerging grain heads for brown spots or black necks. Drain excess water if flooded.", kind: "watch" }
      ],
      Vegetative: [
        { text: "Keep field weed-free: Weed early during tillering so young shoots multiply and grow strong roots.", kind: "source_action" },
        { text: "Walk field in zigzag pattern: Check under leaves for stem borer eggs or leaf folder caterpillars once a week.", kind: "watch" },
        { text: "Give fertilizer in 2 to 3 smaller doses: Split your urea application so plants absorb food steadily.", kind: "source_action" }
      ],
      Sowing: [
        { text: "Select heavy, healthy seeds: Soak seeds in salt water to float out hollow seeds, keeping only solid seeds for sowing.", kind: "verify" },
        { text: "Prepare raised nursery beds: Mix well-rotted cow dung manure into seedbed soil and keep moist.", kind: "source_action" }
      ]
    },
    Wheat: {
      Harvesting: [
        { text: "Test grain with thumbnail: Cut wheat when grains feel hard and do not dent easily with your thumbnail (moisture below 15 percent).", kind: "source_action" },
        { text: "Harvest on dry, sunny days: Avoid cutting in cloudy or damp weather so grain heads do not get moldy.", kind: "source_action" },
        { text: "Sun-dry to 10 to 12 percent moisture: Spread grains on clean sheets in the sun for 2 to 3 days before packing.", kind: "source_action" },
        { text: "Use clean, dry gunny bags: Store in clean bags placed on raised wooden planks in a dry, ventilated room.", kind: "source_action" }
      ],
      Flowering: [
        { text: "Light watering during flowering: Give a light irrigation when grains are forming. Do not flood during windy days.", kind: "source_action" },
        { text: "Check for rust: Look at top leaves for yellow or orange powdery dust (rust). Contact your local agricultural office if spotted.", kind: "watch" }
      ],
      Vegetative: [
        { text: "First watering at 20 to 25 days: The crown root watering is critical for wheat roots to branch out.", kind: "source_action" },
        { text: "Remove winter weeds: Pull out weeds before they steal water and fertilizer from young wheat plants.", kind: "source_action" }
      ],
      Sowing: [
        { text: "Sow at 4 to 5 cm depth: Sow certified seed in a well-leveled, moist seedbed for even germination.", kind: "source_action" }
      ]
    },
    Cotton: {
      Harvesting: [
        { text: "Pick fully opened dry bolls: Pick cotton during sunny afternoon hours. Never pick dew-moistened cotton in the early morning.", kind: "source_action" },
        { text: "Keep cotton clean: Remove dry leaves, bracts, and yellow-stained cotton. Clean cotton fetches top market price.", kind: "source_action" },
        { text: "Sun-dry for 4 to 6 hours: Spread picked cotton on clean tarpaulins in the sun so moisture drops below 8 percent.", kind: "source_action" },
        { text: "Store in a dry room: Keep packed bags away from water, dirt, and engine oil in a clean shed.", kind: "source_action" }
      ],
      Flowering: [
        { text: "Avoid water stress: Keep soil moderately moist; dry soil causes flower buds to drop off early.", kind: "source_action" },
        { text: "Hang pheromone traps: Monitor for pink bollworm moths by putting 2 to 3 traps per acre.", kind: "watch" }
      ],
      Vegetative: [
        { text: "Thin out seedlings: Remove weak crowded seedlings at 15 to 20 days so each plant gets space to grow wide.", kind: "source_action" },
        { text: "Inspect underside of leaves: Look for tiny green jassids or whiteflies under the leaves once a week.", kind: "watch" }
      ],
      Sowing: [
        { text: "Plant certified hybrid seed: Plant on raised ridges with organic manure when soil is warm.", kind: "source_action" }
      ]
    },
    Potato: {
      Harvesting: [
        { text: "Cut foliage 10 to 12 days before digging: Cut the green vines above ground so potato skins harden, preventing peeling and rotting.", kind: "source_action" },
        { text: "Dig when soil is dry: Harvest in dry weather so wet mud does not stick to potatoes and cause rot.", kind: "source_action" },
        { text: "Cure in shade for 10 to 15 days: Keep dug potatoes in a cool, shaded place so small cuts heal over safely.", kind: "source_action" },
        { text: "Separate damaged tubers: Discard green, cut, or rotten potatoes. Pack only clean sound tubers into mesh bags.", kind: "source_action" }
      ],
      Flowering: [
        { text: "Keep regular moisture: Water lightly every few days while potatoes are growing underneath. Don't let soil dry out completely.", kind: "source_action" },
        { text: "Mound soil around stems: Earth up soil around the base so growing potatoes are completely buried and do not turn green.", kind: "source_action" },
        { text: "Check for blight spots: Look for dark water-soaked spots on leaves during humid or cloudy days.", kind: "watch" }
      ],
      Vegetative: [
        { text: "First earthing-up at 15 to 20 cm height: Hoe and mound soft soil around young plants.", kind: "source_action" }
      ],
      Sowing: [
        { text: "Plant disease-free sprouted tubers: Use certified seed potatoes with 2 to 3 healthy sprouts at 5 to 7 cm depth.", kind: "source_action" }
      ]
    }
  },
  hi: {
    Sugarcane: {
      Harvesting: [
        { text: "गन्ने को बिल्कुल जमीन से सटाकर काटें: सबसे ज्यादा और मीठा रस गन्ने के निचले हिस्से में होता है। ऊपर से काटने पर 10 से 15 प्रतिशत फसल और चीनी का नुकसान हो जाता है।", kind: "source_action" },
        { text: "कटाई से 10 से 15 दिन पहले पानी देना बंद कर दें: खेत को कटाई से पहले सूखने दें। इससे गन्ने का रस अधिक गाढ़ा और मीठा हो जाता है, और सूखे खेत में कटाई करना बहुत आसान होता है।", kind: "source_action" },
        { text: "सूखी पत्तियां और मिट्टी साफ करें: गन्ने के बंडल बांधने से पहले सूखी पत्तियां, अगोले और मिट्टी हटा लें। साफ गन्ने का मिल में वजन सही होता है और बेहतर दाम मिलता है।", kind: "source_action" },
        { text: "कटाई के 24 से 48 घंटे के भीतर मिल भेजें: कटे हुए गन्ने को 1 से 2 दिन के अंदर मिल या क्रशर तक पहुंचा दें। धूप में ज्यादा दिन पड़े रहने से रस सूख जाता है और वजन घट जाता है।", kind: "source_action" }
      ],
      Flowering: [
        { text: "खेत में नमी बनाए रखें: फूल आने के समय खेत में पानी की कमी न होने दें, नहीं तो तना पतला हो जाएगा।", kind: "source_action" },
        { text: "गन्नों को आपस में बांधें: तेज हवा और बारिश से गन्ने को गिरने से बचाने के लिए थानों को आपस में बांध दें।", kind: "source_action" },
        { text: "सड़न और कीड़ों की जांच करें: जो गन्ने पीले पड़कर सूख रहे हों, उन्हें काटकर खेत से बाहर निकाल दें।", kind: "watch" }
      ],
      Vegetative: [
        { text: "खरपतवार निकालें: जब गन्ना छोटा हो तभी घास-फूस साफ कर दें ताकि खाद और धूप पूरी फसल को मिले।", kind: "source_action" },
        { text: "गीली मिट्टी में खाद दें: जब खेत में नमी हो, तभी नाइट्रोजन खाद दें ताकि पौधे तेजी से बढ़ें।", kind: "source_action" },
        { text: "पानी की नालियां साफ रखें: नालियों को साफ रखें ताकि पूरे खेत में पानी एक समान पहुंचे।", kind: "source_action" }
      ],
      Sowing: [
        { text: "स्वस्थ बीज गन्ना चुनें: बुवाई के लिए 8 से 10 महीने पुराने स्वस्थ गन्ने के टुकड़ों का चुनाव करें।", kind: "source_action" },
        { text: "नालियों में गोबर खाद के साथ लगाएं: गहरी नालियों में गन्ने के टुकड़े रखकर हल्की मिट्टी और पानी दें।", kind: "source_action" }
      ]
    },
    Rice: {
      Harvesting: [
        { text: "सुनहरा होने पर काटें: जब 80 से 85 प्रतिशत बालियां सुनहरी पीली हो जाएं और दाने में 20 से 22 प्रतिशत नमी हो, तब कटाई करें।", kind: "source_action" },
        { text: "ओस सूखने के बाद सुबह काटें: धूप निकलने पर कटाई करें। कटी फसल को गीली मिट्टी पर न रखें, साफ तिरपाल पर रखें।", kind: "source_action" },
        { text: "तुरंत गहाई कर 2 से 3 दिन सुखाएं: कटाई के 1 से 2 दिन में गहाई कर लें और धूप में सुखाकर नमी 12 से 14 प्रतिशत तक लाएं।", kind: "source_action" },
        { text: "जमीन से ऊपर बोरियों में रखें: सूखे अनाज को साफ बोरियों में भरकर लकड़ी के तख्तों पर दीवार से 1 फुट दूर रखें।", kind: "source_action" }
      ],
      Flowering: [
        { text: "खेत में 1 से 2 इंच पानी बनाए रखें: फूल आने के समय खेत में पानी सूखने न दें।", kind: "source_action" },
        { text: "सुबह 9 से 11 बजे छिड़काव न करें: ताकि परागण करने वाले मित्र कीट सुरक्षित रहें।", kind: "watch" },
        { text: "बालियों पर काले धब्बे देखें: अगर बालियों पर फफूंद या काले धब्बे दिखें तो खेत से अतिरिक्त पानी निकाल दें।", kind: "watch" }
      ],
      Vegetative: [
        { text: "कल्ले फूटते समय घास निकालें: समय पर निराई करें ताकि पौधों में ज्यादा कल्ले फूटें।", kind: "source_action" },
        { text: "हफ्ते में एक बार तना छेदक कीट की जांच करें: पत्तियों के नीचे कीड़ों के अंडों पर नजर रखें।", kind: "watch" },
        { text: "खाद को 2 से 3 बार में बांटकर दें: यूरिया एक बार में डालने के बजाय दो-तीन किस्तों में दें।", kind: "source_action" }
      ],
      Sowing: [
        { text: "नमक के पानी में बीज छांटें: नमक मिले पानी में बीज डालें, ऊपर तैरने वाले खोखले बीज हटाकर भारी बीज ही बोएं।", kind: "verify" }
      ]
    },
    Wheat: {
      Harvesting: [
        { text: "नाखून से दाना दबाकर देखें: जब दाना नाखून से आसानी से न दबे और नमी 15 प्रतिशत से कम हो, तब गेहूं काटें।", kind: "source_action" },
        { text: "साफ धूप में कटाई करें: बादल या नमी वाले मौसम में गेहूं न काटें ताकि दाने में फफूंद न लगे।", kind: "source_action" },
        { text: "तिरपाल पर 2 से 3 दिन सुखाएं: अनाज को धूप में सुखाकर नमी 10 से 12 प्रतिशत पर लाकर बोरियों में भरें।", kind: "source_action" },
        { text: "सीलन और चूहों से बचाकर रखें: साफ बोरियों में भरकर सूखे कमरे में जमीन से ऊपर रखें।", kind: "source_action" }
      ],
      Flowering: [
        { text: "फूल आते समय हल्की सिंचाई करें: जब दाना बन रहा हो तब हल्का पानी दें, तेज हवा में पानी न दें।", kind: "source_action" },
        { text: "पीला या भूरा रतुआ देखें: पत्तियों पर पीला पाउडर दिखे तो तुरंत कृषि केंद्र को बताएं।", kind: "watch" }
      ],
      Vegetative: [
        { text: "बुवाई के 20 से 25 दिन बाद पहला पानी दें: जड़ें बनते समय यह पहला पानी सबसे जरूरी होता है।", kind: "source_action" },
        { text: "गुल्ली-डंडा खरपतवार निकालें: खरपतवारों को समय पर निकाल दें ताकि गेहूं तेजी से बढ़े।", kind: "source_action" }
      ],
      Sowing: [
        { text: "4 से 5 सेमी गहराई पर बोएं: खेत को समतल कर अच्छी नमी में बुवाई करें।", kind: "source_action" }
      ]
    },
    Cotton: {
      Harvesting: [
        { text: "दोपहर में खिली हुई सूखी कपास चुनें: धूप निकलने पर ही कपास चुनें; सुबह की ओस में गीली कपास कभी न तोड़ें।", kind: "source_action" },
        { text: "कपास में कचरा और पत्तियां न मिलाएं: साफ कपास का बाजार में सबसे अच्छा भाव मिलता है।", kind: "source_action" },
        { text: "तिरपाल पर 4 से 6 घंटे धूप में सुखाएं: नमी 8 प्रतिशत से कम होने तक धूप में सुखाएं।", kind: "source_action" },
        { text: "साफ और सूखे कमरे में रखें: पानी और मिट्टी से दूर सुरक्षित स्थान पर रखें।", kind: "source_action" }
      ],
      Flowering: [
        { text: "खेत में हल्की नमी रखें: ज्यादा सूखा या ज्यादा पानी होने से फूल और कलियां झड़ जाती हैं।", kind: "source_action" },
        { text: "गुलाबी सुंडी के लिए ट्रैप लगाएं: खेत में 2 से 3 फेरोमोन ट्रैप लगाएं।", kind: "watch" }
      ],
      Vegetative: [
        { text: "15 से 20 दिन बाद घने पौधे निकालें: पौधों के बीच सही दूरी रखें।", kind: "source_action" },
        { text: "पत्तियों के नीचे रस चूसक कीड़ों की जांच करें: सफेद मक्खी या हरे तेले पर नजर रखें।", kind: "watch" }
      ],
      Sowing: [
        { text: "प्रमाणित हाइब्रिड बीज मेड़ों पर लगाएं: अच्छी गोबर खाद के साथ बुवाई करें।", kind: "source_action" }
      ]
    },
    Potato: {
      Harvesting: [
        { text: "खुदाई से 10 से 12 दिन पहले बेल काट दें: ऊपर की हरी बेल काट दें ताकि आलू का छिलका सख्त हो जाए और सड़े नहीं।", kind: "source_action" },
        { text: "सूखी मिट्टी में खुदाई करें: गीली मिट्टी में खुदाई न करें ताकि आलू पर कीचड़ न चिपके।", kind: "source_action" },
        { text: "छाया में 10 से 15 दिन सुखाएं: खुदाई के बाद छायादार जगह पर रखें ताकि कटे निशान भर जाएं।", kind: "source_action" },
        { text: "सड़े और हरे आलू अलग करें: केवल साफ और अच्छे आलू जालीदार बोरियों में रखें।", kind: "source_action" }
      ],
      Flowering: [
        { text: "खेत में लगातार हल्की नमी रखें: कंद बनते समय पानी की कमी न होने दें।", kind: "source_action" },
        { text: "जड़ों पर मिट्टी चढ़ाएं: ताकि आलू धूप लगने से हरे न पड़ें।", kind: "source_action" },
        { text: "झुलसा रोग की जांच करें: पत्तियों पर काले-भूरे धब्बे दिखते ही ध्यान दें।", kind: "watch" }
      ],
      Vegetative: [
        { text: "पौधे 15 से 20 सेमी होने पर मिट्टी चढ़ाएं: साथ ही घास-फूस निकालें।", kind: "source_action" }
      ],
      Sowing: [
        { text: "2 से 3 आंख वाले अंकुरित आलू लगाएं: भुरभुरी मिट्टी में 5 से 7 सेमी गहराई पर लगाएं।", kind: "source_action" }
      ]
    }
  },
  bn: {
    Sugarcane: {
      Harvesting: [
        { text: "আখ একেবারে মাটির সমান করে কাটুন: সবচেয়ে মিষ্টি রস থাকে আখের গোড়ার দিকে। উপরে কেটে গোড়ায় অংশ রেখে দিলে মোট ফসলের ১০ থেকে ১৫ শতাংশ ক্ষতি হয়।", kind: "source_action" },
        { text: "কাটার ১০ থেকে ১৫ দিন আগে জল দেওয়া বন্ধ করুন: কাটার আগে জমি কিছুটা শুকিয়ে নিন। এতে আখের রস আরও মিষ্টি হয় এবং শুকনো জমিতে ফসল কাটা অনেক সহজ হয়।", kind: "source_action" },
        { text: "শুকনো পাতা ও মাটি পরিষ্কার করুন: আখের আঁটি বাঁধার আগে শুকনো পাতা ও মাটি পরিষ্কার করে নিন। পরিষ্কার আখ মিলে বা বাজারে দিলে ভালো দাম পাওয়া যায়।", kind: "source_action" },
        { text: "কাটার ২৪ থেকে ৪৮ ঘণ্টার মধ্যে মিলে পাঠান: কাটা আখ ১ থেকে ২ দিনের মধ্যে মিলে বা বাজারে পৌঁছে দিন। রোদে বেশি দিন ফেলে রাখলে রস শুকিয়ে যায় এবং ওজন কমে যায়।", kind: "source_action" }
      ],
      Flowering: [
        { text: "মাটিতে পর্যাপ্ত রস রাখুন: ফুল আসার সময় জমিতে জলের অভাব হলে আখের ডাঁটা সরু হয়ে যায়।", kind: "source_action" },
        { text: "আখ গাছগুলো একসাথে বেঁধে দিন: ঝড়বৃষ্টিতে হেলে পড়া ঠেকাতে পাশাপাশি কয়েকটি গাছ একসাথে বেঁধে রাখুন।", kind: "source_action" },
        { text: "লাল পচা রোগের লক্ষণ দেখুন: যে গাছগুলো হলুদ হয়ে শুকিয়ে যাচ্ছে সেগুলো জমি থেকে তুলে নষ্ট করে ফেলুন।", kind: "watch" }
      ],
      Vegetative: [
        { text: "আখ ছোট থাকতেই আগাছা পরিষ্কার করুন: জমি পরিষ্কার রাখলে সার ও সূর্যের আলো পুরো ফসলে পৌঁছায়।", kind: "source_action" },
        { text: "মাটিতে রস থাকলে সার দিন: শুকনো মাটিতে নয়, আর্দ্র জমিতে নাইট্রোজেন সার প্রয়োগ করুন।", kind: "source_action" },
        { text: "সেচের নালা পরিষ্কার রাখুন: সব সারিতে যেন সমান জল পৌঁছায়।", kind: "source_action" }
      ],
      Sowing: [
        { text: "সুস্থ বীজ আখ রোপণ করুন: ৮ থেকে ১০ মাস বয়সী সুস্থ ও রোগমুক্ত আখের টুকরো রোপণ করুন।", kind: "source_action" },
        { text: "গভীর নালায় গোবর সার দিয়ে লাগান: জৈব সারের সাথে টুকরোগুলি বসিয়ে হালকা সেচ দিন।", kind: "source_action" }
      ]
    },
    Rice: {
      Harvesting: [
        { text: "শীষ সোনালী হলে কাটুন: যখন ৮০ থেকে ৮৫ শতাংশ শিষ সোনালী হলুদ হয় এবং দানায় ২০ থেকে ২২ শতাংশ আর্দ্রতা থাকে, তখন ধান কাটুন।", kind: "source_action" },
        { text: "রোদের দিনে শিশির শুকানোর পর কাটুন: ভেজা মাটিতে না রেখে পরিষ্কার ত্রিপলের উপর কাটা ধান রাখুন।", kind: "source_action" },
        { text: "মাড়াই করে ২ থেকে ৩ দিন রোদে শুকান: কাটার ১ থেকে ২ দিনের মধ্যে মাড়াই করে শুকিয়ে আর্দ্রতা ১২ থেকে ১৪ শতাংশে নামিয়ে আনুন।", kind: "source_action" },
        { text: "মাটি থেকে উঁচুতে বস্তা রাখুন: পরিষ্কার বস্তায় ভরে কাঠের পাটাতনের উপর দেওয়াল থেকে ১ ফুট দূরে সংরক্ষণ করুন।", kind: "source_action" }
      ],
      Flowering: [
        { text: "জমিতে ১ থেকে ২ ইঞ্চি জল রাখুন: ফুল আসা ও পরাগায়নের সময় জমি শুকিয়ে যেতে দেবেন না।", kind: "source_action" },
        { text: "সকাল ৯টা থেকে ১১টায় স্প্রে করবেন না: পরাগায়নকারী বন্ধু পোকা বাঁচাতে সকালের দিকে কীটনাশক দেবেন না।", kind: "watch" },
        { text: "শীষে কালো দাগ পরীক্ষা করুন: ব্লাইট বা ছত্রাকের লক্ষণ দেখলে অতিরিক্ত জল বের করে দিন।", kind: "watch" }
      ],
      Vegetative: [
        { text: "কুশি আসার সময় নিড়ানি দিন: আগাছা পরিষ্কার রাখলে কুশি বেশি হয় এবং গাছ পুষ্ট হয়।", kind: "source_action" },
        { text: "মাজরা পোকার ডিম ও শুঁয়োপোকা খুঁজুন: সপ্তাহে একবার জমির পাতাগুলো উল্টে দেখুন।", kind: "watch" },
        { text: "ইউরিয়া সার ২ থেকে ৩ কিস্তিতে দিন: একবারে বেশি সার না দিয়ে ভাগ করে দিন।", kind: "source_action" }
      ],
      Sowing: [
        { text: "লবণ জলে বীজ বেছে নিন: লবণ জলে ডুবিয়ে চিটে বীজ ভাসিয়ে ফেলে দিয়ে ভালো বীজ রোপণ করুন।", kind: "verify" }
      ]
    },
    Wheat: {
      Harvesting: [
        { text: "নখে দানা না বসলে কাটুন: যখন দানা সহজে নখে বসে না এবং আর্দ্রতা ১৫ শতাংশের কম হয়, তখন গম কাটুন।", kind: "source_action" },
        { text: "শুকনো আবহাওয়ায় কাটুন: মেঘলা দিনে গম কাটবেন না যাতে দানা ভিজে ছত্রাক না ধরে।", kind: "source_action" },
        { text: "ত্রিপলে ২ থেকে ৩ দিন শুকান: রোদে শুকিয়ে আর্দ্রতা ১০ থেকে ১২ শতাংশে নামিয়ে এনে বস্তায় ভরুন।", kind: "source_action" },
        { text: "শুকনো গুদামে কাঠের উপর রাখুন: মেঝে ও দেওয়াল থেকে দূরে পরিষ্কার ঘরে সংরক্ষণ করুন।", kind: "source_action" }
      ],
      Flowering: [
        { text: "দানা ভরার সময় হালকা সেচ দিন: গম পুষ্ট হওয়ার সময় হালকা জল দিন, বাতাসে জল দেবেন না।", kind: "source_action" },
        { text: "হলুদ গুঁড়ো রোগ দেখুন: পাতায় গুঁড়ো রোগ দেখলে কৃষি অফিসে যোগাযোগ করুন।", kind: "watch" }
      ],
      Vegetative: [
        { text: "২০ থেকে ২৫ দিনে প্রথম সেচ দিন: শিকড় গজানোর সময় এই প্রথম সেচ সবচেয়ে জরুরি।", kind: "source_action" },
        { text: "আগাছা তুলে ফেলুন: সময়মতো আগাছা পরিষ্কার করুন।", kind: "source_action" }
      ],
      Sowing: [
        { text: "৪ থেকে ৫ সেমি গভীরে বীজ বপন করুন: সমান ও আর্দ্র জমিতে বীজ ফেলুন।", kind: "source_action" }
      ]
    },
    Cotton: {
      Harvesting: [
        { text: "দুপুরে ফোটা শুকনো তুলো তুলুন: রোদে শুকানো তুলো তুলুন, ভোরের শিশিরে ভেজা তুলো তুলবেন না।", kind: "source_action" },
        { text: "শুকনো পাতা ও ময়লা মুক্ত রাখুন: পরিষ্কার তুলো বাজারে সর্বোচ্চ দামে বিক্রি হয়।", kind: "source_action" },
        { text: "৪ থেকে ৬ ঘণ্টা রোদে শুকান: আর্দ্রতা ৮ শতাংশের নিচে নামিয়ে আনুন।", kind: "source_action" },
        { text: "শুকনো ঘরে নিরাপদে রাখুন: ধুলো ও জল থেকে দূরে রাখুন।", kind: "source_action" }
      ],
      Flowering: [
        { text: "মাটিতে নিয়মিত রস রাখুন: খরায় বা বেশি জলে ফুল ও কুঁড়ি ঝরে পড়ে।", kind: "source_action" },
        { text: "পোকা মারার ফাঁদ লাগান: জমিতে ২ থেকে ৩টি ফেরোমোন ফাঁদ রাখুন।", kind: "watch" }
      ],
      Vegetative: [
        { text: "১৫ থেকে ২০ দিনে চারা পাতলা করুন: গাছের দূরত্ব বজায় রাখুন।", kind: "source_action" },
        { text: "পাতার নিচে পোকা পরীক্ষা করুন: সাদা মাছি ও শোষক পোকা দেখুন।", kind: "watch" }
      ],
      Sowing: [
        { text: "উঁচু ঢিবিতে হাইব্রিড বীজ বপন করুন: গোবর সারের সাথে বপন করুন।", kind: "source_action" }
      ]
    },
    Potato: {
      Harvesting: [
        { text: "তোলার ১০ থেকে ১২ দিন আগে ডাল কেটে দিন: গাছের ডাল কেটে দিন যাতে আলুর খোসা শক্ত হয় এবং পচন না ধরে।", kind: "source_action" },
        { text: "শুকনো মাটিতে আলু তুলুন: ভেজা কাদায় তুলবেন না যাতে আলুতে কাদা না লাগে।", kind: "source_action" },
        { text: "ছায়ায় ১০ থেকে ১৫ দিন শুকান: কাটার দাগ যেন শুকিয়ে যায়।", kind: "source_action" },
        { text: "পচা ও কাটা আলু আলাদা করুন: ভালো আলু জালের বস্তায় ভরুন।", kind: "source_action" }
      ],
      Flowering: [
        { text: "মাটিতে হালকা রস রাখুন: আলু ফোটার সময় মাটি শুকনো হতে দেবেন না।", kind: "source_action" },
        { text: "গোড়ায় মাটি তুলে দিন: যাতে আলু রোদে সবুজ না হয়।", kind: "source_action" },
        { text: "ধসা রোগের দাগ দেখুন: পাতায় কালো দাগের ওপর নজর রাখুন।", kind: "watch" }
      ],
      Vegetative: [
        { text: "গাছ ১৫ থেকে ২০ সেমি হলে মাটি তুলুন: নিড়ানি দিয়ে ঘাস তুলুন।", kind: "source_action" }
      ],
      Sowing: [
        { text: "অঙ্কুরিত ভালো বীজ আলু রোপণ করুন: ৫ থেকে ৭ সেমি গভীরে লাগান।", kind: "source_action" }
      ]
    }
  }
};

const COPY = {
  en: {
    labels: {
      conclusion: "What the Searches Say",
      doNow: "What You Should Do Now",
      nextStep: "Best Next Step",
      sourceBacked: "From Verified Search",
      productGuidance: "Practical Farm Advice",
      whyConclusion: "Why this advice",
      coverage: (completed: number, planned: number, sources: number, failed: number) =>
        `${completed} of ${planned} searches completed · ${sources} sources reviewed · ${failed} unavailable`,
      serpApiNote: "Suggestions and conclusions are based on public web searches conducted using Serp API."
    },
    guidanceHeadline: (crop: string, district: string, stage: string) =>
      `${stage} Advice for ${crop} in ${district}`,
    guidanceSummary: (crop: string, district: string, stage: string, state: string, sourceCount: number, concern?: string) => {
      const intro = `We checked government agricultural updates, local weather reports, and mandi prices for ${crop} in ${district}, ${state} using Serp API.`;
      const stageNote = (stage === "Harvest" || stage === "Harvesting")
        ? `Good news: Your crop is ready for harvest. To get the best price and weight at the market, harvest in dry weather, cut low to the ground to save the sweetest juice, and deliver your harvest to the mill or mandi within 1 to 2 days.`
        : `Your crop is in the ${stage} stage. Keep the soil evenly moist, inspect your field margins once a week, and contact your local agricultural extension office before applying any major chemicals.`;
      const concernNote = concern
        ? ` For your concern (“${concern}”): Check the affected spots first, make sure there is no standing water in low patches, and carry a leaf sample to your nearest Krishi Vigyan Kendra.`
        : "";
      const attribution = `\n\nSuggestions and conclusions are based on public web searches conducted using Serp API.`;
      return `${intro}\n\n${stageNote}${concernNote}${attribution}`;
    },
    watchHeadline: (crop: string, district: string, stage: string) =>
      `${stage} Weather & Alert Watch for ${crop} in ${district}`,
    watchSummary: (crop: string, district: string, state: string, sourceCount: number, concern?: string) => {
      const intro = `Recent news or weather alerts were found for ${crop} in ${district}, ${state} across ${sourceCount} reviewed search results.`;
      const note = `Please inspect your field today. Make sure drainage paths are clear so rainwater does not flood the roots.`;
      const concernNote = concern ? ` Check areas where “${concern}” was noticed.` : "";
      const attribution = `\n\nSuggestions and conclusions are based on public web searches conducted using Serp API.`;
      return `${intro}\n\n${note}${concernNote}${attribution}`;
    },
    unavailableHeadline: (crop: string, district: string) =>
      `Search was incomplete for ${crop} in ${district}`,
    unavailableSummary:
      "The search service did not complete enough searches. Please call your local Kisan Call Centre or Krishi Vigyan Kendra for local guidance.",
    sourceAction: (crop: string, district: string, stage: string, text: string) =>
      `${text}`,
    inspect: (crop: string, district: string) =>
      `Inspect the ${crop} field in ${district} to verify moisture and plant standing before taking next steps.`,
    contact: (name: string) =>
      `Visit or call ${name} for free in-person advice and bring a sample of your crop.`,
    kcc: "Call the Kisan Call Centre at 1800-180-1551: This is a free government phone number for any question about your crop, local mandi rates, or mill slips.",
    nextGuidance: (stage: string, concern?: string) => {
      const isHarvest = stage.toLowerCase().includes("harvest");
      if (isHarvest) {
        return "Follow the numbered harvest steps above, verify mandi MSP before dispatch, and call the free Kisan Call Centre (1800-180-1551) if you need help with transport or mandi prices.";
      }
      if (concern) {
        return `Follow the field actions above: inspect spots where "${concern}" was seen, keep soil moisture balanced, and call the free Kisan Call Centre (1800-180-1551) for immediate agricultural scientist guidance.`;
      }
      return "Follow the step-by-step field actions above: maintain balanced moisture, weed early, and call the free Kisan Call Centre (1800-180-1551) for immediate agronomy guidance.";
    },
    nextWatch: "Inspect the crop today; call your local Krishi Vigyan Kendra if weather or pest damage spreads.",
    nextUnavailable: "Call the Kisan Call Centre at 1800-180-1551 while the search service is unavailable.",
    partial: " Some planned searches were temporarily slow, but your key crop actions are listed below."
  },
  hi: {
    labels: {
      conclusion: "खोज निष्कर्ष और मुख्य सलाह",
      doNow: "अब आपको क्या करना चाहिए",
      nextStep: "अगला सबसे जरूरी कदम",
      sourceBacked: "सरकारी व वेब स्रोतों से",
      productGuidance: "व्यावहारिक कृषि परामर्श",
      whyConclusion: "यह सलाह क्यों दी गई",
      coverage: (completed: number, planned: number, sources: number, failed: number) =>
        `${planned} में से ${completed} खोज पूरी · ${sources} स्रोत देखे गए · ${failed} उपलब्ध नहीं`,
      serpApiNote: "ये सुझाव और निष्कर्ष Serp API का उपयोग करके की गई सार्वजनिक वेब खोजों पर आधारित हैं।"
    },
    guidanceHeadline: (crop: string, district: string, stage: string) =>
      `${district} में ${crop} की ${stage} सलाह और जरूरी कदम`,
    guidanceSummary: (crop: string, district: string, stage: string, state: string, sourceCount: number, concern?: string) => {
      const intro = `हमने Serp API का उपयोग करके ${district}, ${state} में ${crop} के लिए सरकारी कृषि सलाह, स्थानीय मौसम और मंडी भाव की जांच की है।`;
      const stageNote = (stage === "कटाई" || stage === "Harvest" || stage === "Harvesting")
        ? `अच्छी खबर: आपकी फसल कटाई के लिए तैयार है। मंडी में सबसे अच्छा भाव और पूरा वजन पाने के लिए सूखे मौसम में कटाई करें, बिल्कुल जमीन से सटाकर काटें ताकि मीठा रस न छूटे, और 1 से 2 दिन के अंदर अपनी फसल मिल तक पहुंचाएं।`
        : `आपकी फसल ${stage} अवस्था में है। खेत में हल्की नमी बनाए रखें, हफ्ते में एक बार खेत का चक्कर लगाएं और कोई भी दवा डालने से पहले नजदीकी कृषि अधिकारी से सलाह लें।`;
      const concernNote = concern
        ? ` आपकी चिंता (“${concern}”) के लिए: प्रभावित जगह को पहले देखें, पानी भरा हो तो निकालें और पौधे का पत्ता नजदीकी कृषि विज्ञान केंद्र में दिखाएं।`
        : "";
      const attribution = `\n\nये सुझाव और निष्कर्ष Serp API का उपयोग करके की गई सार्वजनिक वेब खोजों पर आधारित हैं।`;
      return `${intro}\n\n${stageNote}${concernNote}${attribution}`;
    },
    watchHeadline: (crop: string, district: string, stage: string) =>
      `${district} में ${crop} के लिए ${stage} मौसम अलर्ट और फसल सुरक्षा`,
    watchSummary: (crop: string, district: string, state: string, sourceCount: number, concern?: string) => {
      const intro = `${sourceCount} खोज परिणामों में ${district}, ${state} में ${crop} के लिए मौसम या समाचार अलर्ट मिले हैं।`;
      const note = `आज ही अपने खेत का निरीक्षण करें। जल निकासी के रास्ते साफ रखें ताकि बारिश का पानी खेत में जमा न हो।`;
      const concernNote = concern ? ` “${concern}” वाले हिस्सों की पहले जांच करें।` : "";
      const attribution = `\n\nये सुझाव और निष्कर्ष Serp API का उपयोग करके की गई सार्वजनिक वेब खोजों पर आधारित हैं।`;
      return `${intro}\n\n${note}${concernNote}${attribution}`;
    },
    unavailableHeadline: (crop: string, district: string) =>
      `${district} में ${crop} की खोज पूरी नहीं हो सकी`,
    unavailableSummary:
      "खोज सेवा पूरी तरह नहीं चल पाई। कृपया मुफ्त किसान कॉल सेंटर 1800-180-1551 पर कॉल करके स्थानीय सलाह लें।",
    sourceAction: (crop: string, district: string, stage: string, text: string) =>
      `${text}`,
    inspect: (crop: string, district: string) =>
      `${district} में ${crop} के खेत की नमी और पौधों की स्थिति का खुद जाकर निरीक्षण करें।`,
    contact: (name: string) =>
      `मुफ्त सलाह के लिए ${name} से संपर्क करें और अपनी फसल का नमूना साथ ले जाएं।`,
    kcc: "मुफ्त किसान हेल्पलाइन 1800-180-1551 पर कॉल करें: यह सरकारी नंबर बिल्कुल मुफ्त है। फसल, मंडी भाव या पर्ची से जुड़े किसी भी सवाल के लिए तुरंत बात करें।",
    nextGuidance: (stage: string, concern?: string) => {
      const isHarvest = stage.toLowerCase().includes("harvest") || stage.includes("कटाई");
      if (isHarvest) {
        return "ऊपर दिए कटाई और सुखाई के जरूरी कदमों का पालन करें, और मंडी भाव या पर्ची सहायता के लिए मुफ्त किसान हेल्पलाइन (1800-180-1551) पर बात करें।";
      }
      if (concern) {
        return `ऊपर दिए कदमों का पालन करें: जहाँ "${concern}" दिखा है वहां पहले जांचें, खेत में जल निकासी रखें और मुफ्त किसान कॉल सेंटर (1800-180-1551) से तुरंत वैज्ञानिक सलाह लें।`;
      }
      return "ऊपर दिए खेत सुरक्षा के जरूरी कदमों का पालन करें: खेत में उचित नमी रखें, खरपतवार हटाएं और मुफ्त किसान कॉल सेंटर (1800-180-1551) से तुरंत सलाह लें।";
    },
    nextWatch: "खेत की जांच करें; मौसम खराब होने या बीमारी दिखने पर नजदीकी कृषि विज्ञान केंद्र से संपर्क करें।",
    nextUnavailable: "खोज सेवा उपलब्ध न होने पर किसान कॉल सेंटर 1800-180-1551 पर कॉल करें।",
    partial: " कुछ खोजें धीमी थीं, लेकिन आपके लिए जरूरी कृषि कदम नीचे दिए गए हैं।"
  },
  bn: {
    labels: {
      conclusion: "অনুসন্ধানের সারসংক্ষেপ ও সহজ পরামর্শ",
      doNow: "এখন আপনার কী করা উচিত",
      nextStep: "পরবর্তী জরুরি পদক্ষেপ",
      sourceBacked: "যাচাইকৃত তথ্যসূত্র থেকে",
      productGuidance: "ব্যবহারিক কৃষি পরামর্শ",
      whyConclusion: "কেন এই পরামর্শ দেওয়া হলো",
      coverage: (completed: number, planned: number, sources: number, failed: number) =>
        `${planned}-এর মধ্যে ${completed}টি অনুসন্ধান সম্পূর্ণ · ${sources}টি উৎস পর্যালোচনা · ${failed}টি পাওয়া যায়নি`,
      serpApiNote: "এই পরামর্শ ও সিদ্ধান্তসমূহ Serp API ব্যবহার করে পরিচালিত উন্মুক্ত ওয়েব অনুসন্ধানের উপর ভিত্তি করে তৈরি।"
    },
    guidanceHeadline: (crop: string, district: string, stage: string) =>
      `${district}-এ ${crop}-এর ${stage} পরামর্শ ও করণীয়`,
    guidanceSummary: (crop: string, district: string, stage: string, state: string, sourceCount: number, concern?: string) => {
      const intro = `আমরা Serp API ব্যবহার করে ${district}, ${state}-এ ${crop}-এর জন্য সরকারি কৃষি পরামর্শ, স্থানীয় আবহাওয়া ও মান্ডি দর যাচাই করেছি।`;
      const stageNote = (stage === "ফসল কাটা" || stage === "Harvest" || stage === "Harvesting")
        ? `ভালো খবর: আপনার ফসল এখন কাটার জন্য উপযুক্ত। বাজারে সর্বোচ্চ দর ও সঠিক ওজন পেতে শুকনো আবহাওয়ায় ফসল কাটুন, মাটির কাছ থেকে কাটুন যাতে মিষ্টি রস বাদ না পড়ে, এবং ১ থেকে ২ দিনের মধ্যে মিলে বা বাজারে ফসল পৌঁছে দিন।`
        : `আপনার ফসল এখন ${stage} পর্যায়ে আছে। জমিতে হালকা রস রাখুন, সপ্তাহে একবার জমি ঘুরে দেখুন এবং জমিতে কোনো রাসায়নিক দেওয়ার আগে কৃষি বিশেষজ্ঞের সাথে কথা বলুন।`;
      const concernNote = concern
        ? ` আপনার উদ্বেগের বিষয়ে (“${concern}”): আক্রান্ত জায়গাটি আগে ভালো করে দেখুন, জল জমলে বের করে দিন এবং রোগ নির্ণয়ে নিকটস্থ কেকেভি (KVK)-তে পাতার নমুনা দেখান।`
        : "";
      const attribution = `\n\nএই পরামর্শ ও সিদ্ধান্তসমূহ Serp API ব্যবহার করে পরিচালিত উন্মুক্ত ওয়েব অনুসন্ধানের উপর ভিত্তি করে তৈরি।`;
      return `${intro}\n\n${stageNote}${concernNote}${attribution}`;
    },
    watchHeadline: (crop: string, district: string, stage: string) =>
      `${district}-এ ${crop}-এর জন্য ${stage} আবহাওয়া সতর্কতা ও মাঠ নজরদারি`,
    watchSummary: (crop: string, district: string, state: string, sourceCount: number, concern?: string) => {
      const intro = `${sourceCount}টি অনুসন্ধান সূত্রে ${district}, ${state}-এ ${crop}-এর জন্য আবহাওয়া বা সংবাদ সংক্রান্ত সতর্কতা পাওয়া গেছে।`;
      const note = `আজই আপনার জমি পরীক্ষা করুন। জল নিষ্কাশনের নালা পরিষ্কার রাখুন যাতে বৃষ্টির জল জমিতে জমে না থাকে।`;
      const concernNote = concern ? ` “${concern}” যেখানে দেখা গেছে সেখানে আগে পরীক্ষা করুন।` : "";
      const attribution = `\n\nএই পরামর্শ ও সিদ্ধান্তসমূহ Serp API ব্যবহার করে পরিচালিত উন্মুক্ত ওয়েব অনুসন্ধানের উপর ভিত্তি করে তৈরি।`;
      return `${intro}\n\n${note}${concernNote}${attribution}`;
    },
    unavailableHeadline: (crop: string, district: string) =>
      `${district}-এ ${crop}-এর অনুসন্ধান শেষ করা যায়নি`,
    unavailableSummary:
      "অনুসন্ধান পরিষেবা সম্পূর্ণ তথ্য সংগ্রহ করতে পারেনি। স্থানীয় পরামর্শ পেতে বিনামূল্যে কিষান কল সেন্টারে 1800-180-1551 নম্বরে ফোন করুন।",
    sourceAction: (crop: string, district: string, stage: string, text: string) =>
      `${text}`,
    inspect: (crop: string, district: string) =>
      `${district}-এ ${crop} ফসলের জমি নিজে গিয়ে দেখুন এবং আর্দ্রতা যাচাই করুন।`,
    contact: (name: string) =>
      `বিনামূল্যে পরামর্শের জন্য ${name}-এর সাথে যোগাযোগ করুন এবং ফসলের নমুনা সাথে রাখুন।`,
    kcc: "টোল-ফ্রি কিষান হেল্পলাইন 1800-180-1551 নম্বরে ফোন করুন: এটি একটি সম্পূর্ণ বিনামূল্যে সরকারি ফোন নম্বর। ফসল, মান্ডি দর বা যেকোনো সহায়তার জন্য সরাসরি কথা বলুন।",
    nextGuidance: (stage: string, concern?: string) => {
      const isHarvest = stage.toLowerCase().includes("harvest") || stage.includes("কাটা");
      if (isHarvest) {
        return "উপরে উল্লেখিত ফসল কাটা ও শুকানোর নিয়ম মেনে চলুন এবং মান্ডি সহায়তার জন্য বিনামূল্যে কিষান কল সেন্টারে (1800-180-1551) যোগাযোগ করুন।";
      }
      if (concern) {
        return `উপরে উল্লেখিত ধাপগুলো অনুসরণ করুন: যেখানে "${concern}" দেখা গেছে সেখানে আগে পরীক্ষা করুন এবং বিনামূল্যে কিষান কল সেন্টারে (1800-180-1551) কৃষি বিজ্ঞানীদের পরামর্শ নিন।`;
      }
      return "উপরে উল্লেখিত মাঠ পরিচর্যার নিয়ম মেনে চলুন: জমিতে পরিমিত রস রাখুন এবং প্রয়োজনে বিনামূল্যে কিষান কল সেন্টারে (1800-180-1551) যোগাযোগ করুন।";
    },
    nextWatch: "আজই জমি পরীক্ষা করুন; আবহাওয়া খারাপ হলে নিকটস্থ কৃষি বিজ্ঞান কেন্দ্রের সাহায্য নিন।",
    nextUnavailable: "অনুসন্ধান পাওয়া না গেলে কিষান কল সেন্টার 1800-180-1551 নম্বরে যোগাযোগ করুন।",
    partial: " কিছু অনুসন্ধান ধীরগতির ছিল, তবে আপনার জন্য প্রধান কৃষি করণীয় নিচে তালিকাভুক্ত করা হয়েছে।"
  }
} as const;

function clean(value: string, max = 120): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function displayCrop(input: CropRequest): string {
  return DISPLAY_NAMES[input.locale].crops[input.crop] || clean(input.crop);
}

function displayStage(input: CropRequest): string {
  return DISPLAY_NAMES[input.locale].stages[input.stage] || clean(input.stage);
}

function isTreatment(text: string): boolean {
  return /\b(?:pesticide|insecticide|fungicide|herbicide|spray|dose|dosage|apply|use|mix|treat|control|chemical|EC|SC|WP|WG|SL|SP|GR)\b|कीटनाशक|फफूंदनाशक|छिड़काव|मात्रा|কীটনাশক|ছত্রাকনাশক|স্প্রে|ডোজ/iu.test(text);
}

function stepFromClaim(input: CropRequest, claim: Claim): CropDecisionStep {
  return {
    text: COPY[input.locale].sourceAction(displayCrop(input), clean(input.district), displayStage(input), claim.text),
    kind: isTreatment(claim.text) ? "treatment" : "source_action",
    evidenceIds: claim.evidenceIds,
    quote: claim.quote,
    sourceBacked: true
  };
}

function getAgronomyGuidance(input: CropRequest): AgronomyStepTemplate[] {
  const langTable = AGRONOMY_STEPS[input.locale] || AGRONOMY_STEPS.en;
  const cropTable = langTable[input.crop] || AGRONOMY_STEPS.en[input.crop];
  if (cropTable) {
    const stageSteps = cropTable[input.stage];
    if (stageSteps && stageSteps.length) return stageSteps;
  }

  if (input.locale === "hi") {
    if (input.stage === "Harvesting" || input.stage === "कटाई" || input.stage === "Harvest") {
      return [
        { text: "फसल के 80 से 85 प्रतिशत पकने पर सूखे मौसम में कटाई करें ताकि दाना झड़ने और भीगने से बचे।", kind: "source_action" },
        { text: "कटी फसल को साफ तिरपाल पर धूप में 2 से 3 दिन सुखाकर नमी सुरक्षित स्तर (12 प्रतिशत से कम) पर लाएं।", kind: "source_action" },
        { text: "साफ बोरियों में भरकर चूहे और सीलन से सुरक्षित कमरे में जमीन से 1 फुट ऊपर रखें।", kind: "source_action" },
        { text: "परिवहन से पहले स्थानीय मंडी या सरकारी खरीद केंद्र में न्यूनतम समर्थन मूल्य (MSP) और पर्ची जांचें।", kind: "source_action" }
      ];
    }
    return [
      { text: `खेत में नियमित निरीक्षण करें और ${displayCrop(input)} के लिए नमी और जल निकासी का सही ध्यान रखें।`, kind: "source_action" },
      { text: "खरपतवार समय पर निकालें ताकि फसल की पैदावार अच्छी हो।", kind: "source_action" },
      { text: "रोग या कीड़े के लक्षण दिखने पर तुरंत स्थानीय कृषि विज्ञान केंद्र (KVK) से संपर्क करें।", kind: "watch" }
    ];
  }

  if (input.locale === "bn") {
    if (input.stage === "Harvesting" || input.stage === "ফসল কাটা" || input.stage === "Harvest") {
      return [
        { text: "ফসল ৮০ থেকে ৮৫ শতাংশ পাকলে শুকনো আবহাওয়ায় কাটুন যাতে দানা ঝরে না যায় বা ভিজে নষ্ট না হয়।", kind: "source_action" },
        { text: "পরিষ্কার ত্রিপলে রোদে ২ থেকে ৩ দিন শুকিয়ে আর্দ্রতা নিরাপদ মাত্রায় (১২ শতাংশের নিচে) নামিয়ে আনুন।", kind: "source_action" },
        { text: "পরিষ্কার বস্তায় ভরে মাটির স্পর্শ বাঁচিয়ে কাঠের পাটাতনের উপর সংরক্ষণ করুন।", kind: "source_action" },
        { text: "বিক্রির আগে নিকটস্থ মান্ডি বা সরকারি ক্রয় কেন্দ্রে ন্যূনতম সহায়ক মূল্য (MSP) ও টোকেন যাচাই করুন।", kind: "source_action" }
      ];
    }
    return [
      { text: `নিয়মিত জমি পর্যবেক্ষণ করুন এবং ${displayCrop(input)}-এর জন্য আর্দ্রতা ও জল নিষ্কাশন বজায় রাখুন।`, kind: "source_action" },
      { text: "আগাছা পরিষ্কার রাখুন যাতে ফসলের বৃদ্ধি ভালো হয়।", kind: "source_action" },
      { text: "রোগ বা পোকার আক্রমণ দেখলে নিকটস্থ কৃষি বিজ্ঞান কেন্দ্র (KVK)-এর সাথে কথা বলুন।", kind: "watch" }
    ];
  }

  if (input.stage === "Harvesting" || input.stage === "Harvest") {
    return [
      { text: "Harvest during dry sunny weather when 80 to 85 percent of the crop reaches maturity to prevent grain loss and moisture damage.", kind: "source_action" },
      { text: "Sun-dry harvested produce on clean tarpaulins for 2 to 3 days until moisture drops to safe storage levels (below 12 percent).", kind: "source_action" },
      { text: "Store in clean, moisture-proof bags elevated off the floor on wooden pallets away from damp walls.", kind: "source_action" },
      { text: "Verify current APMC mandi or mill procurement prices before arranging transport to avoid roadside queues.", kind: "source_action" }
    ];
  }

  return [
    { text: `Check your field regularly and keep soil moisture and drainage balanced for your ${displayCrop(input)}.`, kind: "source_action" },
    { text: "Remove weeds on schedule so crops get sunlight and nutrients without competition.", kind: "source_action" },
    { text: "Inspect field corners for pest or disease signs and call your local extension office early.", kind: "watch" }
  ];
}

/** Matches evidence snippets to the crop context to provide evidence-backed steps */
function findEvidenceDerivedStep(sources: Evidence[], input: CropRequest): CropDecisionStep | null {
  const cropLower = input.crop.toLowerCase();
  const districtLower = input.district.toLowerCase();

  for (const item of sources) {
    const textLower = item.snippet.toLowerCase();
    const hasCrop = textLower.includes(cropLower);
    const hasDistrict = textLower.includes(districtLower);

    if ((hasCrop || hasDistrict) && /\b(?:harvest|cutting|yield|moisture|dry|drying|mandi|market|price|rain|water|advisory|cultivation|ratoon|storage)\b/i.test(item.snippet)) {
      const trimmed = item.snippet.replace(/\s+/g, " ").trim();
      if (trimmed.length > 25) {
        return {
          text: `${item.title}: ${trimmed}`,
          kind: "source_action",
          evidenceIds: [item.id],
          quote: trimmed,
          sourceBacked: true
        };
      }
    }
  }
  return null;
}

export function buildCropDecision(
  input: CropRequest,
  brief: CropBrief,
  metrics: EvidenceMetrics,
  warnings: readonly string[]
): CropDecision {
  const copy = COPY[input.locale];
  const crop = displayCrop(input);
  const district = clean(input.district);
  const stage = displayStage(input);
  const concern = clean(input.concern || "", 160);
  const state = clean(input.state);

  const unavailable = metrics.queriesRun === 0 && warnings.length > 0;
  const status: CropDecision["status"] = unavailable
    ? "unavailable"
    : brief.alerts.length > 0
      ? "watch"
      : "guidance";

  const reasons = [...brief.actions, ...brief.alerts.map((alert) => alert.claim)].slice(0, 5);
  const steps: CropDecisionStep[] = [];

  if (status === "unavailable") {
    const localSupport = brief.support[0];
    steps.push(localSupport
      ? { text: copy.contact(localSupport.name), kind: "contact", evidenceIds: [localSupport.evidenceId], sourceBacked: true }
      : { text: copy.kcc, kind: "contact", evidenceIds: [], sourceBacked: false });
  } else {
    for (const claim of brief.actions.slice(0, 2)) {
      steps.push(stepFromClaim(input, claim));
    }

    if (concern && concern.length > 2) {
      const concernStepText = input.locale === "hi"
        ? `आपकी दर्ज समस्या (“${concern}”) के लिए: सुबह के समय प्रभावित पौधों और पत्तियों की निचली सतह की जांच करें। लक्षण वाले 2-3 पत्तों को साफ पॉलीथिन में रखकर नजदीकी कृषि विज्ञान केंद्र (KVK) ले जाएं और वैज्ञानिक सलाह के बाद ही कोई उपाय करें।`
        : input.locale === "bn"
        ? `আপনার উদ্বেগের বিষয়ে (“${concern}”): সকালের দিকে আক্রান্ত পাতা ও গোড়া ভালো করে পরীক্ষা করুন। ২-৩টি আক্রান্ত পাতার নমুনা পরিষ্কার পলিথিনে ভরে নিকটস্থ কেকেভি (KVK)-তে দেখান এবং বিশেষজ্ঞের পরামর্শ নিয়ে ব্যবস্থা নিন।`
        : `For your reported concern (“${concern}”): Inspect the affected leaves and root zone early in the morning. Seal 2 to 3 symptomatic leaf samples in a clean plastic bag and carry them to your nearest Krishi Vigyan Kendra (KVK) for an official diagnosis before buying any commercial chemical.`;

      steps.push({
        text: concernStepText,
        kind: "watch",
        evidenceIds: [],
        sourceBacked: false
      });
    }

    if (steps.length < 3) {
      const derivedStep = findEvidenceDerivedStep(brief.sources, input);
      if (derivedStep && !steps.some(s => s.evidenceIds.includes(derivedStep.evidenceIds[0]))) {
        steps.push(derivedStep);
      }
    }

    const agronomyList = getAgronomyGuidance(input);
    for (const item of agronomyList) {
      if (steps.length >= 4) break;
      steps.push({
        text: item.text,
        kind: item.kind,
        evidenceIds: [],
        sourceBacked: false
      });
    }

    const localSupport = brief.support[0];
    if (localSupport) {
      steps.push({
        text: copy.contact(localSupport.name),
        kind: "contact",
        evidenceIds: [localSupport.evidenceId],
        sourceBacked: true
      });
    } else {
      steps.push({
        text: copy.kcc,
        kind: "contact",
        evidenceIds: [],
        sourceBacked: false
      });
    }
  }

  const finalSteps = steps.slice(0, 5);

  const headline = status === "guidance"
    ? copy.guidanceHeadline(crop, district, stage)
    : status === "watch"
      ? copy.watchHeadline(crop, district, stage)
      : copy.unavailableHeadline(crop, district);

  const summary = status === "guidance"
    ? copy.guidanceSummary(crop, district, stage, state, metrics.sourcesKept, concern)
    : status === "watch"
      ? copy.watchSummary(crop, district, state, metrics.sourcesKept, concern)
      : copy.unavailableSummary;

  const nextStep = status === "guidance"
    ? copy.nextGuidance(input.stage, concern)
    : status === "watch"
      ? copy.nextWatch
      : copy.nextUnavailable;

  return CropDecisionSchema.parse({
    status,
    headline,
    summary: `${summary}${warnings.length ? copy.partial : ""}`,
    labels: {
      ...copy.labels,
      coverage: copy.labels.coverage(
        metrics.queriesRun,
        metrics.queriesPlanned,
        metrics.sourcesKept,
        Math.max(0, metrics.queriesPlanned - metrics.queriesRun)
      )
    },
    steps: finalSteps,
    reasons,
    nextStep,
    coverage: {
      planned: metrics.queriesPlanned,
      completed: metrics.queriesRun,
      failed: Math.max(0, metrics.queriesPlanned - metrics.queriesRun),
      sourcesReviewed: metrics.sourcesKept,
      sourcesDropped: metrics.sourcesDropped,
      warnings: warnings.length
    }
  });
}
