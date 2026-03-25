import { Site } from "./types"

export const sites: Site[] = [
  {
    id: 'yildizplace',
    title: 'YıldızPlace',
    slug: 'yildizplace',
    description: 'SKY LAB interaktif piksel sanatı ve topluluk tuvali platformu.',
    url: 'https://place.yildizskylab.com',
    image: '/img/sites/yildizplace.png',
    category: 'platform',
    featured: true,
    tags: ['pixel-art', 'interactive', 'community']
  },
  {
    id: 'ytuguessr',
    title: 'YTUGuessr',
    slug: 'ytuguessr',
    description: 'YTÜ kampüslerinin panoramik görüntülerinden konum tahmin etme oyunu.',
    url: 'https://guessr.yildizskylab.com/',
    image: '/img/sites/ytuguessr.svg',
    category: 'platform',
    featured: true,
    tags: ['guessr', 'geography', 'panorama']
  },
  {
    id: 'skycloud',
    title: 'SKYCLOUD',
    slug: 'skycloud',
    description: 'SKY LAB üyeleri için özel bulut depolama ve dosya paylaşım sistemi.',
    url: 'https://skycloud.yildizskylab.com',
    image: '/img/sites/skylablogo.svg',
    category: 'tool',
    featured: true,
    tags: ['cloud', 'storage', 'infrastructure']
  },
  {
    id: "forms",
    title: "FORMS",
    slug: "FORMS",
    description: "SKY LAB etkinlikleri, üyelik başvuruları ve geri bildirim süreçleri için merkezi form yönetim sistemi.",
    url: "https://forms.yildizskylab.com",
    image: "/img/sites/skylablogo.svg",
    category: "tool",
    featured: true,
    tags: ["forms", "registration", "management"]
  },
  {
    id: 'skylapp',
    title: 'SKYLAPP',
    slug: 'skylapp',
    description: 'Hızlı ve güvenilir SKY LAB link kısaltma servisi.',
    url: 'https://skylapp.yildizskylab.com',
    image: '/img/sites/skylablogo.svg',
    category: 'tool',
    featured: false,
    tags: ['utility', 'link-shortener']
  },
  {
    id: 'skysec-articles',
    title: 'SKYSEC Articles',
    slug: 'skysec-articles',
    description: 'Siber güvenlik dünyasından teknik makaleler ve güncel haberler.',
    url: 'https://skysec.yildizskylab.com',
    image: '/img/sites/skysec.png',
    category: 'resource',
    featured: false,
    tags: ['security', 'cybersecurity', 'articles']
  },
  {
    id: 'oda-durumu',
    title: 'SKY LAB Oda Durumu',
    slug: 'oda-durumu',
    description: 'Kulüp odasının anlık doluluk ve durum bilgisini takip edin.',
    url: 'https://oda.yildizskylab.com',
    image: '/img/sites/skylablogo.svg',
    category: 'platform',
    featured: false,
    tags: ['iot', 'status', 'real-time']
  },
  {
    id: 'sunucu-durumu',
    title: 'SKY LAB Sunucu Durumu',
    slug: 'sunucu-durumu',
    description: 'SKY LAB altyapısındaki tüm servislerin aktiflik ve performans takibi.',
    url: 'https://status.yildizskylab.com',
    image: '/img/sites/skylablogo.svg',
    category: 'tool',
    featured: false,
    tags: ['devops', 'uptime', 'monitoring']
  },
  {
    id: 'skypdf',
    title: 'SKYPDF',
    slug: 'skypdf',
    description: 'Hızlı ve pratik PDF düzenleme, birleştirme ve dönüştürme araçları.',
    url: 'https://skypdf.yildizskylab.com',
    image: '/img/sites/skylablogo.svg',
    category: 'tool',
    featured: false,
    tags: ['utility', 'pdf', 'editor']
  },
  {
    id: 'stant',
    title: 'Stant',
    slug: 'stant',
    description: 'Etkinlik ve tanıtım süreçlerini yönetmek için geliştirilmiş stant yönetim aracı.',
    url: 'https://stant.yildizskylab.com',
    image: '/img/sites/skylablogo.svg',
    category: 'platform',
    featured: false,
    tags: ['management', 'events', 'organization']
  }
];