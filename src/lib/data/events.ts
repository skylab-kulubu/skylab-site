import { Event } from "./types";

export const events: Event[] = [
  {
    id: 'artlab-2025',
    title: 'ARTLAB',
    slug: 'artlab-2025',
    description: 'SKY LAB tarafından bu sene yedincisi düzenlenen yapay zeka zirvesi. Yapay zeka alanındaki öncü isimler ile bir araya gelerek sektör hakkındaki yeni trendlerle ve yeni teknolojilerle tanışın.', 
    shortDescription: 'Yapay Zeka Zirvesi',
    image: '/img/events/artlab.png',
    category: ['Zirve', 'Seminer'],
    url: 'https://artlab.yildizskylab.com/',
    tags: ['Yapay Zeka', 'AI', 'Machine Learning', 'Networking'] 
  },
  {
    id: 'skydays-2026',
    title: 'SKYDAYS',
    slug: 'skydays-2026',
    description: "Türkiye'nin en büyük siber güvenlik etkinliği! İlk gün zirve ile sektörün önde gelen isimleri ve şirketleriyle buluşun, ikinci gün CTF yarışmasına katılın.", 
    shortDescription: "Siber Güvenlik Etkinliği ve CTF",
    image: '/img/events/skydays.png',
    category: ['Zirve', 'Yarışma'],
    url: 'https://skydays.yildizskylab.com/',
    tags: ['Siber Güvenlik', 'CTF', 'Cybersecurity', 'Ethical Hacking']
  },
  {
    id: 'yildizjam-2026',
    title: 'YILDIZJAM',
    slug: 'yildizjam-2026',
    description: 'Oyun Geliştirme Zirvesi ve Yarışması! 48 saatlik yoğun game jam yarışması. Hem çevrim içi hem çevrim dışı katılım mümkün.', 
    shortDescription: '48 Saatlik Game Jam Yarışması',
    image: '/img/events/yildizjam.png',
    category: ['Zirve','Yarışma', 'Workshop'],
    url: 'https://yildizjam.yildizskylab.com/',
    tags: ['Oyun Geliştirme', 'Game Jam', 'Unity', 'C#', 'Game Design']
  },
  {
    id: 'bizbize-2025',
    title: 'BİZBİZE',
    slug: 'bizbize-2025',
    description: 'Değerli mezunlarımız ile öğrencileri buluşturan networking etkinliği. Kariyer hikayeleri, sektör sunumları ve bol muhabbet!', 
    shortDescription: 'Mezun-Öğrenci Buluşması',
    image: '/img/events/bizbize.png',
    category: ['Networking', 'Buluşma'],
    tags: ['Kariyer', 'Mezunlar', 'Mentörlük', 'Deneyim Paylaşımı']
  },
  {
    id: 'gecekodu',
    title: 'GECEKODU',
    slug: 'gecekodu',
    description: "Her cuma akşamı 19:00'dan sabah 07:00'ye kadar süren bilgisayar bilimleri üzerine bireysel çalışma ve akran öğrenmesi etkinliği.", 
    shortDescription: 'Haftalık Kodlama Geceleri',
    image: '/img/events/gecekodu.png',
    category: ['Buluşma', 'Çalışma'],
    tags: ['Kodlama', 'Akran Öğrenmesi', 'Yazılım Geliştirme', 'Haftalık Etkinlik']
  }
];