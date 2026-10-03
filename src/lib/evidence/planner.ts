import {
  PlannedQuerySchema,
  type EvidenceRunRequest,
  type PlannedQuery
} from "@/lib/schemas";
import { isSearchableConcern } from "@/lib/llm/safety";
import { analyzeSuspiciousText } from "@/lib/suraksha/patterns";

const LANGUAGE_BY_LOCALE = {
  en: "en",
  hi: "hi",
  bn: "bn"
} as const;

const STATE_TRENDS_GEO: Record<string, string> = {
  "Andhra Pradesh": "IN-AP", "Arunachal Pradesh": "IN-AR", Assam: "IN-AS", Bihar: "IN-BR",
  "Chandigarh (UT)": "IN-CH", Chhattisgarh: "IN-CT", "Dadra and Nagar Haveli (UT)": "IN-DH",
  "Daman and Diu (UT)": "IN-DD", "Delhi (NCT)": "IN-DL", Goa: "IN-GA", Gujarat: "IN-GJ",
  Haryana: "IN-HR", "Himachal Pradesh": "IN-HP", "Jammu and Kashmir": "IN-JK", Jharkhand: "IN-JH",
  Karnataka: "IN-KA", Kerala: "IN-KL", "Ladakh (UT)": "IN-LA", Lakshadweep: "IN-LD",
  "Madhya Pradesh": "IN-MP", Maharashtra: "IN-MH", Manipur: "IN-MN", Meghalaya: "IN-ML",
  Mizoram: "IN-MZ", Nagaland: "IN-NL", Odisha: "IN-OR", Puducherry: "IN-PY", Punjab: "IN-PB",
  Rajasthan: "IN-RJ", Sikkim: "IN-SK", "Tamil Nadu": "IN-TN", Telangana: "IN-TG", Tripura: "IN-TR",
  "Uttar Pradesh": "IN-UP", Uttarakhand: "IN-UK", "West Bengal": "IN-WB", Andaman: "IN-AN"
};

function cleanQueryPart(value: string, maxLength = 120): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>`{}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function quoted(value: string): string {
  return `"${cleanQueryPart(value).replace(/"/g, "")}"`;
}

function queryId(module: EvidenceRunRequest["module"], index: number): string {
  return `${module}-${index + 1}`;
}

export function planEvidence(input: EvidenceRunRequest, maxQueries: number = 6): PlannedQuery[] {
  const hl = (input.locale && LANGUAGE_BY_LOCALE[input.locale]) || "en";
  const common = { gl: "in", hl };
  const queries: PlannedQuery[] = [];
  const addQuery = (query: Omit<PlannedQuery, "id">) => {
    queries.push(PlannedQuerySchema.parse({ ...query, id: queryId(input.module, queries.length) }));
  };

  if (input.module === "krishi") {
    const crop = cleanQueryPart(input.crop);
    const state = cleanQueryPart(input.state);
    const district = cleanQueryPart(input.district);
    const stage = cleanQueryPart(input.stage);
    // Do not send chemical requests or source-style instructions to the provider.
    const concern = cleanQueryPart(input.concern && isSearchableConcern(input.concern) ? input.concern : "crop pest weather");

    addQuery(
      {
        engine: "google",
        query: `${quoted(crop)} ${quoted(district)} ${quoted(stage)} advisory (site:gov.in OR site:nic.in OR site:icar.gov.in OR site:imd.gov.in)`,
        parameters: common,
        purpose: "Official crop advisory",
        requireOfficial: true
      }
    );
    addQuery(
      {
        engine: "google_news",
        query: `${cleanQueryPart(crop)} ${cleanQueryPart(district)} ${cleanQueryPart(concern)} agriculture when:30d`,
        parameters: common,
        purpose: "Recent district crop and weather news",
        requireOfficial: false
      }
    );
    addQuery(
      {
        engine: "google",
        query: `${quoted(crop)} ${quoted(state)} farmer scheme (site:gov.in OR site:nic.in)`,
        parameters: common,
        purpose: "Official schemes and support information",
        requireOfficial: true
      }
    );
    addQuery(
      {
        engine: "google_maps",
        query: `Krishi Vigyan Kendra agriculture office ${district}`,
        parameters: {
          ...common,
          location: `${state}, India`,
          type: "search",
          z: "10"
        },
        purpose: "Nearby agricultural support locations",
        requireOfficial: false
      }
    );
    addQuery(
      {
        engine: "google",
        query: `${quoted(crop)} ${quoted(district)} ${quoted(state)} mandi market price (site:agmarknet.gov.in OR site:data.gov.in OR site:gov.in)`,
        parameters: common,
        purpose: "Official mandi market prices",
        requireOfficial: true
      }
    );
    addQuery(
      {
        engine: "google_trends",
        query: cleanQueryPart(`${crop} ${concern}`, 100),
        parameters: {
          ...common,
          geo: STATE_TRENDS_GEO[state] || "IN",
          data_type: "TIMESERIES",
          date: "today 1-m",
          tz: "330"
        },
        purpose: "Regional search-interest proxy",
        requireOfficial: false
      }
    );
    addQuery(
      {
        engine: "youtube",
        query: `${cleanQueryPart(crop)} ${cleanQueryPart(district)} official agriculture advisory ${cleanQueryPart(state)}`,
        parameters: common,
        purpose: "Official-channel crop videos",
        requireOfficial: true
      }
    );
  } else if (input.module === "medi") {
    const hospital = cleanQueryPart(input.hospital);
    const city = cleanQueryPart(input.city);
    const procedure = cleanQueryPart(input.procedure);

    if (input.subModule === "cashless_shield") {
      const state = cleanQueryPart(input.state || "");
      addQuery({
        engine: "google",
        query: `${quoted(hospital)} ${quoted(city)} empanelled hospital list PMJAY (site:pmjay.gov.in OR site:gov.in OR site:nic.in)`,
        parameters: common,
        purpose: "Official PM-JAY and State Health Agency empanelment verification",
        requireOfficial: true
      });
      addQuery({
        engine: "google",
        query: `"PM-JAY" "cashless" "advance deposit" guidelines hospital MoU penalty (site:nha.gov.in OR site:pmjay.gov.in OR site:gov.in)`,
        parameters: common,
        purpose: "Statutory cashless guidelines and advance deposit prohibition",
        requireOfficial: true
      });
      addQuery({
        engine: "google",
        query: `${cleanQueryPart(state || city)} State Health Agency PMJAY grievance nodal officer helpline CGRMS (site:gov.in OR site:nic.in)`,
        parameters: common,
        purpose: "Official State Health Agency helpline and grievance escalation channels",
        requireOfficial: true
      });
      addQuery({
        engine: "google_maps",
        query: `hospital ${hospital} ${city}`,
        parameters: {
          ...common,
          location: `${city}, ${state || "India"}`,
          type: "search",
          z: "10"
        },
        purpose: "Hospital administration and PMAM desk location",
        requireOfficial: false
      });
    } else {
      addQuery(
        {
          engine: "google",
          query: `${quoted(hospital)} ${quoted(procedure)} package rate empanelment (site:gov.in OR site:nic.in OR site:nhm.gov.in)`,
          parameters: common,
          purpose: "Officially published public references",
          requireOfficial: true
        }
      );
      addQuery(
        {
          engine: "google",
          query: `${quoted(city)} patient grievance hospital billing (site:gov.in OR site:nic.in)`,
          parameters: common,
          purpose: "Official grievance routes",
          requireOfficial: true
        }
      );
      addQuery(
        {
          engine: "google_news",
          query: `${quoted(hospital)} ${quoted(city)} hospital billing complaint when:30d`,
          parameters: common,
          purpose: "Recent public hospital billing context",
          requireOfficial: false
        }
      );
      addQuery(
        {
          engine: "google_maps",
          query: "consumer commission district legal services authority",
          parameters: {
            ...common,
            location: `${city}, India`,
            type: "search",
            z: "10"
          },
          purpose: "Nearby official support locations",
          requireOfficial: false
        }
      );
    }
  } else if (input.module === "fasal") {
    const state = cleanQueryPart(input.state);
    const district = cleanQueryPart(input.district);
    const calamity = cleanQueryPart(input.calamityType);
    const crop = cleanQueryPart(input.crop || "crop");

    addQuery({
      engine: "google",
      query: `PMFBY empanelled insurance company ${quoted(district)} ${quoted(state)} (site:pmfby.gov.in OR site:gov.in OR site:nic.in)`,
      parameters: common,
      purpose: "Official empanelled PMFBY crop insurer for district",
      requireOfficial: true
    });
    addQuery({
      engine: "google",
      query: `PMFBY 72 hours localized calamity intimation guidelines claim process (site:pmfby.gov.in OR site:agricoop.nic.in OR site:gov.in)`,
      parameters: common,
      purpose: "Statutory 72-hour localized loss reporting guidelines",
      requireOfficial: true
    });
    addQuery({
      engine: "google_maps",
      query: `District Agriculture Officer office Krishi Bhavan ${district}`,
      parameters: {
        ...common,
        location: `${district}, ${state}, India`,
        type: "search",
        z: "10"
      },
      purpose: "District Agriculture Office location and contact",
      requireOfficial: false
    });
    addQuery({
      engine: "google_news",
      query: `${quoted(district)} ${quoted(state)} ${cleanQueryPart(calamity)} ${cleanQueryPart(crop)} damage compensation relief when:30d`,
      parameters: common,
      purpose: "Recent localized calamity reports and compensation announcements",
      requireOfficial: false
    });
  } else if (input.module === "suraksha") {
    const analysis = analyzeSuspiciousText(input.content);
    const scheme = cleanQueryPart(analysis.extractedScheme || input.appName || "PM Kisan");
    const appOrEntity = cleanQueryPart(input.appName || analysis.extractedApk || scheme);

    addQuery({
      engine: "google",
      query: `${quoted(scheme)} official registration charges fee guidelines (site:gov.in OR site:nic.in)`,
      parameters: common,
      purpose: "Official scheme fee and registration rules",
      requireOfficial: true
    });
    addQuery({
      engine: "google_news",
      query: `${cleanQueryPart(scheme)} fake APK scam advisory police warning when:90d`,
      parameters: common,
      purpose: "Recent police and fact-check advisories",
      requireOfficial: false
    });
    addQuery({
      engine: "google_play",
      query: `${cleanQueryPart(appOrEntity)} official app`,
      parameters: common,
      purpose: "Google Play Store developer verification",
      requireOfficial: false
    });
    addQuery({
      engine: "google",
      query: `"Chakshu" "Sanchar Saathi" reporting fraud suspicious SMS WhatsApp (site:sancharsaathi.gov.in OR site:cybercrime.gov.in OR site:gov.in)`,
      parameters: common,
      purpose: "Official cyber fraud redressal channels",
      requireOfficial: true
    });
  } else if (input.module === "pocket_card") {
    const state = cleanQueryPart(input.state);
    const district = cleanQueryPart(input.district);
    const block = cleanQueryPart(input.block);

    // 1. Google Maps: Nearest PHC / CHC / Hospital
    addQuery({
      engine: "google_maps",
      query: `Primary Health Centre PHC Community Health Centre CHC hospital ${block} ${district}`,
      parameters: {
        ...common,
        location: `${district}, ${state}, India`,
        type: "search",
        z: "11"
      },
      purpose: "Nearest Primary Health Centre and emergency care",
      requireOfficial: false
    });

    // 2. Google Maps: Police Station / Thana
    addQuery({
      engine: "google_maps",
      query: `Police Station Thana police post ${block} ${district}`,
      parameters: {
        ...common,
        location: `${district}, ${state}, India`,
        type: "search",
        z: "11"
      },
      purpose: "Local police station and emergency beat number",
      requireOfficial: false
    });

    // 3. Google Search: Krishi Vigyan Kendra (KVK) & DAO
    addQuery({
      engine: "google",
      query: `Krishi Vigyan Kendra KVK ${quoted(district)} contact address phone (site:icar.org.in OR site:gov.in OR site:nic.in)`,
      parameters: common,
      purpose: "District Krishi Vigyan Kendra expert agronomy center",
      requireOfficial: true
    });

    // 4. Google Search: District Legal Services Authority (DLSA)
    addQuery({
      engine: "google",
      query: `District Legal Services Authority DLSA ${quoted(district)} free legal aid contact (site:gov.in OR site:nic.in)`,
      parameters: common,
      purpose: "District Legal Services Authority free legal aid desk",
      requireOfficial: true
    });
  } else if (input.module === "pashu") {
    const animal = cleanQueryPart(input.animal);
    const concern = cleanQueryPart(input.concern);
    const state = cleanQueryPart(input.state);
    const district = cleanQueryPart(input.district);

    // 1. Official IVRI / ICAR / NDDB / DAHD Clinical Advisory
    addQuery({
      engine: "google",
      query: `${quoted(animal)} ${quoted(concern)} treatment advisory first aid (site:ivri.nic.in OR site:nddb.coop OR site:icar.gov.in OR site:dahd.nic.in OR site:gov.in)`,
      parameters: common,
      purpose: "Official ICAR/IVRI veterinary clinical advisory and first-aid",
      requireOfficial: true
    });

    // 2. Animal Husbandry Precautions and Symptoms
    addQuery({
      engine: "google",
      query: `${cleanQueryPart(animal)} ${cleanQueryPart(concern)} animal symptoms precautions remedies care (site:gov.in OR site:nic.in OR site:icar.org.in)`,
      parameters: common,
      purpose: "Veterinary health precautions and husbandry guidelines",
      requireOfficial: true
    });

    // 3. Google Maps: Nearby Government Veterinary Hospital / Dispensary
    addQuery({
      engine: "google_maps",
      query: `Government Veterinary Hospital Pashu Chikitsalaya dispensary ${district}`,
      parameters: {
        ...common,
        location: `${district}, ${state}, India`,
        type: "search",
        z: "11"
      },
      purpose: "Nearby Government Veterinary Hospitals and Dispensaries",
      requireOfficial: false
    });

    // 4. Google Search: 1962 Mobile Veterinary Unit Ambulance
    addQuery({
      engine: "google",
      query: `1962 "Mobile Veterinary Unit" ambulance ${quoted(district)} ${quoted(state)} (site:gov.in OR site:nic.in)`,
      parameters: common,
      purpose: "District Mobile Veterinary Unit (1962) dispatch and animal helpline",
      requireOfficial: true
    });

    // 5. YouTube: Practical audiovisual veterinary demonstration
    addQuery({
      engine: "youtube",
      query: `${cleanQueryPart(animal)} ${cleanQueryPart(concern)} ilaj kisan advisory veterinary ICAR`,
      parameters: common,
      purpose: "Practical audiovisual veterinary demonstration for farmers",
      requireOfficial: false
    });
  }

  return queries.slice(0, Number.isFinite(maxQueries) ? Math.max(0, Math.floor(maxQueries)) : 0);
}

export function normalizeQueryForKey(query: string): string {
  return query.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}
