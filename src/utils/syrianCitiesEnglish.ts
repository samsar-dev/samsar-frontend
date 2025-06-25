export interface CityInfo {
    name: string;
    latitude: number;
    longitude: number;
    neighbors: {
      name: string;
      latitude: number;
      longitude: number;
    }[];
  }
  
  export const syrianCities: CityInfo[] = [
    {
      name: "Damascus",
      latitude: 33.5131,
      longitude: 36.2913,
      neighbors: [
        {
          name: "Al-Midan",
          latitude: 33.5111,
          longitude: 36.2994
        },
        {
          name: "Al-Mazzeh",
          latitude: 33.5231,
          longitude: 36.2731
        },
        {
          name: "Al-Qadam",
          latitude: 33.5078,
          longitude: 36.2711
        },
        {
          name: "Barzeh",
          latitude: 33.5400,
          longitude: 36.3100
        },
        {
          name: "Jaramana",
          latitude: 33.5000,
          longitude: 36.3300
        },
        {
          name: "Douma",
          latitude: 33.5833,
          longitude: 36.4167
        },
        {
          name: "Darayya",
          latitude: 33.4833,
          longitude: 36.2833
        },
        {
          name: "Moadamiyah",
          latitude: 33.5000,
          longitude: 36.2500
        },
        {
          name: "Al-Hajar al-Aswad",
          latitude: 33.5000,
          longitude: 36.3000
        },
        {
          name: "Al-Tal",
          latitude: 33.6000,
          longitude: 36.3000
        },
        {
          name: "Al-Hameh",
          latitude: 33.5500,
          longitude: 36.3500
        },
        {
          name: "Al-Saboura",
          latitude: 33.5200,
          longitude: 36.3200
        },
        {
          name: "Al-Muhajireen",
          latitude: 33.5300,
          longitude: 36.3100
        },
        {
          name: "Al-Kiswah",
          latitude: 33.4833,
          longitude: 36.3333
        },
        {
          name: "Al-Tadamon",
          latitude: 33.5000,
          longitude: 36.3100
        },
        {
          name: "Al-Yarmouk",
          latitude: 33.5000,
          longitude: 36.3200
        },
        {
          name: "Al-Harasta",
          latitude: 33.5833,
          longitude: 36.4000
        },
        {
          name: "Al-Qaboun",
          latitude: 33.5500,
          longitude: 36.3500
        },
        {
          name: "Al-Shaafiyeh",
          latitude: 33.5000,
          longitude: 36.2800
        },
        {
          name: "Al-Jisreen",
          latitude: 33.5000,
          longitude: 36.4000
        },
        {
          name: "Al-Nabek",
          latitude: 33.7500,
          longitude: 36.5000
        },
        {
          name: "Al-Safira",
          latitude: 33.6000,
          longitude: 36.4000
        }
      ]
    },
    {
      name: "Aleppo",
      latitude: 36.2018,
      longitude: 37.1556,
      neighbors: [
        {
          name: "Sheikh Najjar",
          latitude: 36.2567,
          longitude: 37.1833
        },
        {
          name: "Sheikh Maqsud",
          latitude: 36.2389,
          longitude: 37.1467
        },
        {
          name: "Jandoul",
          latitude: 36.2189,
          longitude: 37.1717
        },
        {
          name: "Afrin",
          latitude: 36.5333,
          longitude: 36.9167
        },
        {
          name: "Azaz",
          latitude: 36.4833,
          longitude: 37.2167
        },
        {
          name: "Jarabulus",
          latitude: 36.5833,
          longitude: 37.3667
        },
        {
          name: "Manbij",
          latitude: 36.4000,
          longitude: 37.5000
        },
        {
          name: "Al-Bab",
          latitude: 36.3000,
          longitude: 37.3000
        },
        {
          name: "Ayn al-Arab (Kobane)",
          latitude: 36.6000,
          longitude: 37.8000
        },
        {
          name: "Tall Rifat",
          latitude: 36.3333,
          longitude: 37.0667
        },
        {
          name: "Nubl",
          latitude: 36.2400,
          longitude: 37.1200
        },
        {
          name: "Zahraa",
          latitude: 36.2400,
          longitude: 37.1300
        },
        {
          name: "Anadan",
          latitude: 36.2400,
          longitude: 37.1600
        },
        {
          name: "Atarib",
          latitude: 36.2800,
          longitude: 37.1800
        },
        {
          name: "Khan al-Assal",
          latitude: 36.2500,
          longitude: 37.1300
        },
        {
          name: "Darat Izza",
          latitude: 36.2800,
          longitude: 37.1500
        },
        {
          name: "Kafr Hamra",
          latitude: 36.3000,
          longitude: 37.1100
        },
        {
          name: "Tel Rifaat",
          latitude: 36.3333,
          longitude: 37.0667
        },
        {
          name: "Bab al-Hawa",
          latitude: 36.3500,
          longitude: 36.9500
        },
        {
          name: "A'zaz",
          latitude: 36.4833,
          longitude: 37.2167
        },
        {
          name: "Mare'",
          latitude: 36.4500,
          longitude: 37.2500
        },
        {
          name: "Bab al-Salameh",
          latitude: 36.4333,
          longitude: 37.2333
        },
        {
          name: "Khan Touman",
          latitude: 36.2833,
          longitude: 37.1333
        },
        {
          name: "Daret Azza",
          latitude: 36.2833,
          longitude: 37.1500
        },
        {
          name: "Kafar Naya",
          latitude: 36.2333,
          longitude: 37.1333
        },
        {
          name: "Al-Maghara",
          latitude: 36.2200,
          longitude: 37.1500
        },
        {
          name: "Al-Ma'ara",
          latitude: 36.2500,
          longitude: 37.0833
        },
        {
          name: "Al-Bab",
          latitude: 36.3000,
          longitude: 37.3000
        },
        {
          name: "Al-Rai",
          latitude: 36.4833,
          longitude: 37.2667
        },
        {
          name: "Al-Bab al-Gharbi",
          latitude: 36.2833,
          longitude: 37.1333
        },
        {
          name: "Al-Bab al-Sharqi",
          latitude: 36.2833,
          longitude: 37.1500
        },
        {
          name: "Al-Bab al-Jadid",
          latitude: 36.2833,
          longitude: 37.1500
        },
        {
          name: "Al-Bab al-Qadim",
          latitude: 36.2833,
          longitude: 37.1500
        },
        {
          name: "Al-Bab al-Arabi",
          latitude: 36.2833,
          longitude: 37.1500
        },
        {
          name: "Al-Bab al-Turki",
          latitude: 36.2833,
          longitude: 37.1500
        },
        {
          name: "Al-Bab al-Rum",
          latitude: 36.2833,
          longitude: 37.1500
        }
      ]
    },
    {
      name: "Homs",
      latitude: 34.7333,
      longitude: 36.7067,
      neighbors: [
        {
          name: "Khalidiya",
      latitude: 34.7289,
      longitude: 36.7189
    },
    {
      name: "Al-Waar",
      latitude: 34.7417,
      longitude: 36.7217
    },
    {
      name: "Al-Hamidiya",
      latitude: 34.7389,
      longitude: 36.7089
    },
    {
      name: "Baba Amr",
      latitude: 34.7150,
      longitude: 36.6847
    },
    {
      name: "Inshaat",
      latitude: 34.7433,
      longitude: 36.6978
    },
    {
      name: "Al-Bayada",
      latitude: 34.7569,
      longitude: 36.7381
    },
    {
      name: "Karm al-Zeitoun",
      latitude: 34.7283,
      longitude: 36.7269
    },
    {
      name: "Al-Rastan",
      latitude: 34.9231,
      longitude: 36.7327
    },
    {
      name: "Talbiseh",
      latitude: 34.8403,
      longitude: 36.7306
    },
    {
      name: "Al-Qusayr",
      latitude: 34.5094,
      longitude: 36.5797
    },
    {
      name: "Fairouzeh",
      latitude: 34.6667,
      longitude: 36.7833
    },
    {
      name: "Shin",
      latitude: 34.8333,
      longitude: 36.4833
        }
      ]
    },
    {
      name: "Hama",
      latitude: 35.1333,
      longitude: 36.7333,
      neighbors: [
        {
          name: "Mhardeh",
      latitude: 35.1000,
      longitude: 36.8000
    },
    {
      name: "Kafr Zita",
      latitude: 35.1667,
      longitude: 36.8333
    },
    {
      name: "Al-Salamiyah",
      latitude: 35.2500,
      longitude: 37.3333
    },
    {
      name: "Al-Lataminah",
      latitude: 35.2686,
      longitude: 36.6103
    },
    {
      name: "Suran",
      latitude: 35.2872,
      longitude: 36.7486
    },
    {
      name: "Tayyibat al-Imam",
      latitude: 35.2731,
      longitude: 36.7303
    },
    {
      name: "Karnaz",
      latitude: 35.2611,
      longitude: 36.5231
    },
    {
      name: "Qalaat al-Madiq",
      latitude: 35.4075,
      longitude: 36.3883
    },
    {
      name: "As-Suqaylabiyah",
      latitude: 35.3689,
      longitude: 36.3911
    },
    {
      name: "Al-Hamraa",
      latitude: 35.3333,
      longitude: 37.0167
        }
      ]
    },
    {
      name: "Latakia",
      latitude: 35.5167,
      longitude: 35.7867,
      neighbors: [
        {
          name: "Sabe Bahrat",
          latitude: 35.5289,
          longitude: 35.7989
        },
        {
          name: "Al-Noor",
          latitude: 35.5189,
          longitude: 35.7789
        },
        {
          name: "Al-Jabal",
          latitude: 35.5389,
          longitude: 35.7889
        },
        {
          name: "Al-Ziraa",
          latitude: 35.5215,
          longitude: 35.8003
        },
        {
          name: "Al-Qanun",
          latitude: 35.5119,
          longitude: 35.7796
        },
        {
          name: "Tishreen University Area",
          latitude: 35.5091,
          longitude: 35.7935
        },
        {
          name: "Al-Ramel Al-Janoubi",
          latitude: 35.4921,
          longitude: 35.7924
        },
        {
          name: "Al-Ramel Al-Shamali",
          latitude: 35.5352,
          longitude: 35.7911
        },
        {
          name: "Ain Al-Bayda",
          latitude: 35.6270,
          longitude: 35.8350
        },
        {
          name: "Qardaha",
          latitude: 35.5881,
          longitude: 36.0400
        },
        {
          name: "Jableh",
          latitude: 35.3625,
          longitude: 35.9275
        }
      ]
    },
    {
      name: "Idlib",
  latitude: 35.9306,
  longitude: 36.6339,
  neighbors: [
    {
      name: "Maarat al-Numan",
      latitude: 35.6422,
      longitude: 36.6713
    },
    {
      name: "Saraqib",
      latitude: 35.8641,
      longitude: 36.8056
    },
    {
      name: "Ariha",
      latitude: 35.8131,
      longitude: 36.6072
    },
    {
      name: "Binnish",
      latitude: 35.9581,
      longitude: 36.7133
    },
    {
      name: "Sarmin",
      latitude: 35.9022,
      longitude: 36.8222
    },
    {
      name: "Taftanaz",
      latitude: 36.1000,
      longitude: 36.7856
    },
    {
      name: "Kafr Nabl",
      latitude: 35.6122,
      longitude: 36.5675
    },
    {
      name: "Harem",
      latitude: 36.2111,
      longitude: 36.5189
    },
    {
      name: "Jisr al-Shughur",
      latitude: 35.8147,
      longitude: 36.3208
    },
    {
      name: "Kafr Takharim",
      latitude: 36.1203,
      longitude: 36.5133
        }
      ]
    },
    {
      name: "Deir ez-Zor",
  latitude: 35.3667,
  longitude: 40.1833,
  neighbors: [
    {
      name: "Al-Jafra",
      latitude: 35.3833,
      longitude: 40.2000
    },
   
    {
      name: "Al-Mayadin",
      latitude: 35.2000,
      longitude: 40.7500
    },
    {
      name: "Hatla",
      latitude: 35.3586,
      longitude: 40.2411
    },
    {
      name: "Al-Husayniyah",
      latitude: 35.4000,
      longitude: 40.2167
    },
    {
      name: "Al-Muray'iyah",
      latitude: 35.3194,
      longitude: 40.2333
    },
    {
      name: "Al-Shuhayl",
      latitude: 35.2500,
      longitude: 40.4500
    },
    {
      name: "Tabiya",
      latitude: 35.3089,
      longitude: 40.3328
    },
    {
      name: "Diban",
      latitude: 35.2333,
      longitude: 40.5333
    },
    {
      name: "Tayyana",
      latitude: 35.2850,
      longitude: 40.4500
        }
      ]
    },
    {
      name: "Daraa",
      latitude: 32.6231,
      longitude: 36.0528,
      neighbors: [
        {
          name: "Al-Mansoura",
      latitude: 32.6500,
      longitude: 36.0833
    },
    {
      name: "Al-Sanamayn",
      latitude: 32.7500,
      longitude: 36.1500
    },
    {
      name: "Al-Naima",
      latitude: 32.5833,
      longitude: 36.0833
    },
    {
      name: "Tafas",
      latitude: 32.7372,
      longitude: 36.0669
    },
    {
      name: "Busra al-Sham",
      latitude: 32.5167,
      longitude: 36.4833
    },
    {
      name: "Jasim",
      latitude: 32.9900,
      longitude: 36.0500
    },
    {
      name: "Inkhil",
      latitude: 33.0186,
      longitude: 36.1289
    },
    {
      name: "Dael",
      latitude: 32.8519,
      longitude: 36.0342
    },
    {
      name: "Nawa",
      latitude: 32.8911,
      longitude: 36.0408
    },
    {
      name: "Al-Hirak",
      latitude: 32.6933,
      longitude: 36.2578
        }
      ]
    },
    {
      name: "Quneitra",
      latitude: 32.9667,
      longitude: 35.8667,
      neighbors: [
        {
          name: "Al-Quneitra",
          latitude: 32.9667,
          longitude: 35.8667
        },
        {
          name: "Al-Hamra",
          latitude: 32.9833,
          longitude: 35.8500
        },
        {
          name: "Al-Mansoura",
          latitude: 32.9500,
          longitude: 35.8833
        },
        {
          name: "Al-Ghajar",
          latitude: 32.9333,
          longitude: 35.8333
        },
        {
          name: "Al-Buqata",
          latitude: 32.9000,
          longitude: 35.8500
        },
        {
          name: "Al-Haditha",
          latitude: 32.9500,
          longitude: 35.8000
        },
        {
          name: "Al-Masada",
          latitude: 32.9833,
          longitude: 35.9000
        },
        {
          name: "Al-Mudayrij",
          latitude: 33.0000,
          longitude: 35.8500
        },
        {
          name: "Al-Majdal",
          latitude: 32.9333,
          longitude: 35.9000
        },
        {
          name: "Al-Tal",
          latitude: 32.9667,
          longitude: 35.8333
        },
        {
          name: "Al-Masnaa",
          latitude: 32.9500,
          longitude: 35.9333
        },
        {
          name: "Al-Ashrafiyah",
          latitude: 32.9167,
          longitude: 35.8667
        },
        {
          name: "Al-Masnaa al-Gharbiyah",
          latitude: 32.9500,
          longitude: 35.8500
        },
        {
          name: "Al-Masnaa al-Sharqiyah",
          latitude: 32.9500,
          longitude: 35.9000
        },
        {
          name: "Al-Masnaa al-Janoubiyah",
          latitude: 32.9333,
          longitude: 35.8667
        },
        {
          name: "Al-Masnaa al-Shamaliyah",
          latitude: 32.9833,
          longitude: 35.8667
        }
      ]
    },
    {
      name: "As-Suwayda",
      latitude: 32.5167,
      longitude: 36.5833,
      neighbors: [
        {
          name: "Al-Shaykh Saad",
          latitude: 32.5333,
          longitude: 36.6167
        },
        {
          name: "Al-Mazraa",
          latitude: 32.5000,
          longitude: 36.6000
        },
        {
          name: "Al-Taybeh",
          latitude: 32.5500,
          longitude: 36.5500
        },
        {
          name: "Shahba",
          latitude: 32.8531,
          longitude: 36.6286
        },
        {
          name: "Salkhad",
          latitude: 32.4811,
          longitude: 36.7114
        },
        {
          name: "Qanawat",
          latitude: 32.6253,
          longitude: 36.6375
        },
        {
          name: "Al-Qurayya",
          latitude: 32.4264,
          longitude: 36.6025
        },
        {
          name: "Ariqah",
          latitude: 32.7058,
          longitude: 36.8408
        },
        {
          name: "Dhibin",
          latitude: 32.3772,
          longitude: 36.7194
        },
        {
          name: "Al-Ghariyah",
          latitude: 32.6042,
          longitude: 36.4942
        }
      ]
    },
    {
      name: "Rif Dimashq",
      latitude: 33.5000,
      longitude: 36.3000,
      neighbors: [
        {
          name: "Douma",
      latitude: 33.5667,
      longitude: 36.3667
    },
    {
      name: "Daraya",
      latitude: 33.4667,
      longitude: 36.2333
    },
    {
      name: "Zabadani",
      latitude: 33.7667,
      longitude: 36.1500
    },
    {
      name: "Jaramana",
      latitude: 33.4833,
      longitude: 36.3667
    },
    {
      name: "Sa’sa’",
      latitude: 33.2833,
      longitude: 36.0833
    },
    {
      name: "Al-Tall",
      latitude: 33.6108,
      longitude: 36.3186
    },
    {
      name: "Qatana",
      latitude: 33.4556,
      longitude: 36.0922
    },
    {
      name: "Harasta",
      latitude: 33.5550,
      longitude: 36.3661
    },
    {
      name: "Rankous",
      latitude: 33.7167,
      longitude: 36.3667
    },
    {
      name: "Babbila",
      latitude: 33.4606,
      longitude: 36.3167
        }
      ]
    },
    {
      name: "Al-Hasakah",
      latitude: 36.5000,
      longitude: 40.7333,
      neighbors: [
        {
          name: "Al-Raqqa",
          latitude: 35.9667,
          longitude: 39.0333
        },
        {
          name: "Al-Malikiyah",
          latitude: 37.0333,
          longitude: 40.9333
        },
        {
          name: "Al-Shaddadiyah",
          latitude: 36.1667,
          longitude: 40.8333
        },
        {
          name: "Al-Sour",
          latitude: 36.2500,
          longitude: 40.7500
        },
        {
          name: "Al-Tal",
          latitude: 36.5000,
          longitude: 40.8000
        },
        {
          name: "Al-Basira",
          latitude: 36.3000,
          longitude: 40.6000
        },
        {
          name: "Al-Sina",
          latitude: 36.4000,
          longitude: 40.7000
        },
        {
          name: "Al-Busayrah",
          latitude: 36.3500,
          longitude: 40.8500
        },
        
        
        
        
        {
          name: "Al-Darbasiyah",
          latitude: 36.9000,
          longitude: 40.8500
        },
        {
          name: "Amuda",
          latitude: 36.8333,
          longitude: 40.9833
        },
        {
          name: "Ain al-Arab (Kobane)",
          latitude: 36.6000,
          longitude: 37.8000
        },
        {
          name: "Al-Qamishli",
          latitude: 36.8667,
          longitude: 40.9167
        },
        {
          name: "Al-Tel",
          latitude: 36.5500,
          longitude: 40.7500
        },
        {
          name: "Al-Hassakah",
          latitude: 36.5000,
          longitude: 40.7333
        },
        {
          name: "Al-Hassakah",
          latitude: 36.5000,
          longitude: 40.7333
        }
      ]
    },
    {
      name: "Al-Raqqa",
      latitude: 35.9667,
      longitude: 39.0333,
      neighbors: [
        {
          name: "Tabqa",
          latitude: 35.9000,
          longitude: 38.7500
        },
        {
          name: "Ain Issa",
          latitude: 36.2000,
          longitude: 39.3000
        },
        {
          name: "Al-Thawrah",
          latitude: 36.0000,
          longitude: 39.1000
        },
        {
          name: "Karama",
          latitude: 35.9497,
          longitude: 39.2873
        },
        {
          name: "Al-Mansurah",
          latitude: 35.8670,
          longitude: 38.6350
        },
        {
          name: "Maadan",
          latitude: 35.7333,
          longitude: 39.7333
        },
        {
          name: "Al-Khatuniyah",
          latitude: 35.7333,
          longitude: 38.8500
        },
        {
          name: "Hazimah",
          latitude: 36.1000,
          longitude: 38.9667
        },
        {
          name: "Al-Sabkhah",
          latitude: 35.7500,
          longitude: 39.5000
        },
        {
          name: "Sharakrak",
          latitude: 36.1000,
          longitude: 39.4000
        },
        {
          name: "Tal Abyad (Tell Abiad)",
          latitude: 36.6856,
          longitude: 38.9506
        },
        {
          name: "Hamrat Ghanam",
          latitude: 35.8911,
          longitude: 39.3139
        },
        {
          name: "Al-Rashid",
          latitude: 35.9200,
          longitude: 38.8700
        }
      ]
    },
    
       
      
    {
      name: "Al-Qamishli",
      latitude: 36.8667,
      longitude: 40.9167,
      neighbors: [
        {
          name: "Amuda",
      latitude: 36.8333,
      longitude: 40.9833
    },
    {
      name: "Al-Darbasiyah",
      latitude: 36.9000,
      longitude: 40.8500
    },
    {
      name: "Al-Malikiyah",
      latitude: 37.0333,
      longitude: 40.9333
    },
    {
      name: "Qahtaniyah",
      latitude: 37.0167,
      longitude: 41.2167
    },
    {
      name: "Tell Hamis",
      latitude: 36.7333,
      longitude: 41.0167
    },
    {
      name: "Tell Brak",
      latitude: 36.7833,
      longitude: 41.0667
    },
    {
      name: "Rmelan",
      latitude: 37.0000,
      longitude: 41.9333
    },
    {
      name: "Jawadiyah",
      latitude: 37.0167,
      longitude: 41.2000
    },
    {
      name: "Tirbespi",
      latitude: 37.0000,
      longitude: 41.0167
    },
    {
      name: "Girke Lege",
      latitude: 37.0667,
      longitude: 41.2000
        }
      ]
    },
    {
      name: "Al-Hasakah",
      latitude: 36.5000,
      longitude: 40.7333,
      neighbors: [
        {
          name: "Al-Shadadiyah",
          latitude: 36.1667,
          longitude: 40.8333
        },
        {
          name: "Al-Malikiyah",
          latitude: 37.0333,
          longitude: 40.9333
        },
        {
          name: "Al-Sour",
          latitude: 36.2500,
          longitude: 40.7500
        },
        {
          name: "Tell Brak",
          latitude: 36.7833,
          longitude: 41.0667
        },
        {
          name: "Tell Hamis",
          latitude: 36.7333,
          longitude: 41.0167
        },
        {
          name: "Markadah",
          latitude: 35.9761,
          longitude: 40.8447
        },
        {
          name: "Arisha",
          latitude: 36.0500,
          longitude: 40.6833
        },
        {
          name: "Al-Hol",
          latitude: 36.5667,
          longitude: 41.1000
        },
        {
          name: "Al-Busayrah",
          latitude: 35.8822,
          longitude: 40.5125
        },
        {
          name: "Tell Tamer",
          latitude: 36.6175,
          longitude: 40.4022
        }
      ]
    },
    {
      name: "Al-Raqqa",
      latitude: 35.9667,
      longitude: 39.0333,
      neighbors: [
        {
          name: "Tabqa",
      latitude: 35.9000,
      longitude: 38.7500
    },
    {
      name: "Ain Issa",
      latitude: 36.2000,
      longitude: 39.3000
    },
    {
      name: "Al-Thawrah",
      latitude: 36.0000,
      longitude: 39.1000
    },
    {
      name: "Al-Karamah",
      latitude: 35.9833,
      longitude: 39.3167
    },
    {
      name: "Al-Mansurah",
      latitude: 35.8667,
      longitude: 38.7833
    },
    {
      name: "Maadan",
      latitude: 35.7333,
      longitude: 39.7167
    },
    {
      name: "Tell Abyad",
      latitude: 36.6833,
      longitude: 38.9500
    },
    {
      name: "Suluk",
      latitude: 36.6000,
      longitude: 39.1333
    },
    {
      name: "Sabka",
      latitude: 35.6900,
      longitude: 39.3700
    },
    {
      name: "Hamrat Nasir",
      latitude: 35.9500,
      longitude: 39.2167
        }
      ]
    },
    {
      name: "Tartus",
      latitude: 35.0000,
      longitude: 35.9000,
      neighbors: [
        {
          name: "Baniyas",
          latitude: 35.1667,
          longitude: 36.0000
        },
        {
          name: "Al-Safita",
          latitude: 35.0833,
          longitude: 36.0167
        },
        {
          name: "Al-Haffa",
          latitude: 35.5000,
          longitude: 35.9000
        },
        {
          name: "Duraykish",
          latitude: 35.1333,
          longitude: 36.1333
        },
        {
          name: "Qadmus",
          latitude: 35.1167,
          longitude: 36.1667
        },
        {
          name: "Khirbet al-Maazah",
          latitude: 35.0200,
          longitude: 35.8700
        },
        {
          name: "Al-Shaykh Badr",
          latitude: 35.1833,
          longitude: 36.0833
        },
        {
          name: "Al-Qadmous",
          latitude: 35.1200,
          longitude: 36.1500
        },
        {
          name: "Kafroun",
          latitude: 35.0767,
          longitude: 36.0900
        },
        {
          name: "Ras al-Basit",
          latitude: 35.6670,
          longitude: 35.8830
        },
        {
          name: "Al-Bayda",
          latitude: 35.2000,
          longitude: 36.0667
        }
      ]
    },
    {
      name: "Al-Qamishli",
      latitude: 36.8667,
      longitude: 40.9167,
      neighbors: [
        {
          name: "Amuda",
          latitude: 36.8333,
          longitude: 40.9833
        },
        {
          name: "Al-Darbasiyah",
          latitude: 36.9000,
          longitude: 40.8500
        },
        {
          name: "Al-Malikiyah",
          latitude: 37.0333,
          longitude: 40.9333
        }
      ]
    },
    {
      name: "Al-Bukamal",
      latitude: 34.9500,
      longitude: 40.8500,
      neighbors: [
        {
          name: "Al-Mayadin",
          latitude: 35.2000,
          longitude: 40.7500
        },
        {
          name: "Al-Busayrah",
          latitude: 35.0000,
          longitude: 40.8000
        },
        {
          name: "Al-Sina",
          latitude: 34.9000,
          longitude: 40.9000
        }
      ]
    },
  
        
      
    {
      name: "Al-Sweida",
      latitude: 32.5167,
      longitude: 36.5833,
      neighbors: [
        {
          name: "Al-Shaykh Saad",
          latitude: 32.5333,
          longitude: 36.6167
        },
        {
          name: "Al-Mazraa",
          latitude: 32.5000,
          longitude: 36.6000
        },
        {
          name: "Al-Taybeh",
          latitude: 32.5500,
          longitude: 36.5500
        },
        {
          name: "Al-Shaykh Miskin",
          latitude: 32.5833,
          longitude: 36.6167
        },
        {
          name: "Al-Naama",
          latitude: 32.5333,
          longitude: 36.5333
        },
        {
          name: "Al-Sanamayn",
          latitude: 32.7500,
          longitude: 36.1500
        },
        {
          name: "Al-Masmiya",
          latitude: 32.5167,
          longitude: 36.4833
        }
      ]
    },
    {
      name: "Al-Quneitra",
      latitude: 32.9667,
      longitude: 35.8667,
      neighbors: [
        {
          name: "Al-Hamra",
          latitude: 32.9833,
          longitude: 35.8500
        },
        {
          name: "Al-Mansoura",
          latitude: 32.9500,
          longitude: 35.8833
        },
        {
          name: "Al-Ghajar",
          latitude: 32.9333,
          longitude: 35.8333
        },
        {
          name: "Al-Buqata",
          latitude: 32.9167,
          longitude: 35.8167
        },
        {
          name: "Al-Masada",
          latitude: 32.9500,
          longitude: 35.8333
        },
        {
          name: "Al-Khushniya",
          latitude: 32.9667,
          longitude: 35.8167
        },
        {
          name: "Al-Majdal",
          latitude: 32.9333,
          longitude: 35.8000
        }
      ]
    },
    {
      name: "Al-Daraa",
      latitude: 32.6231,
      longitude: 36.0528,
      neighbors: [
        {
          name: "Al-Mansoura",
          latitude: 32.6500,
          longitude: 36.0833
        },
        {
          name: "Al-Sanamayn",
          latitude: 32.7500,
          longitude: 36.1500
        },
        {
          name: "Al-Naima",
          latitude: 32.5833,
          longitude: 36.0833
        },
        {
          name: "Al-Yadudah",
          latitude: 32.7000,
          longitude: 36.0833
        },
        {
          name: "Al-Quneitra",
          latitude: 32.8333,
          longitude: 35.9167
        },
        {
          name: "Al-Suwayda",
          latitude: 32.5333,
          longitude: 36.5333
        },
        {
          name: "Al-Hirak",
          latitude: 32.7500,
          longitude: 36.0167
        }
      ]
    }
  ] as const;