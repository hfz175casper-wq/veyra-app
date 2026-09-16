import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';
import {
  AlertTriangle,
  Bell,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CirclePlay,
  Clock3,
  BarChart3,
  Check,
  Coins,
  Gift,
  Home as HomeIcon,
  Library,
  Languages,
  Lock,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Pause,
  Play,
  RotateCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Upload,
  Wallet,
  Volume2,
  VolumeX,
  UserCircle,
  Share2,
  UsersRound,
  Download,
  Zap,
  FileText,
} from 'lucide-react';
import { ClerkProvider, Show, SignInButton, UserButton, useAuth, useClerk, useUser } from '@clerk/react';
import { useUpload } from '@workspace/object-storage-web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import '@/index.css';

const queryClient = new QueryClient();

const getPublicAppUrl = () => {
  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
  return configuredUrl?.startsWith('http') ? configuredUrl.replace(/\/$/, '') : 'https://veyra.app';
};

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const authConfigured = Boolean(clerkPublishableKey?.trim());
type Locale = 'English' | 'Türkçe' | 'Español' | 'Português' | 'Français' | 'Deutsch' | 'Bahasa Indonesia' | '日本語' | '繁體中文' | '简体中文' | '한국어' | 'ภาษาไทย' | 'Italiano' | 'Melayu' | 'العربية' | 'Tiếng Việt' | 'हिन्दी';

const translations: Record<Locale, Record<string, string>> = {
  English: {},
  Türkçe: {
    Home: 'Ana Sayfa', 'For You': 'Senin İçin', Rewards: 'Ödüller', Wallet: 'Cüzdan', VIP: 'VIP', Search: 'Ara', 'My List': 'Listem', Following: 'Takip', Profile: 'Profil', Discover: 'Keşfet', Categories: 'Kategoriler', Genres: 'Türler', Tropes: 'Temalar', Recommended: 'Önerilen diziler', stories: 'dizi', Back: 'Geri', 'Browse by': 'Şuna göre göz at', 'Browse by mood': 'Ruh haline göre göz at', 'Story elements': 'Hikaye ögeleri', 'Pick up where you left off': 'Kaldığın yerden devam et', 'Popular picks': 'Popüler seçimler', 'Top rated': 'En yüksek puanlı', 'House picks': 'Editör seçimleri', 'View all': 'Tümünü gör', 'View library': 'Kütüphaneyi gör', 'Collect coins': 'Jeton topla', 'View balance': 'Bakiyeyi gör', 'Unlock all': 'Tümünü aç', 'Sign in to keep My List, Following, history and rewards across devices.': 'Listeni, takibini, geçmişini ve ödüllerini korumak için giriş yap.', 'See all': 'Tümünü gör', 'Back to Profile': 'Profile dön', 'More like this': 'Bunlara benzer', 'Related dramas': 'Benzer dramalar', 'Daily rewards': 'Günlük ödüller', 'Quick rewards': 'Hızlı ödüller', 'Watch & Earn': 'İzle ve kazan',
    'Trending now': 'Şimdi trend', 'Fresh picks': 'Yeni seçimler', 'Browse all': 'Tümünü gör', 'Free start': 'Ücretsiz başlangıç', 'Continue Watching': 'İzlemeye devam et', 'Curated for you': 'Senin için seçildi', Popular: 'Popüler', 'Top Rated': 'En yüksek puanlı', 'Short stories': 'Kısa hikayeler', 'Explore all': 'Tümünü keşfet',
    'Explore VEYRA': "VEYRA'yı keşfet", 'Search titles, moods, genres...': 'Başlık, tür veya konu ara...', 'Recent searches': 'Son aramalar', 'Clear all': 'Tümünü temizle', 'Popular searches': 'Popüler aramalar', 'Sort by:': 'Sıralama:', Trending: 'Trend', Newest: 'En yeni', 'The full collection': 'Tüm koleksiyon', 'stories found': 'hikaye bulundu', 'No stories in that frequency': 'Sonuç bulunamadı', 'Try a different title, genre, or let the night surprise you.': 'Başka bir başlık veya tür deneyin.', 'Clear search': 'Aramayı temizle',
    Episodes: 'Bölümler', Episode: 'Bölüm', 'Play episode 1': '1. bölümü oynat', 'Continue episode': 'bölüme devam et', 'In My List': 'Listemde', 'New episodes weekly': 'Her hafta yeni bölümler', 'Watch episode': 'Bölümü izle', Follow: 'Takip et', 'Unfollow': 'Takibi bırak', 'Following status': 'Takip ediliyor', 'Back to story': 'Hikayeye dön', 'Previous episode': 'Önceki bölüm', 'Next Episode': 'Sonraki bölüm', 'Next episode': 'Sonraki bölüm', 'First episode': 'İlk bölüm', 'End of story': 'Hikaye sonu', 'Now watching': 'Şimdi izleniyor', 'Loading episode': 'Bölüm yükleniyor', 'Playback failed': 'Oynatma başarısız', 'Try again': 'Tekrar dene', Share: 'Paylaş', Download: 'İndir', Speed: 'Hız', Quality: 'Kalite', 'Playback speed': 'Oynatma hızı', 'Video quality': 'Video kalitesi', 'VIP locked': 'VIP kilitli', Unavailable: 'Kullanılamıyor',
    'Your profile': 'Profilin', 'Guest viewer': 'Misafir izleyici', 'Guest account · local data only': 'Misafir hesabı · yalnızca cihaz verisi', 'Sync your VEYRA profile': 'VEYRA profilini eşitle', 'Sign in': 'Giriş yap', 'Auth unavailable': 'Kimlik doğrulama yok', 'Watch History': 'İzleme geçmişi', Downloads: 'İndirilenler', Notifications: 'Bildirimler', Language: 'Dil', Settings: 'Ayarlar', Help: 'Yardım', Privacy: 'Gizlilik', Terms: 'Koşullar', Account: 'Hesap', 'Account Information': 'Hesap bilgileri', Username: 'Kullanıcı adı', Email: 'E-posta', Provider: 'Sağlayıcı', 'Member since': 'Üyelik tarihi', 'Danger Zone': 'Tehlikeli bölge', 'Sign Out': 'Çıkış yap',
       'Your earnings': 'Kazançların', 'Bonus History': 'Bonus geçmişi', 'Missions will appear here soon': 'Görevler yakında burada görünecek', 'Your wallet': 'Cüzdanın', Coins: 'Jetonlar', 'Current balance': 'Mevcut bakiye', 'Your viewing trail': 'İzleme geçmişin', 'No watch history yet': 'Henüz izleme geçmişi yok', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Seçilen dil bu cihazda saklanır. Gerçek alternatif ses parçası yoksa video sesi değişmez.', 'Watch 3 Episodes': '3 bölüm izle', 'Watch 3 complete episodes': '3 bölümü tamamla', 'Daily Login': 'Günlük giriş', 'Log in for 7 consecutive days': '7 gün üst üste giriş yap', 'Follow 5 Dramas': '5 dramayı takip et', 'Add 5 dramas to your list': '5 dramayı listene ekle', 'Share a Drama': 'Drama paylaş', 'Share a drama with friends': 'Bir dramayı arkadaşlarınla paylaş', 'coins added to your wallet': 'jeton cüzdanına eklendi', 'coins for completing': 'jeton tamamlandı', 'coins for watching': 'jeton izleme ödülü', 'Watch, return, and unlock more stories.': 'İzle, geri dön ve daha fazla hikayenin kilidini aç.', Day: 'Gün', coins: 'jeton', 'Watch Episode': 'Bölüm izle', 'Watch a complete episode to earn coins': 'Jeton kazanmak için bir bölümü tamamla', 'Ad Boost': 'Reklam bonusu', 'Watch an ad for bonus coins': 'Bonus jeton için reklam izle', Claim: 'Al', Completed: 'Tamamlandı', 'No bonus history yet. Start earning!': 'Henüz bonus geçmişi yok. Kazanmaya başla!', 'Storage used': 'Kullanılan alan', 'Your downloads': 'İndirmelerin', 'No downloads yet': 'Henüz indirme yok', Downloaded: 'İndirildi', Downloading: 'İndiriliyor', Failed: 'Başarısız', Pending: 'Bekliyor', Delete: 'Sil', 'Downloads are stored locally on your device. Storage varies by device.': 'İndirmeler cihazında yerel olarak saklanır.',
  },
  Español: { Home: 'Inicio', Search: 'Buscar', 'My List': 'Mi lista', Following: 'Siguiendo', Profile: 'Perfil', Rewards: 'Recompensas', Wallet: 'Billetera', Discover: 'Descubrir', Recommended: 'Recomendado', Back: 'Atrás', Episodes: 'Episodios', Episode: 'Episodio', Share: 'Compartir', Download: 'Descargar', Speed: 'Velocidad', Quality: 'Calidad', 'Previous episode': 'Episodio anterior', 'Next episode': 'Siguiente episodio', 'Playback failed': 'Error de reproducción', 'Try again': 'Reintentar' },
  Português: { Home: 'Início', Search: 'Pesquisar', 'My List': 'Minha lista', Following: 'Seguindo', Profile: 'Perfil', Rewards: 'Recompensas', Wallet: 'Carteira', Discover: 'Descobrir', Recommended: 'Recomendado', Back: 'Voltar', Episodes: 'Episódios', Episode: 'Episódio', Share: 'Compartilhar', Download: 'Baixar', Speed: 'Velocidade', Quality: 'Qualidade', 'Previous episode': 'Episódio anterior', 'Next episode': 'Próximo episódio', 'Playback failed': 'Falha na reprodução', 'Try again': 'Tentar novamente' },
  Français: { Home: 'Accueil', Search: 'Rechercher', 'My List': 'Ma liste', Following: 'Suivis', Profile: 'Profil', Rewards: 'Récompenses', Wallet: 'Portefeuille', Discover: 'Découvrir', Recommended: 'Recommandé', Back: 'Retour', Episodes: 'Épisodes', Episode: 'Épisode', Share: 'Partager', Download: 'Télécharger', Speed: 'Vitesse', Quality: 'Qualité', 'Previous episode': 'Épisode précédent', 'Next episode': 'Épisode suivant', 'Playback failed': 'Échec de lecture', 'Try again': 'Réessayer' },
  Deutsch: { Home: 'Startseite', Search: 'Suchen', 'My List': 'Meine Liste', Following: 'Folge ich', Profile: 'Profil', Rewards: 'Belohnungen', Wallet: 'Wallet', Discover: 'Entdecken', Recommended: 'Empfohlen', Back: 'Zurück', Episodes: 'Episoden', Episode: 'Episode', Share: 'Teilen', Download: 'Herunterladen', Speed: 'Geschwindigkeit', Quality: 'Qualität', 'Previous episode': 'Vorherige Episode', 'Next episode': 'Nächste Episode', 'Playback failed': 'Wiedergabe fehlgeschlagen', 'Try again': 'Erneut versuchen' },
  'Bahasa Indonesia': { Home: 'Beranda', Search: 'Cari', 'My List': 'Daftar Saya', Following: 'Mengikuti', Profile: 'Profil', Rewards: 'Hadiah', Wallet: 'Dompet', Discover: 'Temukan', Recommended: 'Rekomendasi', Back: 'Kembali', Episodes: 'Episode', Episode: 'Episode', Share: 'Bagikan', Download: 'Unduh', Speed: 'Kecepatan', Quality: 'Kualitas', 'Previous episode': 'Episode sebelumnya', 'Next episode': 'Episode berikutnya', 'Playback failed': 'Pemutaran gagal', 'Try again': 'Coba lagi' },
  '日本語': { Home: 'ホーム', Search: '検索', 'My List': 'マイリスト', Following: 'フォロー中', Profile: 'プロフィール', Rewards: 'リワード', Wallet: 'ウォレット', Discover: '見つける', Recommended: 'おすすめ', Back: '戻る', Episodes: 'エピソード', Episode: 'エピソード', Share: '共有', Download: 'ダウンロード', Speed: '速度', Quality: '画質', 'Previous episode': '前のエピソード', 'Next episode': '次のエピソード', 'Playback failed': '再生に失敗しました', 'Try again': '再試行' },
  '繁體中文': { Home: '首頁', Search: '搜尋', 'My List': '我的片單', Following: '關注中', Profile: '個人資料', Rewards: '獎勵', Wallet: '錢包', Discover: '探索', Recommended: '推薦劇集', Back: '返回', Episodes: '集數', Episode: '第集', Share: '分享', Download: '下載', Speed: '速度', Quality: '畫質', 'Previous episode': '上一集', 'Next episode': '下一集', 'Playback failed': '播放失敗', 'Try again': '重試' },
  '简体中文': { Home: '首页', Search: '搜索', 'My List': '我的片单', Following: '关注中', Profile: '个人资料', Rewards: '奖励', Wallet: '钱包', Discover: '发现', Recommended: '推荐剧集', Back: '返回', Episodes: '集数', Episode: '第集', Share: '分享', Download: '下载', Speed: '速度', Quality: '画质', 'Previous episode': '上一集', 'Next episode': '下一集', 'Playback failed': '播放失败', 'Try again': '重试' },
  '한국어': { Home: '홈', Search: '검색', 'My List': '내 목록', Following: '팔로잉', Profile: '프로필', Rewards: '보상', Wallet: '지갑', Discover: '탐색', Recommended: '추천 드라마', Back: '뒤로', Episodes: '에피소드', Episode: '에피소드', Share: '공유', Download: '다운로드', Speed: '속도', Quality: '화질', 'Previous episode': '이전 에피소드', 'Next episode': '다음 에피소드', 'Playback failed': '재생 실패', 'Try again': '다시 시도' },
  'ภาษาไทย': { Home: 'หน้าหลัก', Search: 'ค้นหา', 'My List': 'รายการของฉัน', Following: 'กำลังติดตาม', Profile: 'โปรไฟล์', Rewards: 'รางวัล', Wallet: 'กระเป๋าเงิน', Discover: 'ค้นพบ', Recommended: 'เรื่องแนะนำ', Back: 'ย้อนกลับ', Episodes: 'ตอน', Episode: 'ตอนที่', Share: 'แชร์', Download: 'ดาวน์โหลด', Speed: 'ความเร็ว', Quality: 'คุณภาพ', 'Previous episode': 'ตอนก่อนหน้า', 'Next episode': 'ตอนถัดไป', 'Playback failed': 'เล่นไม่สำเร็จ', 'Try again': 'ลองอีกครั้ง' },
  Italiano: { Home: 'Home', Search: 'Cerca', 'My List': 'La mia lista', Following: 'Seguiti', Profile: 'Profilo', Rewards: 'Ricompense', Wallet: 'Portafoglio', Discover: 'Scopri', Recommended: 'Consigliati', Back: 'Indietro', Episodes: 'Episodi', Episode: 'Episodio', Share: 'Condividi', Download: 'Scarica', Speed: 'Velocità', Quality: 'Qualità', 'Previous episode': 'Episodio precedente', 'Next episode': 'Episodio successivo', 'Playback failed': 'Riproduzione non riuscita', 'Try again': 'Riprova' },
  Melayu: { Home: 'Laman Utama', Search: 'Cari', 'My List': 'Senarai Saya', Following: 'Mengikuti', Profile: 'Profil', Rewards: 'Ganjaran', Wallet: 'Dompet', Discover: 'Teroka', Recommended: 'Disyorkan', Back: 'Kembali', Episodes: 'Episod', Episode: 'Episod', Share: 'Kongsi', Download: 'Muat turun', Speed: 'Kelajuan', Quality: 'Kualiti', 'Previous episode': 'Episod sebelumnya', 'Next episode': 'Episod seterusnya', 'Playback failed': 'Main balik gagal', 'Try again': 'Cuba lagi' },
  العربية: { Home: 'الرئيسية', Search: 'بحث', 'My List': 'قائمتي', Following: 'المتابعة', Profile: 'الملف الشخصي', Rewards: 'المكافآت', Wallet: 'المحفظة', Discover: 'اكتشف', Recommended: 'مقترح', Back: 'رجوع', Episodes: 'الحلقات', Episode: 'حلقة', Share: 'مشاركة', Download: 'تنزيل', Speed: 'السرعة', Quality: 'الجودة', 'Previous episode': 'الحلقة السابقة', 'Next episode': 'الحلقة التالية', 'Playback failed': 'فشل التشغيل', 'Try again': 'حاول مرة أخرى' },
  'Tiếng Việt': { Home: 'Trang chủ', Search: 'Tìm kiếm', 'My List': 'Danh sách của tôi', Following: 'Đang theo dõi', Profile: 'Hồ sơ', Rewards: 'Phần thưởng', Wallet: 'Ví', Discover: 'Khám phá', Recommended: 'Đề xuất', Back: 'Quay lại', Episodes: 'Tập phim', Episode: 'Tập', Share: 'Chia sẻ', Download: 'Tải xuống', Speed: 'Tốc độ', Quality: 'Chất lượng', 'Previous episode': 'Tập trước', 'Next episode': 'Tập tiếp theo', 'Playback failed': 'Phát thất bại', 'Try again': 'Thử lại' },
  'हिन्दी': { Home: 'होम', Search: 'खोजें', 'My List': 'मेरी सूची', Following: 'फॉलो कर रहे हैं', Profile: 'प्रोफ़ाइल', Rewards: 'रिवॉर्ड', Wallet: 'वॉलेट', Discover: 'खोजें', Recommended: 'अनुशंसित', Back: 'वापस', Episodes: 'एपिसोड', Episode: 'एपिसोड', Share: 'शेयर', Download: 'डाउनलोड', Speed: 'गति', Quality: 'गुणवत्ता', 'Previous episode': 'पिछला एपिसोड', 'Next episode': 'अगला एपिसोड', 'Playback failed': 'प्लेबैक विफल', 'Try again': 'फिर कोशिश करें' },
};

const sharedUiTranslations: Partial<Record<Locale, Record<string, string>>> = {
  English: { Settings: 'Settings', Language: 'Language', Notifications: 'Notifications', Downloads: 'Downloads', 'Watch History': 'Watch History', Profile: 'Profile', Rewards: 'Rewards', Wallet: 'Wallet', 'My List': 'My List', Following: 'Following', VIP: 'VIP', 'Referral / Invite': 'Referral / Invite', 'Edit Profile': 'Edit Profile', 'Sign in': 'Sign in', 'Sign Out': 'Sign out', Delete: 'Delete', Share: 'Share', Download: 'Download', Episode: 'Episode', Episodes: 'Episodes', 'Previous episode': 'Previous episode', 'Next episode': 'Next episode', Quality: 'Quality', Speed: 'Speed', Search: 'Search', Back: 'Back', Home: 'Home', Discover: 'Discover', Recommended: 'Recommended', 'No downloads yet': 'No downloads yet' },
  Türkçe: { Settings: 'Ayarlar', Language: 'Dil', Notifications: 'Bildirimler', Downloads: 'İndirilenler', 'Watch History': 'İzleme geçmişi', Profile: 'Profil', Rewards: 'Ödüller', Wallet: 'Cüzdan', 'My List': 'Listem', Following: 'Takip', VIP: 'VIP', 'Referral / Invite': 'Davet et', 'Edit Profile': 'Profili düzenle', 'Sign in': 'Giriş yap', 'Sign Out': 'Çıkış yap', Delete: 'Sil', Share: 'Paylaş', Download: 'İndir', Episode: 'Bölüm', Episodes: 'Bölümler', 'Previous episode': 'Önceki bölüm', 'Next episode': 'Sonraki bölüm', Quality: 'Kalite', Speed: 'Hız', Search: 'Ara', Back: 'Geri', Home: 'Ana Sayfa', Discover: 'Keşfet', Recommended: 'Önerilen', 'No downloads yet': 'Henüz indirme yok' },
  Español: { Settings: 'Ajustes', Language: 'Idioma', Notifications: 'Notificaciones', Downloads: 'Descargas', 'Watch History': 'Historial', Profile: 'Perfil', Rewards: 'Recompensas', Wallet: 'Billetera', 'My List': 'Mi lista', Following: 'Siguiendo', VIP: 'VIP', 'Referral / Invite': 'Referir / Invitar', 'Edit Profile': 'Editar perfil', 'Sign in': 'Iniciar sesión', 'Sign Out': 'Cerrar sesión', Delete: 'Eliminar', Share: 'Compartir', Download: 'Descargar', Episode: 'Episodio', Episodes: 'Episodios', 'Previous episode': 'Episodio anterior', 'Next episode': 'Siguiente episodio', Quality: 'Calidad', Speed: 'Velocidad', Search: 'Buscar', Back: 'Atrás', Home: 'Inicio', Discover: 'Descubrir', Recommended: 'Recomendado', 'No downloads yet': 'Aún no hay descargas' },
  Português: { Settings: 'Configurações', Language: 'Idioma', Notifications: 'Notificações', Downloads: 'Downloads', 'Watch History': 'Histórico', Profile: 'Perfil', Rewards: 'Recompensas', Wallet: 'Carteira', 'My List': 'Minha lista', Following: 'Seguindo', VIP: 'VIP', 'Referral / Invite': 'Indicar / Convidar', 'Edit Profile': 'Editar perfil', 'Sign in': 'Entrar', 'Sign Out': 'Sair', Delete: 'Excluir', Share: 'Compartilhar', Download: 'Baixar', Episode: 'Episódio', Episodes: 'Episódios', 'Previous episode': 'Episódio anterior', 'Next episode': 'Próximo episódio', Quality: 'Qualidade', Speed: 'Velocidade', Search: 'Pesquisar', Back: 'Voltar', Home: 'Início', Discover: 'Descobrir', Recommended: 'Recomendado', 'No downloads yet': 'Nenhum download ainda' },
  Français: { Settings: 'Paramètres', Language: 'Langue', Notifications: 'Notifications', Downloads: 'Téléchargements', 'Watch History': 'Historique', Profile: 'Profil', Rewards: 'Récompenses', Wallet: 'Portefeuille', 'My List': 'Ma liste', Following: 'Suivis', VIP: 'VIP', 'Referral / Invite': 'Parrainer / Inviter', 'Edit Profile': 'Modifier le profil', 'Sign in': 'Se connecter', 'Sign Out': 'Se déconnecter', Delete: 'Supprimer', Share: 'Partager', Download: 'Télécharger', Episode: 'Épisode', Episodes: 'Épisodes', 'Previous episode': 'Épisode précédent', 'Next episode': 'Épisode suivant', Quality: 'Qualité', Speed: 'Vitesse', Search: 'Rechercher', Back: 'Retour', Home: 'Accueil', Discover: 'Découvrir', Recommended: 'Recommandé', 'No downloads yet': 'Aucun téléchargement' },
  Deutsch: { Settings: 'Einstellungen', Language: 'Sprache', Notifications: 'Benachrichtigungen', Downloads: 'Downloads', 'Watch History': 'Verlauf', Profile: 'Profil', Rewards: 'Belohnungen', Wallet: 'Wallet', 'My List': 'Meine Liste', Following: 'Folge ich', VIP: 'VIP', 'Referral / Invite': 'Empfehlen / Einladen', 'Edit Profile': 'Profil bearbeiten', 'Sign in': 'Anmelden', 'Sign Out': 'Abmelden', Delete: 'Löschen', Share: 'Teilen', Download: 'Herunterladen', Episode: 'Episode', Episodes: 'Episoden', 'Previous episode': 'Vorherige Episode', 'Next episode': 'Nächste Episode', Quality: 'Qualität', Speed: 'Geschwindigkeit', Search: 'Suchen', Back: 'Zurück', Home: 'Startseite', Discover: 'Entdecken', Recommended: 'Empfohlen', 'No downloads yet': 'Noch keine Downloads' },
  'Bahasa Indonesia': { Settings: 'Pengaturan', Language: 'Bahasa', Notifications: 'Notifikasi', Downloads: 'Unduhan', 'Watch History': 'Riwayat tontonan', Profile: 'Profil', Rewards: 'Hadiah', Wallet: 'Dompet', 'My List': 'Daftar Saya', Following: 'Mengikuti', VIP: 'VIP', 'Referral / Invite': 'Rujuk / Undang', 'Edit Profile': 'Edit profil', 'Sign in': 'Masuk', 'Sign Out': 'Keluar', Delete: 'Hapus', Share: 'Bagikan', Download: 'Unduh', Episode: 'Episode', Episodes: 'Episode', 'Previous episode': 'Episode sebelumnya', 'Next episode': 'Episode berikutnya', Quality: 'Kualitas', Speed: 'Kecepatan', Search: 'Cari', Back: 'Kembali', Home: 'Beranda', Discover: 'Temukan', Recommended: 'Rekomendasi', 'No downloads yet': 'Belum ada unduhan' },
  '日本語': { Settings: '設定', Language: '言語', Notifications: '通知', Downloads: 'ダウンロード', 'Watch History': '視聴履歴', Profile: 'プロフィール', Rewards: 'リワード', Wallet: 'ウォレット', 'My List': 'マイリスト', Following: 'フォロー中', VIP: 'VIP', 'Referral / Invite': '紹介 / 招待', 'Edit Profile': 'プロフィールを編集', 'Sign in': 'ログイン', 'Sign Out': 'ログアウト', Delete: '削除', Share: '共有', Download: 'ダウンロード', Episode: 'エピソード', Episodes: 'エピソード', 'Previous episode': '前のエピソード', 'Next episode': '次のエピソード', Quality: '画質', Speed: '速度', Search: '検索', Back: '戻る', Home: 'ホーム', Discover: '見つける', Recommended: 'おすすめ', 'No downloads yet': 'ダウンロードはありません' },
  '繁體中文': { Settings: '設定', Language: '語言', Notifications: '通知', Downloads: '下載', 'Watch History': '觀看記錄', Profile: '個人資料', Rewards: '獎勵', Wallet: '錢包', 'My List': '我的片單', Following: '關注中', VIP: 'VIP', 'Referral / Invite': '推薦 / 邀請', 'Edit Profile': '編輯個人資料', 'Sign in': '登入', 'Sign Out': '登出', Delete: '刪除', Share: '分享', Download: '下載', Episode: '集', Episodes: '集數', 'Previous episode': '上一集', 'Next episode': '下一集', Quality: '畫質', Speed: '速度', Search: '搜尋', Back: '返回', Home: '首頁', Discover: '探索', Recommended: '推薦', 'No downloads yet': '尚無下載' },
  '简体中文': { Settings: '设置', Language: '语言', Notifications: '通知', Downloads: '下载', 'Watch History': '观看记录', Profile: '个人资料', Rewards: '奖励', Wallet: '钱包', 'My List': '我的片单', Following: '关注中', VIP: 'VIP', 'Referral / Invite': '推荐 / 邀请', 'Edit Profile': '编辑个人资料', 'Sign in': '登录', 'Sign Out': '退出登录', Delete: '删除', Share: '分享', Download: '下载', Episode: '集', Episodes: '集数', 'Previous episode': '上一集', 'Next episode': '下一集', Quality: '画质', Speed: '速度', Search: '搜索', Back: '返回', Home: '首页', Discover: '发现', Recommended: '推荐', 'No downloads yet': '暂无下载' },
  '한국어': { Settings: '설정', Language: '언어', Notifications: '알림', Downloads: '다운로드', 'Watch History': '시청 기록', Profile: '프로필', Rewards: '보상', Wallet: '지갑', 'My List': '내 목록', Following: '팔로잉', VIP: 'VIP', 'Referral / Invite': '추천 / 초대', 'Edit Profile': '프로필 편집', 'Sign in': '로그인', 'Sign Out': '로그아웃', Delete: '삭제', Share: '공유', Download: '다운로드', Episode: '에피소드', Episodes: '에피소드', 'Previous episode': '이전 에피소드', 'Next episode': '다음 에피소드', Quality: '화질', Speed: '속도', Search: '검색', Back: '뒤로', Home: '홈', Discover: '탐색', Recommended: '추천', 'No downloads yet': '다운로드 없음' },
  'ภาษาไทย': { Settings: 'การตั้งค่า', Language: 'ภาษา', Notifications: 'การแจ้งเตือน', Downloads: 'ดาวน์โหลด', 'Watch History': 'ประวัติการรับชม', Profile: 'โปรไฟล์', Rewards: 'รางวัล', Wallet: 'กระเป๋าเงิน', 'My List': 'รายการของฉัน', Following: 'กำลังติดตาม', VIP: 'VIP', 'Referral / Invite': 'แนะนำ / เชิญ', 'Edit Profile': 'แก้ไขโปรไฟล์', 'Sign in': 'เข้าสู่ระบบ', 'Sign Out': 'ออกจากระบบ', Delete: 'ลบ', Share: 'แชร์', Download: 'ดาวน์โหลด', Episode: 'ตอน', Episodes: 'ตอน', 'Previous episode': 'ตอนก่อนหน้า', 'Next episode': 'ตอนถัดไป', Quality: 'คุณภาพ', Speed: 'ความเร็ว', Search: 'ค้นหา', Back: 'ย้อนกลับ', Home: 'หน้าหลัก', Discover: 'ค้นพบ', Recommended: 'แนะนำ', 'No downloads yet': 'ยังไม่มีดาวน์โหลด' },
  Italiano: { Settings: 'Impostazioni', Language: 'Lingua', Notifications: 'Notifiche', Downloads: 'Download', 'Watch History': 'Cronologia', Profile: 'Profilo', Rewards: 'Ricompense', Wallet: 'Portafoglio', 'My List': 'La mia lista', Following: 'Seguiti', VIP: 'VIP', 'Referral / Invite': 'Invita', 'Edit Profile': 'Modifica profilo', 'Sign in': 'Accedi', 'Sign Out': 'Esci', Delete: 'Elimina', Share: 'Condividi', Download: 'Scarica', Episode: 'Episodio', Episodes: 'Episodi', 'Previous episode': 'Episodio precedente', 'Next episode': 'Episodio successivo', Quality: 'Qualità', Speed: 'Velocità', Search: 'Cerca', Back: 'Indietro', Home: 'Home', Discover: 'Scopri', Recommended: 'Consigliati', 'No downloads yet': 'Nessun download' },
  Melayu: { Settings: 'Tetapan', Language: 'Bahasa', Notifications: 'Pemberitahuan', Downloads: 'Muat turun', 'Watch History': 'Sejarah tontonan', Profile: 'Profil', Rewards: 'Ganjaran', Wallet: 'Dompet', 'My List': 'Senarai Saya', Following: 'Mengikuti', VIP: 'VIP', 'Referral / Invite': 'Rujuk / Jemput', 'Edit Profile': 'Edit profil', 'Sign in': 'Log masuk', 'Sign Out': 'Log keluar', Delete: 'Padam', Share: 'Kongsi', Download: 'Muat turun', Episode: 'Episod', Episodes: 'Episod', 'Previous episode': 'Episod sebelumnya', 'Next episode': 'Episod seterusnya', Quality: 'Kualiti', Speed: 'Kelajuan', Search: 'Cari', Back: 'Kembali', Home: 'Laman Utama', Discover: 'Teroka', Recommended: 'Disyorkan', 'No downloads yet': 'Tiada muat turun' },
  العربية: { Settings: 'الإعدادات', Language: 'اللغة', Notifications: 'الإشعارات', Downloads: 'التنزيلات', 'Watch History': 'سجل المشاهدة', Profile: 'الملف الشخصي', Rewards: 'المكافآت', Wallet: 'المحفظة', 'My List': 'قائمتي', Following: 'المتابعة', VIP: 'VIP', 'Referral / Invite': 'إحالة / دعوة', 'Edit Profile': 'تعديل الملف الشخصي', 'Sign in': 'تسجيل الدخول', 'Sign Out': 'تسجيل الخروج', Delete: 'حذف', Share: 'مشاركة', Download: 'تنزيل', Episode: 'حلقة', Episodes: 'الحلقات', 'Previous episode': 'الحلقة السابقة', 'Next episode': 'الحلقة التالية', Quality: 'الجودة', Speed: 'السرعة', Search: 'بحث', Back: 'رجوع', Home: 'الرئيسية', Discover: 'اكتشف', Recommended: 'مقترح', 'No downloads yet': 'لا توجد تنزيلات' },
  'Tiếng Việt': { Settings: 'Cài đặt', Language: 'Ngôn ngữ', Notifications: 'Thông báo', Downloads: 'Tải xuống', 'Watch History': 'Lịch sử xem', Profile: 'Hồ sơ', Rewards: 'Phần thưởng', Wallet: 'Ví', 'My List': 'Danh sách của tôi', Following: 'Đang theo dõi', VIP: 'VIP', 'Referral / Invite': 'Giới thiệu / Mời', 'Edit Profile': 'Chỉnh sửa hồ sơ', 'Sign in': 'Đăng nhập', 'Sign Out': 'Đăng xuất', Delete: 'Xóa', Share: 'Chia sẻ', Download: 'Tải xuống', Episode: 'Tập', Episodes: 'Tập phim', 'Previous episode': 'Tập trước', 'Next episode': 'Tập tiếp theo', Quality: 'Chất lượng', Speed: 'Tốc độ', Search: 'Tìm kiếm', Back: 'Quay lại', Home: 'Trang chủ', Discover: 'Khám phá', Recommended: 'Đề xuất', 'No downloads yet': 'Chưa có lượt tải xuống' },
  'हिन्दी': { Settings: 'सेटिंग्स', Language: 'भाषा', Notifications: 'सूचनाएं', Downloads: 'डाउनलोड', 'Watch History': 'देखने का इतिहास', Profile: 'प्रोफ़ाइल', Rewards: 'रिवॉर्ड', Wallet: 'वॉलेट', 'My List': 'मेरी सूची', Following: 'फॉलो कर रहे हैं', VIP: 'VIP', 'Referral / Invite': 'रेफर / आमंत्रित करें', 'Edit Profile': 'प्रोफ़ाइल संपादित करें', 'Sign in': 'साइन इन', 'Sign Out': 'साइन आउट', Delete: 'हटाएं', Share: 'शेयर', Download: 'डाउनलोड', Episode: 'एपिसोड', Episodes: 'एपिसोड', 'Previous episode': 'पिछला एपिसोड', 'Next episode': 'अगला एपिसोड', Quality: 'गुणवत्ता', Speed: 'गति', Search: 'खोजें', Back: 'वापस', Home: 'होम', Discover: 'खोजें', Recommended: 'अनुशंसित', 'No downloads yet': 'अभी कोई डाउनलोड नहीं' },
};

const languagePageTranslations: Record<Locale, Record<string, string>> = {
  English: { 'Back to Profile': 'Back to Profile', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.' },
  Türkçe: { 'Back to Profile': 'Profile dön', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Seçilen dil bu cihazda saklanır. Gerçek alternatif ses parçası yoksa video sesi değişmez.' },
  Español: { 'Back to Profile': 'Volver al perfil', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'El idioma seleccionado se guarda en este dispositivo. El audio del video no cambia sin una pista alternativa real.' },
  Português: { 'Back to Profile': 'Voltar ao perfil', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'O idioma selecionado é salvo neste dispositivo. O áudio do vídeo não muda sem uma faixa alternativa real.' },
  Français: { 'Back to Profile': 'Retour au profil', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'La langue sélectionnée est enregistrée sur cet appareil. L’audio ne change pas sans une vraie piste alternative.' },
  Deutsch: { 'Back to Profile': 'Zurück zum Profil', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Die ausgewählte Sprache wird auf diesem Gerät gespeichert. Die Audiospur ändert sich nur bei einer echten Alternative.' },
  'Bahasa Indonesia': { 'Back to Profile': 'Kembali ke profil', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Bahasa yang dipilih disimpan di perangkat ini. Audio video tidak berubah tanpa trek alternatif yang nyata.' },
  '日本語': { 'Back to Profile': 'プロフィールに戻る', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': '選択した言語はこの端末に保存されます。実際の別音声がない限り動画の音声は変わりません。' },
  '繁體中文': { 'Back to Profile': '返回個人資料', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': '選擇的語言會儲存在此裝置。沒有真實替代音軌時，影片音訊不會改變。' },
  '简体中文': { 'Back to Profile': '返回个人资料', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': '所选语言会保存在此设备。没有真实替代音轨时，视频音频不会改变。' },
  '한국어': { 'Back to Profile': '프로필로 돌아가기', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': '선택한 언어는 이 기기에 저장됩니다. 실제 대체 오디오 트랙이 없으면 영상 음성은 바뀌지 않습니다.' },
  'ภาษาไทย': { 'Back to Profile': 'กลับไปที่โปรไฟล์', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'ภาษาที่เลือกจะบันทึกในอุปกรณ์นี้ เสียงวิดีโอจะไม่เปลี่ยนหากไม่มีแทร็กเสียงอื่นจริง' },
  Italiano: { 'Back to Profile': 'Torna al profilo', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'La lingua selezionata viene salvata su questo dispositivo. L’audio non cambia senza una traccia alternativa reale.' },
  Melayu: { 'Back to Profile': 'Kembali ke profil', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Bahasa yang dipilih disimpan pada peranti ini. Audio video tidak berubah tanpa trek alternatif sebenar.' },
  العربية: { 'Back to Profile': 'العودة إلى الملف الشخصي', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'يتم حفظ اللغة المحددة على هذا الجهاز. لن يتغير صوت الفيديو دون مسار صوتي بديل حقيقي.' },
  'Tiếng Việt': { 'Back to Profile': 'Quay lại hồ sơ', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'Ngôn ngữ đã chọn được lưu trên thiết bị. Âm thanh video không đổi nếu không có bản âm thanh thay thế thật.' },
  'हिन्दी': { 'Back to Profile': 'प्रोफ़ाइल पर वापस जाएं', 'Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.': 'चुनी गई भाषा इस डिवाइस पर सहेजी जाती है। वास्तविक वैकल्पिक ऑडियो ट्रैक के बिना वीडियो की आवाज़ नहीं बदलेगी।' },
};
const additionalUiTranslations: Record<Locale, Record<string, string>> = {
  English: { 'For You': 'For You' }, Türkçe: { 'For You': 'Senin İçin' }, Español: { 'For You': 'Para ti' }, Português: { 'For You': 'Para você' }, Français: { 'For You': 'Pour vous' }, Deutsch: { 'For You': 'Für dich' }, 'Bahasa Indonesia': { 'For You': 'Untuk Anda' }, '日本語': { 'For You': 'あなたへ' }, '繁體中文': { 'For You': '為你推薦' }, '简体中文': { 'For You': '为你推荐' }, '한국어': { 'For You': '추천' }, 'ภาษาไทย': { 'For You': 'สำหรับคุณ' }, Italiano: { 'For You': 'Per te' }, Melayu: { 'For You': 'Untuk Anda' }, العربية: { 'For You': 'من أجلك' }, 'Tiếng Việt': { 'For You': 'Dành cho bạn' }, 'हिन्दी': { 'For You': 'आपके लिए' },
};

const createTranslator = (locale: Locale) => (text: string) => {
  const translated = translations[locale][text] ?? sharedUiTranslations[locale]?.[text] ?? languagePageTranslations[locale][text] ?? additionalUiTranslations[locale][text];
  if (translated) return translated;
  if (import.meta.env.DEV) console.warn(`[i18n] Missing ${locale} translation: ${text}`);
  return `[${text}]`;
};

function AuthAction({ children, className }: { children: ReactNode; className?: string }) {
  if (!authConfigured) {
    return <button type="button" disabled title="Authentication is not configured. Set VITE_CLERK_PUBLISHABLE_KEY." className={`${className ?? ''} cursor-not-allowed opacity-60`}>{children}</button>;
  }
  return <SignInButton mode="modal"><button type="button" className={className}>{children}</button></SignInButton>;
}

type Episode = {
  number: number;
  title: string;
  runtime: string;
  released: string;
  synopsis: string;
  videoUrl: string;
  videoSources: Partial<Record<VideoQuality, string>>;
  captions: CaptionCue[];
};

type VideoQuality = '540p' | '720p' | '1080p';
type CaptionCue = {
  language: string;
  start: number;
  end: number;
  text: string;
};

type Drama = {
  id: string;
  title: string;
  eyebrow: string;
  genre: string[];
  year: string;
  rating: string;
  episodeCount: number;
  description: string;
  image: string;
  accent: string;
  featured?: boolean;
  episodes: Episode[];
};

type VeyraNativeBridge = {
  setFullscreen?: (fullscreen: boolean) => void;
  share?: (title: string, url: string) => void;
  download?: (url: string, fileName: string) => void;
};

declare global {
  interface Window {
    VeyraNative?: VeyraNativeBridge;
  }
}

const posterImages = {
  voicemail: 'https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=900',
  glass: 'https://images.pexels.com/photos/157811/pexels-photo-157811.jpeg?auto=compress&cs=tinysrgb&w=900',
  midnight: 'https://images.pexels.com/photos/2269877/pexels-photo-2269877.jpeg?auto=compress&cs=tinysrgb&w=900',
  borrowed: 'https://images.pexels.com/photos/2521619/pexels-photo-2521619.jpeg?auto=compress&cs=tinysrgb&w=900',
  saints: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=900',
  orbit: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=900',
  after: 'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=900',
};

const placeholderVideos = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
];

const getLastEpisode = (dramaId: string) => {
  if (typeof window === 'undefined') return 1;
  const storedEpisode = Number(localStorage.getItem(`veyra:last-episode:${dramaId}`) ?? 1);
  return Number.isFinite(storedEpisode) && storedEpisode > 0 ? storedEpisode : 1;
};

const hasDownloadedEpisode = (dramaId: string) => {
  if (typeof window === 'undefined') return false;
  try {
    const downloads = JSON.parse(localStorage.getItem('veyra:downloads') ?? '[]') as Array<{ dramaId?: string; status?: string }>;
    return downloads.some((download) => download.dramaId === dramaId && download.status === 'downloaded');
  } catch {
    return false;
  }
};

const createEpisodes = (titles: string[], runtimes: string[], synopses: string[]): Episode[] =>
  titles.map((title, index) => {
    const synopsis = synopses[index] ?? 'A small decision turns the night in an unexpected direction.';
    return {
      number: index + 1,
      title,
      runtime: runtimes[index] ?? '08:10',
      released: index === 0 ? 'Today' : `${index}d ago`,
      synopsis,
      videoUrl: placeholderVideos[index % placeholderVideos.length],
      videoSources: { '720p': placeholderVideos[index % placeholderVideos.length] },
      captions: [{ language: 'en', start: 0, end: 90, text: synopsis }],
    };
  });

const dramas: Drama[] = [
  {
    id: 'the-last-voicemail',
    title: 'The Last Voicemail',
    eyebrow: 'A message from tomorrow',
    genre: ['Thriller', 'Romance'],
    year: '2024',
    rating: '16+',
    episodeCount: 8,
    description: 'At 2:17 a.m., Mara receives a voicemail from the man she buried three years ago. It ends with her own voice saying: do not trust the morning.',
    image: posterImages.voicemail,
    accent: '#ff4fc3',
    featured: true,
    episodes: createEpisodes(
      ['2:17 A.M.', 'The Number That Died', 'A Familiar Stranger', 'Do Not Trust Morning', 'The Blue Door', 'Playback', 'No Signal', 'The Last Voicemail'],
      ['09:42', '08:16', '07:58', '10:03', '08:44', '09:05', '07:36', '11:12'],
      [
        'Mara wakes to a voicemail in a voice that should no longer exist.',
        'The phone number belongs to a disconnected line. Someone is still answering.',
        'At the train station, a stranger knows a detail only Jonas could know.',
        'The voicemail gives Mara one hour to change what has already happened.',
        'A blue door appears in an old photograph, where a wall used to be.',
        'Mara plays the message backwards and hears a second conversation.',
        'Every screen in the city goes dark except hers.',
        'The final message arrives from inside the room.',
      ],
    ),
  },
  {
    id: 'glass-house',
    title: 'Glass House',
    eyebrow: 'Everyone is watching',
    genre: ['Mystery', 'Drama'],
    year: '2024',
    rating: '13+',
    episodeCount: 6,
    description: 'A live-in architect moves into the smart home she designed and discovers the house has been keeping a diary of everyone who enters.',
    image: posterImages.glass,
    accent: '#76b7bd',
    episodes: createEpisodes(
      ['Welcome Home', 'The House Remembers', 'Open Plan', 'Guest Mode', 'A Crack in the View', 'Exit Interview'],
      ['08:52', '07:42', '09:11', '08:33', '10:08', '09:47'],
      [
        'June arrives at her perfect house with one rule: never sleep with the lights on.',
        'The home assistant repeats a conversation that never happened.',
        'A hidden room changes shape when June says her own name.',
        'The guest list includes someone who has not been invited yet.',
        'A hairline crack spreads across every window at once.',
        'June asks the house the only question it cannot answer.',
      ],
    ),
  },
  {
    id: 'after-midnight',
    title: 'After Midnight',
    eyebrow: 'The city keeps secrets',
    genre: ['Noir', 'Romance'],
    year: '2023',
    rating: '16+',
    episodeCount: 10,
    description: 'A night-shift radio host starts receiving anonymous dedications from a caller who knows exactly where she is.',
    image: posterImages.midnight,
    accent: '#c19bf0',
    episodes: createEpisodes(
      ['The Caller', 'Dead Air', 'Lovers on Line 3', 'The Last Train', 'Static', 'A Voice in the Crowd', 'Night Editor', 'The Song Request', '4:03', 'After Midnight'],
      ['08:21', '07:49', '09:03', '08:37', '08:08', '09:14', '07:55', '08:42', '10:10', '11:06'],
      Array.from({ length: 10 }, (_, index) => `At ${index + 1}:03 a.m., the call becomes a little more personal.`),
    ),
  },
  {
    id: 'borrowed-time',
    title: 'Borrowed Time',
    eyebrow: 'Every second has a price',
    genre: ['Sci-fi', 'Thriller'],
    year: '2024',
    rating: '13+',
    episodeCount: 7,
    description: 'When a broke student finds a watch that adds an hour to her life, she starts spending time she does not own.',
    image: posterImages.borrowed,
    accent: '#e5ad64',
    episodes: createEpisodes(['The Watch', 'One More Hour', 'Interest', 'The Collector', 'A Future Self', 'Overdraft', 'Now'], ['08:05', '08:49', '09:01', '07:48', '09:20', '10:11', '10:34'], []),
  },
  {
    id: 'saints-of-summer',
    title: 'Saints of Summer',
    eyebrow: 'Some summers never end',
    genre: ['Coming of age', 'Romance'],
    year: '2024',
    rating: '13+',
    episodeCount: 5,
    description: 'Four friends make one impossible promise on the last night before everything changes.',
    image: posterImages.saints,
    accent: '#e99d82',
    episodes: createEpisodes(['The Bonfire', 'The Promise', 'Low Tide', 'The Long Way Home', 'August'], ['07:54', '08:13', '09:33', '08:27', '10:02'], []),
  },
  {
    id: 'orbiting-you',
    title: 'Orbiting You',
    eyebrow: 'Love at a distance',
    genre: ['Romance', 'Sci-fi'],
    year: '2024',
    rating: '13+',
    episodeCount: 6,
    description: 'Two people fall in love through a delayed signal between Earth and a station on the far side of the moon.',
    image: posterImages.orbit,
    accent: '#80adc8',
    episodes: createEpisodes(['Signal', 'Lag', 'Two Light Minutes', 'The Dark Side', 'Return Window', 'Orbit'], ['08:40', '07:32', '09:18', '08:55', '09:44', '10:07'], []),
  },
  {
    id: 'the-night-shift',
    title: 'The Night Shift',
    eyebrow: 'Nobody leaves unchanged',
    genre: ['Drama', 'Mystery'],
    year: '2023',
    rating: '16+',
    episodeCount: 8,
    description: 'The staff of a nearly empty hotel discover that every guest checks in with a secret to trade.',
    image: posterImages.after,
    accent: '#d08475',
    episodes: createEpisodes(['Room 204', 'The Bellhop', 'Late Checkout', 'The Empty Floor', 'Housekeeping', 'Do Not Disturb', 'Daylight', 'The Night Shift'], ['08:26', '07:46', '09:02', '08:31', '08:18', '09:47', '08:04', '11:00'], []),
  },
];

type AppContextValue = {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  followingIds: string[];
  toggleFollowing: (id: string) => void;
  isFollowing: (id: string) => boolean;
  miniPlayer: { dramaId: string; episode: number; title: string; source: string; currentTime: number; playing: boolean } | null;
  setMiniPlayer: (player: AppContextValue['miniPlayer']) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};

const AppContext = createContext<AppContextValue | null>(null);

function useAppValue() {
  const context = useContext(AppContext);
  if (!context) throw new Error('VEYRA app context is missing');
  return context;
}

function useT() {
  return useAppValue().t;
}

function Poster({ drama, className = '', showTitle = true }: { drama: Drama; className?: string; showTitle?: boolean }) {
  const style = {
    '--poster-accent': drama.accent,
    backgroundImage: `linear-gradient(180deg, rgba(13,13,22,.05) 25%, rgba(13,13,22,.95) 100%), url("${drama.image}")`,
  } as CSSProperties;
  return (
    <div className={`relative isolate overflow-hidden rounded-[1.1rem] bg-[#20202d] bg-cover bg-center ${className}`} style={style}>
      <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(135deg, ${drama.accent}22, transparent 55%)` }} />
      {showTitle && (
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/55">{drama.eyebrow}</p>
          <p className="mt-1 font-display text-xl leading-[.92] text-white">{drama.title}</p>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" data-testid="link-logo">
      <img src="/veyra-mark.png" alt="VEYRA" className="h-9 w-9 rounded-[11px] object-cover shadow-[0_0_26px_rgba(255,79,195,.28)]" />
      <span className="font-display text-[19px] font-bold tracking-[.16em] text-white transition-colors group-hover:text-[#ff4fc3]">VEYRA</span>
    </Link>
  );
}
function HeaderSearch() {
  const t = useT();
  const [, navigate] = useLocation();
  const [value, setValue] = useState('');
  return (
    <form className="relative hidden sm:block" onSubmit={(event) => { event.preventDefault(); navigate(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search'); }}>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={14} />
      <input value={value} onChange={(event) => setValue(event.target.value)} onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'nearest' })} placeholder={t('Search')} aria-label={t('Search')} className="h-9 w-[9rem] rounded-full border border-white/10 bg-white/[.04] pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/35 focus:border-[#ff4fc3]/60 md:w-[12rem]" />
    </form>
  );
}
function PageFrame({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="grain min-h-[100dvh] bg-[#07080c]">
      <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#07080c]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-[1240px] items-center justify-between px-4 lg:px-7">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-[13px] text-white/65 transition-colors hover:text-white">{t('Home')}</Link>
            <Link href="/for-you" className="text-[13px] text-white/65 transition-colors hover:text-white">{t('For You')}</Link>
            <Link href="/rewards" className="text-[13px] text-white/65 transition-colors hover:text-white">{t('Rewards')}</Link>
            <Link href="/wallet" className="text-[13px] text-white/65 transition-colors hover:text-white">{t('Wallet')}</Link>
            <Link href="/vip" className="text-[13px] font-semibold text-[#ff4fc3] transition-colors hover:text-white">{t('VIP')}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <HeaderSearch />
            <Link href="/search" aria-label={t('Search')} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/65 transition-all hover:border-[#ff4fc3]/50 hover:text-[#ff4fc3] sm:hidden" data-testid="link-search-button"><Search size={16} strokeWidth={2}/></Link>
            <Link href="/saved" aria-label="My List" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/65 transition-all hover:border-[#ff4fc3]/50 hover:text-[#ff4fc3]"><Bookmark size={16}/></Link>
            <Link href="/settings/notifications" aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/65 transition-all hover:border-[#ff4fc3]/50 hover:text-[#ff4fc3]"><Bell size={16}/></Link>
            <Show when="signed-in"><UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} /></Show>
            <Show when="signed-out"><AuthAction className="hidden h-9 rounded-full border border-white/10 px-3 text-xs text-white/70 transition-colors hover:border-[#ff4fc3]/60 hover:text-white sm:block">Sign in</AuthAction></Show>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-6 md:px-7 md:pb-12 md:pt-9">{children}</main>
      <nav className="veyra-bottom-nav glass fixed inset-x-3 bottom-3 z-40 flex h-[3.9rem] items-center justify-around rounded-2xl md:hidden">
        <MobileNavLink href="/" icon={<HomeIcon size={18}/>} label={t('Home')} />
        <MobileNavLink href="/for-you" icon={<Sparkles size={18}/>} label={t('For You')} />
        <MobileNavLink href="/rewards" icon={<Gift size={18}/>} label={t('Rewards')} />
        <MobileNavLink href="/following" icon={<UsersRound size={18}/>} label={t('Following')} />
        <MobileNavLink href="/profile" icon={<UserCircle size={18}/>} label={t('Profile')} />
      </nav>
    </div>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="flex min-w-[4rem] flex-col items-center gap-0.5 text-[10px] text-white/45 transition-colors hover:text-[#ff4fc3]" data-testid={`link-mobile-${label.toLowerCase().replace(' ', '-')}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, href = '/search' }: { eyebrow?: string; title: string; href?: string }) {
  const t = useT();
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {eyebrow && <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t(eyebrow)}</p>}
        <h2 className="mt-1 font-display text-[1.65rem] leading-none tracking-[-.035em] text-[#f7f2ff]">{t(title)}</h2>
      </div>
      <Link href={href} className="group inline-flex items-center gap-1 pb-0.5 text-xs text-white/45 transition-colors hover:text-white" data-testid={`link-see-${title.toLowerCase().replaceAll(' ', '-')}`}>
        {t('See all')} <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function DramaCard({ drama, compact = false, href, stretch = false, searchCard = false }: { drama: Drama; compact?: boolean; href?: string; stretch?: boolean; searchCard?: boolean }) {
  const { isSaved, toggleSaved } = useAppValue();
  const saved = isSaved(drama.id);
  return (
    <article className={`group relative ${stretch ? 'w-full' : `shrink-0 ${compact ? 'w-[146px]' : 'w-[158px] sm:w-[190px]'}`}`} data-testid={`card-drama-${drama.id}`}>
      <Link href={href ?? `/watch/${drama.id}/1`} className="block" data-testid={`link-drama-${drama.id}`}>
        <Poster drama={drama} className={`${searchCard ? 'aspect-[.68]' : compact ? 'aspect-[.69]' : 'aspect-[.72]'} transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl`} />
        <div className={`${searchCard ? 'mt-2 px-0.5' : 'mt-2.5 pr-7'}`}>
          <h3 className={`${searchCard ? 'line-clamp-2 min-h-[2.1rem] text-[13px]' : 'truncate text-[15px]'} font-display leading-[1.05] text-white/90`}>{drama.title}</h3>
          <p className={`${searchCard ? 'mt-1 min-h-[1.8rem] whitespace-normal text-[10px] leading-[1.25]' : 'mt-1 truncate text-[11px]'} text-white/40`}>{drama.genre.join(' · ')} <span className="text-white/20">·</span> {drama.episodeCount} eps</p>
        </div>
      </Link>
      <button
        type="button"
        className={`absolute right-1.5 top-1.5 grid ${searchCard ? 'h-7 w-7' : 'h-8 w-8'} place-items-center rounded-full border backdrop-blur-md transition-all ${saved ? 'border-[#ff4fc3]/50 bg-[#ff4fc3] text-[#171720]' : 'border-white/20 bg-[#111118]/45 text-white/75 hover:border-white/60 hover:text-white'}`}
        onClick={() => toggleSaved(drama.id)}
        aria-label={saved ? `Remove ${drama.title} from My List` : `Save ${drama.title}`}
        data-testid={`button-save-${drama.id}`}
      >
        {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      </button>
    </article>
  );
}

function HomePage() {
  const t = useT();
  const { isSaved, toggleSaved } = useAppValue();
  const { savedIds, followingIds } = useAppValue();
  const featured = dramas[0];
  const saved = isSaved(featured.id);
  const continueWatching = dramas.filter((drama) => {
    const lastEpisode = getLastEpisode(drama.id);
    return lastEpisode > 1 && lastEpisode <= drama.episodeCount;
  }).slice(0, 4);
  const denseRows = [
    dramas.slice(0, 3),
    dramas.slice(3, 6),
    dramas.slice(6, 9),
  ];

  return (
    <div className="animate-rise space-y-8">
      <section className="rounded-[1.2rem] border border-white/[.08] bg-[#1a1c28]/70 p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t('Trending now')}</p>
            <h2 className="mt-1 font-display text-2xl text-white">{t('Fresh picks')}</h2>
          </div>
          <Link href="/discover" className="text-xs text-white/45 hover:text-white">{t('Browse all')}</Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {dramas.slice(0, 9).map((drama) => (
            <Link key={drama.id} href={`/watch/${drama.id}/1`} className="group block" data-testid={`link-home-grid-${drama.id}`}>
              <div className="overflow-hidden rounded-xl border border-white/[.08] bg-[#111118] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-[#ff4fc3]/40">
                <Poster drama={drama} className="aspect-[0.7]" showTitle={false} />
                <div className="p-2">
                  <p className="truncate font-display text-[12px] text-white/90">{drama.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-white/40">{drama.episodeCount} episodes <span className="text-white/20">·</span> Free start</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {continueWatching.length > 0 && (
        <section>
          <SectionHeader eyebrow={t('Pick up where you left off')} title={t('Continue Watching')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {continueWatching.map((drama) => <DramaCard drama={drama} key={drama.id} />)}
          </div>
        </section>
      )}

      {denseRows.map((row, rowIndex) => (
        <section key={`row-${rowIndex}`}>
          <SectionHeader eyebrow={rowIndex === 0 ? 'Curated for you' : rowIndex === 1 ? 'Popular picks' : 'Top rated'} title={rowIndex === 0 ? 'For You' : rowIndex === 1 ? 'Popular' : 'Top Rated'} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
            {row.map((drama) => <DramaCard drama={drama} key={drama.id} />)}
          </div>
        </section>
      ))}

      <section className="rounded-[1.25rem] border border-white/[.08] bg-[#1a1c28]/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t('House picks')}</p>
            <h2 className="mt-1 font-display text-xl text-white">{t('Short stories')}</h2>
          </div>
          <Link href="/search" className="text-xs text-white/45 hover:text-white">{t('Explore all')}</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dramas.slice(0, 6).map((drama) => (
            <Link key={`${drama.id}-quick`} href={`/watch/${drama.id}/1`} className="group block" data-testid={`link-home-quick-${drama.id}`}>
              <div className="overflow-hidden rounded-xl border border-white/[.08] bg-[#111118] group-hover:border-[#ff4fc3]/40">
                <Poster drama={drama} className="aspect-[0.72]" showTitle={false} />
                <div className="p-2.5">
                  <p className="truncate text-[12px] text-white/85">{drama.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EpisodeRow({ drama, episode }: { drama: Drama; episode: Episode }) {
  return (
    <Link href={`/watch/${drama.id}/${episode.number}`} className="group flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.025] p-2.5 transition-all hover:border-white/15 hover:bg-white/[.05]" data-testid={`link-new-episode-${drama.id}`}>
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,15,23,.1), rgba(15,15,23,.65)), url("${drama.image}")` }}>
        <span className="absolute bottom-1.5 left-1.5 rounded bg-[#111118]/80 px-1.5 py-0.5 font-mono-ui text-[9px] text-white/75">EP {episode.number}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] text-white/90">{drama.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-white/40">{episode.title} <span className="text-white/20">·</span> {episode.runtime}</p>
      </div>
      <Play size={15} className="mr-2 text-white/30 transition-colors group-hover:text-[#ff4fc3]" fill="currentColor" />
    </Link>
  );
}

function DramaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isSaved, toggleSaved } = useAppValue();
  const drama = dramas.find((entry) => entry.id === id) ?? dramas[0];
  const saved = isSaved(drama.id);
  const [resumeEpisode, setResumeEpisode] = useState(1);
  const [episodeFilter, setEpisodeFilter] = useState<'All' | 'Free' | 'Locked' | 'Watched' | 'Unwatched'>('All');
  const { isFollowing, toggleFollowing } = useAppValue();
  const t = useT();
  const following = isFollowing(drama.id);

  useEffect(() => {
    setResumeEpisode(Math.min(getLastEpisode(drama.id), drama.episodeCount));
  }, [drama.id, drama.episodeCount]);

  const filteredEpisodes = drama.episodes.filter((episode) => {
    const lastEpisode = getLastEpisode(drama.id);
    const isWatched = episode.number < lastEpisode;
    const isUnwatched = episode.number >= lastEpisode;
    
    switch (episodeFilter) {
      case 'All': return true;
      case 'Free': return episode.number <= 2; // First 2 episodes free
      case 'Locked': return episode.number > 2;
      case 'Watched': return isWatched;
      case 'Unwatched': return isUnwatched;
      default: return true;
    }
  });

  return (
    <div className="animate-rise">
      <button type="button" onClick={() => window.history.length > 1 ? window.history.back() : navigate('/')} className="mb-7 inline-flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white" data-testid="link-detail-back"><ArrowLeft size={15} /> {t('Back')}</button>
      
      {/* Main Drama Info */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#1c1b27]">
        <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `linear-gradient(90deg, #1b1b27 3%, rgba(27,27,39,.82) 46%, rgba(27,27,39,.2)), url("${drama.image}")` }} />
        <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[210px_1fr] md:gap-10 md:p-10">
          <Poster drama={drama} className="aspect-[.72] w-[180px] shadow-2xl sm:w-[210px]" />
          <div className="flex flex-col justify-end">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#ff4fc3]">{drama.eyebrow}</p>
            <h1 className="mt-3 max-w-[560px] font-display text-[3rem] leading-[.88] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.7rem]">{drama.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
              <span className="rounded bg-white/10 px-2 py-1 text-white/75">{drama.rating}</span>
              <span>{drama.year}</span><span className="text-white/20">•</span><span>{drama.episodeCount} episodes</span>
              {drama.genre.map((item) => <span key={item} className="rounded-full border border-white/10 px-2 py-1">{item}</span>)}
            </div>
            <p className="mt-5 max-w-[590px] text-sm leading-relaxed text-white/65">{drama.description}</p>
            
            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/watch/${drama.id}/${resumeEpisode}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff4fc3] px-5 text-sm font-semibold text-[#171720] transition-all hover:bg-[#ff8bdd]" data-testid="link-detail-play">
                <Play size={15} fill="currentColor" /> {resumeEpisode > 1 ? `${t('Continue episode')} ${resumeEpisode}` : t('Play episode 1')}
              </Link>
              <button type="button" onClick={() => toggleSaved(drama.id)} className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-all ${saved ? 'border-[#ff4fc3]/60 bg-[#ff4fc3]/15 text-[#ff4fc3]' : 'border-white/15 bg-white/[.06] text-white/80 hover:border-white/35'}`} aria-label={saved ? 'Remove from My List' : 'Save to My List'} data-testid="button-detail-save">
                {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {saved ? t('In My List') : t('My List')}
              </button>
              <button type="button" onClick={() => toggleFollowing(drama.id)} className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-all ${following ? 'border-[#ff4fc3]/60 bg-[#ff4fc3]/15 text-[#ff4fc3]' : 'border-white/15 bg-white/[.06] text-white/80 hover:border-white/35'}`} aria-label={following ? 'Unfollow' : 'Follow'}>
                {following ? <UsersRound size={16} /> : <UsersRound size={16} />}
                {following ? t('Following status') : t('Follow')}
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[.05] text-white/75 transition-all hover:border-white/40" aria-label="Share">
                <Share2 size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">{t('Runtime')}</p>
          <p className="mt-2 font-display text-xl text-white">{drama.episodeCount * 8} {t('min total')}</p>
          <p className="mt-1 text-xs text-white/40">~8 {t('min per episode')}</p>
        </div>
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">{t('Status')}</p>
          <p className="mt-2 font-display text-xl text-white">{t('Ongoing')}</p>
          <p className="mt-1 text-xs text-white/40">{t('New episodes weekly')}</p>
        </div>
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">{t('Progress')}</p>
          <p className="mt-2 font-display text-xl text-white">{Math.round((resumeEpisode / drama.episodeCount) * 100)}%</p>
          <p className="mt-1 text-xs text-white/40">{resumeEpisode} of {drama.episodeCount} watched</p>
        </div>
      </section>

      {/* Episodes with Filters */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t('Watch in order')}</p>
            <h2 className="mt-1 font-display text-2xl text-white">{t('Episodes')}</h2>
          </div>
          <div className="flex gap-2">
            {(['All', 'Free', 'Locked', 'Watched', 'Unwatched'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setEpisodeFilter(filter)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all ${episodeFilter === filter ? 'border-[#ff4fc3] bg-[#ff4fc3] text-[#171720]' : 'border-white/10 bg-white/[.03] text-white/55 hover:border-white/25 hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-white/[.06] overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.02]">
          {filteredEpisodes.map((episode) => <EpisodeDetailRow drama={drama} episode={episode} key={episode.number} />)}
        </div>
      </section>

      {/* Related Dramas */}
      <section className="mt-10">
        <SectionHeader eyebrow={t('More like this')} title={t('Related dramas')} />
        <div className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5">
          {dramas.filter(d => d.id !== drama.id).slice(0, 5).map((relatedDrama) => <DramaCard drama={relatedDrama} key={relatedDrama.id} />)}
        </div>
      </section>
    </div>
  );
}

function EpisodeDetailRow({ drama, episode }: { drama: Drama; episode: Episode }) {
  const lastEpisode = getLastEpisode(drama.id);
  const isWatched = episode.number < lastEpisode;
  const isLocked = episode.number > 2; // First 2 episodes free
  const isFree = !isLocked;

  return (
    <Link href={`/watch/${drama.id}/${episode.number}`} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[.045] sm:px-5" data-testid={`link-episode-${drama.id}-${episode.number}`}>
      <span className="w-6 font-mono-ui text-[11px] text-white/35">{String(episode.number).padStart(2, '0')}</span>
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-cover bg-center sm:h-16 sm:w-28" style={{ backgroundImage: `linear-gradient(90deg, rgba(20,20,29,.1), rgba(20,20,29,.6)), url("${drama.image}")` }}>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff4fc3] text-[#171720]"><Play size={12} fill="currentColor" /></span></span>
        {isWatched && (
          <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono-ui text-white/80">
            ✓
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 grid place-items-center bg-black/50">
            <Lock size={16} className="text-white/60" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`truncate font-display text-[16px] ${isWatched ? 'text-white/50' : 'text-white/85'} group-hover:text-white`}>{episode.title}</h3>
          {isFree && <span className="rounded-full bg-[#70d59b]/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#70d59b]">FREE</span>}
          {isLocked && <Lock size={12} className="text-white/30" />}
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-white/40">{episode.synopsis}</p>
      </div>
      <div className="hidden items-center gap-1 text-[10px] text-white/35 sm:flex"><Clock3 size={12} /> {episode.runtime}</div>
      <ChevronRight size={15} className="text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-[#ff4fc3]" />
    </Link>
  );
}

function ForYouPage() {
  const { savedIds, followingIds } = useAppValue();
  const feedItems = dramas.filter((drama) => !savedIds.includes(drama.id) && !followingIds.includes(drama.id)).flatMap((drama) => drama.episodes.map((episode) => ({ drama, episode })));
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const active = feedItems[activeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.load();
    void video.play().catch(() => undefined);
  }, [activeIndex, muted]);

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => Math.max(0, Math.min(feedItems.length - 1, current + direction)));
  };

  const share = async () => {
    const url = `${getPublicAppUrl()}/watch/${active.drama.id}/${active.episode.number}`;
    if (navigator.share) await navigator.share({ title: active.drama.title, url }).catch(() => undefined);
    else await navigator.clipboard?.writeText(url).catch(() => undefined);
  };

  return (
    <div className="relative -mx-4 -mt-6 flex min-h-[calc(100dvh-4.25rem)] justify-center bg-black md:-mx-7 md:-mt-9">
      <div
        className="relative aspect-[9/16] h-[calc(100dvh-4.25rem)] max-h-[900px] w-full max-w-[520px] overflow-hidden bg-[#09090d]"
        onTouchStart={(event) => { touchStartYRef.current = event.touches[0]?.clientY ?? null; }}
        onTouchEnd={(event) => {
          const start = touchStartYRef.current;
          touchStartYRef.current = null;
          const end = event.changedTouches[0]?.clientY;
          if (start === null || end === undefined || Math.abs(end - start) < 56) return;
          move(end < start ? 1 : -1);
        }}
      >
        <video
          ref={videoRef}
          key={`${active.drama.id}-${active.episode.number}`}
          className="absolute inset-0 h-full w-full object-cover"
          src={active.episode.videoUrl}
          poster={active.drama.image}
          playsInline
          loop={false}
          muted={muted}
          onEnded={() => move(1)}
          aria-label={`${active.drama.title}, episode ${active.episode.number}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
          <Link href="/" aria-label="Back to Home" className="grid h-9 w-9 place-items-center rounded-full bg-black/35"><ArrowLeft size={16} /></Link>
          <span className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-white/65">For You</span>
          <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute' : 'Mute'} className="grid h-9 w-9 place-items-center rounded-full bg-black/35">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
        </div>
        <div className="absolute bottom-0 inset-x-0 flex items-end gap-4 p-5 pb-7 text-white">
          <div className="min-w-0 flex-1">
            <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">{active.drama.genre.join(' · ')}</p>
            <h1 className="mt-2 font-display text-2xl leading-tight">{active.drama.title}</h1>
            <p className="mt-1 text-xs text-white/65">Episode {active.episode.number} / {active.drama.episodeCount}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">{active.episode.synopsis}</p>
            <Link href={`/watch/${active.drama.id}/${active.episode.number}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff4fc3] px-4 py-2 text-xs font-semibold text-[#171720]"><Play size={13} fill="currentColor" /> Watch episode</Link>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-4">
            <button type="button" onClick={() => setSaved((value) => !value)} aria-label={saved ? 'Remove from My List' : 'Save'} className="grid h-10 w-10 place-items-center rounded-full bg-black/40">{saved ? <BookmarkCheck size={19} className="text-[#ff4fc3]" /> : <Bookmark size={19} />}</button>
            <button type="button" onClick={() => void share()} aria-label="Share" className="grid h-10 w-10 place-items-center rounded-full bg-black/40"><Share2 size={19} /></button>
            <Link href={`/drama/${active.drama.id}`} aria-label="Episodes" className="grid h-10 w-10 place-items-center rounded-full bg-black/40"><CirclePlay size={19} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPage() {
  const t = useT();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [activeGenre, setActiveGenre] = useState(() => new URLSearchParams(window.location.search).get('genre') ?? 'All');
  const [sortBy, setSortBy] = useState<'Popular' | 'Trending' | 'Newest' | 'Top Rated'>('Popular');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const stored = localStorage.getItem('veyra:recent-searches');
    return stored ? JSON.parse(stored) : [];
  });
  
  const genres = ['All', 'Thriller', 'Romance', 'Mystery', 'Drama', 'Sci-fi', 'Noir'];
  const results = useMemo(() => {
    let filtered = dramas.filter((drama) => {
      const matchesQuery = `${drama.title} ${drama.eyebrow} ${drama.genre.join(' ')}`.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = activeGenre === 'All' || drama.genre.includes(activeGenre);
      return matchesQuery && matchesGenre;
    });

    // Sort results
    switch (sortBy) {
      case 'Popular':
        filtered = filtered.sort((a, b) => b.episodeCount - a.episodeCount);
        break;
      case 'Trending':
        filtered = filtered.sort((a, b) => a.featured ? -1 : 1);
        break;
      case 'Newest':
        filtered = filtered.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        break;
      case 'Top Rated':
        filtered = filtered.sort((a, b) => a.rating.localeCompare(b.rating));
        break;
    }

    return filtered;
  }, [activeGenre, query, sortBy]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      const updated = [searchQuery, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('veyra:recent-searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('veyra:recent-searches');
  };

  return (
    <div className="animate-rise">
      <form className="sticky top-[4.25rem] z-30 -mx-4 -mt-6 mb-4 flex items-center gap-2 border-b border-white/[.06] bg-[#07080c]/95 px-4 py-3 backdrop-blur-xl md:-mx-7 md:-mt-9 md:px-7" onSubmit={(event) => { event.preventDefault(); handleSearch(query); }}>
        <Link href="/" aria-label={t('Back')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/60"><ArrowLeft size={16} /></Link>
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={16} />
        <input 
          value={query} 
          onChange={(event) => setQuery(event.target.value)}
          onFocus={(event) => {
            const input = event.currentTarget;
            window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
          }}
          placeholder={t('Search titles, moods, genres...')}
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[.05] pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff4fc3]/60"
          data-testid="input-search" 
        />
        {query && (
          <button 
            type="button" 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        </label>
        <button type="submit" className="h-10 shrink-0 rounded-xl bg-[#ff4fc3] px-4 text-xs font-semibold text-[#171720]">{t('Search')}</button>
      </form>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/45">Recent searches</p>
            <button type="button" onClick={clearRecentSearches} className="text-xs text-white/35 hover:text-white">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => handleSearch(search)}
                className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-white/65 transition-colors hover:border-white/25 hover:text-white"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {!query && <section className="mt-4"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl text-white">{t('Recommended')}</h2><span className="text-xs text-white/40">{dramas.length} {t('stories')}</span></div><div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">{dramas.map((drama) => <DramaCard drama={drama} searchCard stretch href={`/drama/${drama.id}`} key={drama.id} />)}</div></section>}

      {/* Genre Filters */}
      <div className="scrollbar-none -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2">
        {genres.map((genre) => (
          <button 
            key={genre} 
            type="button" 
            onClick={() => setActiveGenre(genre)} 
            className={`shrink-0 rounded-full border px-4 py-2 text-xs transition-all ${activeGenre === genre ? 'border-[#ff4fc3] bg-[#ff4fc3] text-[#171720]' : 'border-white/10 bg-white/[.03] text-white/55 hover:border-white/25 hover:text-white'}`} 
            data-testid={`button-genre-${genre.toLowerCase()}`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="mt-6 flex items-center gap-3">
        <p className="text-xs text-white/45">Sort by:</p>
        {(['Popular', 'Trending', 'Newest', 'Top Rated'] as const).map((sort) => (
          <button
            key={sort}
            type="button"
            onClick={() => setSortBy(sort)}
            className={`text-xs transition-colors ${sortBy === sort ? 'text-[#ff4fc3] font-semibold' : 'text-white/45 hover:text-white'}`}
          >
            {sort}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">
            {query || activeGenre !== 'All' ? `${results.length} ${t('stories found')}` : t('The full collection')}
          </h2>
        </div>
        {results.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
            {results.map((drama) => <DramaCard drama={drama} searchCard stretch href={`/drama/${drama.id}`} key={drama.id} />)}
          </div>
        ) : (
          <EmptySearch onReset={() => { setQuery(''); setActiveGenre('All'); }} />
        )}
      </div>
    </div>
  );
}

function EmptySearch({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-5 py-16 text-center">
      <Search size={22} className="mx-auto text-white/30" />
      <h3 className="mt-4 font-display text-xl text-white">No stories in that frequency</h3>
      <p className="mt-2 text-sm text-white/40">Try a different title, genre, or let the night surprise you.</p>
      <button type="button" onClick={onReset} className="mt-5 text-xs font-semibold text-[#ff4fc3] hover:text-white" data-testid="button-reset-search">Clear search</button>
    </div>
  );
}

function DiscoverPage() {
  const t = useT();
  const genres = [
    'Romance', 'Mystery', 'Thriller', 'Revenge', 'CEO', 'Billionaire',
    'Mafia', 'Fantasy', 'Rebirth', 'Time Travel', 'Hidden Identity',
    'Family Secrets', 'Werewolf', 'Monster', 'Dragon', 'Action', 'Drama'
  ];
  
  const tropes = [
    'Fake Marriage', 'Contract Marriage', 'Secret Baby', 'Hidden Heir',
    'Second Chance', 'Enemies to Lovers', 'Revenge', 'Betrayal',
    'Forbidden Love', 'Secret Identity', 'Time Loop', 'Rebirth'
  ];

  const categories = [
    { name: 'Popular', dramas: dramas.slice(0, 5) },
    { name: 'Trending', dramas: dramas.slice(1, 6) },
    { name: 'New', dramas: dramas.slice(0, 5) },
    { name: 'Top Rated', dramas: dramas.slice(2, 7) },
  ];

  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Explore the collection</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.2rem]">{t('Discover')}<span className="text-[#ff4fc3]">.</span></h1>
        <p className="mt-4 text-sm text-white/45">Find your next favorite story by genre, trope, or category.</p>
      </div>

      {/* Categories */}
      <section className="mb-12">
        <SectionHeader eyebrow={t('Browse by')} title={t('Categories')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link 
              key={category.name}
              href={`/search?sort=${category.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.02] p-6 transition-all hover:border-[#ff4fc3]/40 hover:bg-white/[.05]"
            >
              <h3 className="font-display text-xl text-white group-hover:text-[#ff4fc3]">{category.name}</h3>
              <p className="mt-2 text-xs text-white/40">{category.dramas.length} stories</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Genres */}
      <section className="mb-12">
        <SectionHeader eyebrow={t('Browse by mood')} title={t('Genres')} />
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/search?genre=${genre.toLowerCase()}`}
              className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-sm text-white/65 transition-colors hover:border-[#ff4fc3]/50 hover:text-white"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      {/* Tropes */}
      <section className="mb-12">
        <SectionHeader eyebrow={t('Story elements')} title={t('Tropes')} />
        <div className="flex flex-wrap gap-2">
          {tropes.map((trope) => (
            <Link
              key={trope}
              href={`/search?trope=${trope.toLowerCase().replace(' ', '-')}`}
              className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-sm text-white/65 transition-colors hover:border-[#ff4fc3]/50 hover:text-white"
            >
              {trope}
            </Link>
          ))}
        </div>
      </section>

      {/* Ranking */}
      <section className="mb-12">
        <SectionHeader eyebrow="Top charts" title="Ranking" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
            <h3 className="font-display text-lg text-white">Today's Top 10</h3>
            <div className="mt-4 space-y-3">
              {dramas.slice(0, 10).map((drama, index) => (
                <Link
                  key={drama.id}
                  href={`/drama/${drama.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[.05]"
                >
                  <span className="font-mono-ui text-lg font-bold text-[#ff4fc3]">{index + 1}</span>
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${drama.image}")` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/90">{drama.title}</p>
                    <p className="text-xs text-white/40">{drama.genre.join(' · ')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
            <h3 className="font-display text-lg text-white">This Week's Rising</h3>
            <div className="mt-4 space-y-3">
              {dramas.slice(3, 13).map((drama, index) => (
                <Link
                  key={drama.id}
                  href={`/drama/${drama.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[.05]"
                >
                  <span className="font-mono-ui text-lg font-bold text-[#b78cff]">{index + 1}</span>
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${drama.image}")` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/90">{drama.title}</p>
                    <p className="text-xs text-white/40">{drama.genre.join(' · ')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SavedPage() {
  const { savedIds, toggleSaved } = useAppValue();
  const t = useT();
  const [filter, setFilter] = useState<'All' | 'Watching' | 'Completed' | 'Downloaded'>('All');
  const savedDramas = dramas.filter((drama) => savedIds.includes(drama.id));
  
  const filteredDramas = savedDramas.filter((drama) => {
    const lastEpisode = getLastEpisode(drama.id);
    const isWatching = lastEpisode > 1 && lastEpisode < drama.episodeCount;
    const isCompleted = lastEpisode >= drama.episodeCount;
    
    switch (filter) {
      case 'All': return true;
      case 'Watching': return isWatching;
      case 'Completed': return isCompleted;
      case 'Downloaded': return hasDownloadedEpisode(drama.id);
      default: return true;
    }
  });

  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your VEYRA collection</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.2rem]">{t('My List')}<span className="text-[#ff4fc3]">.</span></h1>
        <p className="mt-4 text-sm text-white/45">{savedDramas.length ? `${savedDramas.length} stories waiting for you` : 'Save something for a later night.'}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['All', 'Watching', 'Completed', 'Downloaded'] as const).map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            onClick={() => setFilter(filterOption)}
            className={`rounded-full border px-4 py-2 text-xs transition-all ${
              filter === filterOption 
                ? 'border-[#ff4fc3] bg-[#ff4fc3] text-[#171720]' 
                : 'border-white/10 bg-white/[.03] text-white/55 hover:border-white/25 hover:text-white'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Drama Grid */}
      {filteredDramas.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredDramas.map((drama) => (
            <div key={drama.id} className="group relative">
              <DramaCard drama={drama} />
              <button
                type="button"
                onClick={() => toggleSaved(drama.id)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 opacity-0 transition-all group-hover:opacity-100"
                aria-label="Remove from My List"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-8 text-center">
          <Bookmark size={24} className="mx-auto text-white/30" />
          <p className="mt-3 text-sm text-white/40">No stories in this filter</p>
          <button type="button" onClick={() => setFilter('All')} className="mt-4 text-xs font-semibold text-[#ff4fc3] hover:text-white">
            View all
          </button>
        </div>
      )}
    </div>
  );
}

function FollowingPage() {
  const { followingIds } = useAppValue();
  const t = useT();
  const [filter, setFilter] = useState<'All' | 'Watching' | 'Completed' | 'Downloaded'>('All');
  const following = dramas.filter((drama) => followingIds.includes(drama.id));

  const filteredFollowing = following.filter((drama) => {
    const lastEpisode = getLastEpisode(drama.id);
    const isWatching = lastEpisode > 1 && lastEpisode < drama.episodeCount;
    const isCompleted = lastEpisode >= drama.episodeCount;
    
    switch (filter) {
      case 'All': return true;
      case 'Watching': return isWatching;
      case 'Completed': return isCompleted;
      case 'Downloaded': return hasDownloadedEpisode(drama.id);
      default: return true;
    }
  });

  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your watch circle</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.2rem]">{t('Following')}<span className="text-[#ff4fc3]">.</span></h1>
        <p className="mt-4 text-sm text-white/45">{following.length} stories in your circle</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['All', 'Watching', 'Completed', 'Downloaded'] as const).map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            onClick={() => setFilter(filterOption)}
            className={`rounded-full border px-4 py-2 text-xs transition-all ${
              filter === filterOption 
                ? 'border-[#ff4fc3] bg-[#ff4fc3] text-[#171720]' 
                : 'border-white/10 bg-white/[.03] text-white/55 hover:border-white/25 hover:text-white'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Drama Grid */}
      {filteredFollowing.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredFollowing.map((drama) => <DramaCard drama={drama} key={drama.id} />)}
        </div>
      ) : (
        <EmptySaved />
      )}
    </div>
  );
}

function RewardsPage() {
  const t = useT();
  const [status, setStatus] = useState<'loading' | 'signed-out' | 'ready'>('loading');
  const [coinBalance, setCoinBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [checkInData, setCheckInData] = useState<{ day: number; claimed: boolean; reward: number }[]>([]);
  const [missions, setMissions] = useState<Array<{ id: number; name: string; description: string; target: number; progress: number; reward: number; completed: boolean }>>([]);
  const [bonusHistory, setBonusHistory] = useState<Array<{ date: string; reward: string; amount: number; source: string }>>([]);
  const [message, setMessage] = useState('');
  
  // Initialize data from localStorage or API
  useEffect(() => {
    const storedBalance = Number(localStorage.getItem('veyra:coins') ?? 0);
    const storedStreak = Number(localStorage.getItem('veyra:streak') ?? 0);
    const storedCheckIn = JSON.parse(localStorage.getItem('veyra:checkin') ?? '[]');
    const storedMissions = JSON.parse(localStorage.getItem('veyra:missions') ?? '[]');
    const storedHistory = JSON.parse(localStorage.getItem('veyra:bonus-history') ?? '[]');
    
    setCoinBalance(storedBalance);
    setStreak(storedStreak);
    
    // Initialize check-in data if empty
    if (storedCheckIn.length === 0) {
      const initialCheckIn = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        claimed: false,
        reward: (i + 1) * 10 + 20
      }));
      setCheckInData(initialCheckIn);
      localStorage.setItem('veyra:checkin', JSON.stringify(initialCheckIn));
    } else {
      setCheckInData(storedCheckIn);
    }
    
    // Initialize missions if empty
    if (storedMissions.length === 0) {
      const initialMissions = [
        { id: 1, name: t('Watch 3 Episodes'), description: t('Watch 3 complete episodes'), target: 3, progress: 0, reward: 50, completed: false },
        { id: 2, name: t('Daily Login'), description: t('Log in for 7 consecutive days'), target: 7, progress: storedStreak, reward: 100, completed: storedStreak >= 7 },
        { id: 3, name: t('Follow 5 Dramas'), description: t('Add 5 dramas to your list'), target: 5, progress: 0, reward: 30, completed: false },
        { id: 4, name: t('Share a Drama'), description: t('Share a drama with friends'), target: 1, progress: 0, reward: 20, completed: false },
      ];
      setMissions(initialMissions);
      localStorage.setItem('veyra:missions', JSON.stringify(initialMissions));
    } else {
      setMissions(storedMissions);
    }
    
    setBonusHistory(storedHistory);
    setStatus('ready');
  }, []);

  const claimDailyCheckIn = (day: number) => {
    const updated = checkInData.map(item => 
      item.day === day ? { ...item, claimed: true } : item
    );
    setCheckInData(updated);
    localStorage.setItem('veyra:checkin', JSON.stringify(updated));
    
    const reward = updated.find(item => item.day === day)?.reward ?? 0;
    const newBalance = coinBalance + reward;
    setCoinBalance(newBalance);
    localStorage.setItem('veyra:coins', String(newBalance));
    
    // Update streak
    const newStreak = day > streak ? day : streak;
    setStreak(newStreak);
    localStorage.setItem('veyra:streak', String(newStreak));
    
    // Add to history
    const newHistory = [{ date: new Date().toISOString(), reward: 'Daily Check-in', amount: reward, source: 'Streak' }, ...bonusHistory];
    setBonusHistory(newHistory);
    localStorage.setItem('veyra:bonus-history', JSON.stringify(newHistory));
    
    setMessage(`+${reward} ${t('coins added to your wallet')}`);
  };

  const completeMission = (missionId: number) => {
    const updated = missions.map(mission =>
      mission.id === missionId ? { ...mission, completed: true, progress: mission.target } : mission
    );
    setMissions(updated);
    localStorage.setItem('veyra:missions', JSON.stringify(updated));
    
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      const newBalance = coinBalance + mission.reward;
      setCoinBalance(newBalance);
      localStorage.setItem('veyra:coins', String(newBalance));
      
      const newHistory = [{ date: new Date().toISOString(), reward: mission.name, amount: mission.reward, source: 'Mission' }, ...bonusHistory];
      setBonusHistory(newHistory);
      localStorage.setItem('veyra:bonus-history', JSON.stringify(newHistory));
      
      setMessage(`+${mission.reward} ${t('coins for completing')} ${mission.name}`);
    }
  };

  const watchAndEarn = () => {
    const reward = 10;
    const newBalance = coinBalance + reward;
    setCoinBalance(newBalance);
    localStorage.setItem('veyra:coins', String(newBalance));
    
    const newHistory = [{ date: new Date().toISOString(), reward: 'Watch & Earn', amount: reward, source: 'Video' }, ...bonusHistory];
    setBonusHistory(newHistory);
    localStorage.setItem('veyra:bonus-history', JSON.stringify(newHistory));
    
    setMessage(`+${reward} ${t('coins for watching')}`);
  };

  if (status === 'signed-out') return <AuthPrompt title="Rewards are waiting" copy="Sign in to collect coins, complete missions, and keep your balance across devices." />;

  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#b78cff]">Your VEYRA wallet</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.2rem]">{t('Rewards')}<span className="text-[#b78cff]">.</span></h1>
        <p className="mt-4 text-sm text-white/45">{t('Watch, return, and unlock more stories.')}</p>
      </div>
      
      {message && (
        <div className="mb-5 rounded-xl border border-[#b78cff]/30 bg-[#b78cff]/10 px-4 py-3 text-sm text-[#f5d68c]">
          {message}
        </div>
      )}

      {/* Coin Balance */}
      <div className="mb-8 rounded-[1.5rem] border border-white/[.08] bg-gradient-to-br from-[#b78cff]/20 via-[#ff4fc3]/10 to-transparent p-6">
        <p className="text-[10px] uppercase tracking-[.2em] text-white/45">{t('Current balance')}</p>
        <div className="mt-2 flex items-center gap-2 font-display text-4xl text-white">
          <Coins size={30} className="text-[#b78cff]" />
          {coinBalance}
        </div>
      </div>

      {/* 7-Day Streak */}
      <section className="mb-8">
        <SectionHeader eyebrow={t('Daily rewards')} title={t('7-Day Streak')} />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const day = i + 1;
            const item = checkInData[i] || { day, claimed: false, reward: day * 10 + 20 };
            const isToday = day === streak + 1;
            const isPast = day <= streak;
            
            return (
              <button
                key={day}
                type="button"
                onClick={() => isToday && !item.claimed && claimDailyCheckIn(day)}
                disabled={!isToday || item.claimed}
                className={`relative overflow-hidden rounded-xl border p-3 text-center transition-all ${
                  item.claimed 
                    ? 'border-[#70d59b]/50 bg-[#70d59b]/20 text-[#70d59b]' 
                    : isToday 
                      ? 'border-[#ff4fc3]/50 bg-[#ff4fc3]/20 text-white hover:border-[#ff4fc3]' 
                      : 'border-white/10 bg-white/[.02] text-white/30'
                }`}
              >
                <p className="font-mono-ui text-[10px]">{t('Day')} {day}</p>
                <p className="mt-1 font-display text-lg">{item.reward}</p>
                <p className="mt-1 text-[9px]">{t('coins')}</p>
                {item.claimed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#70d59b]/30">
                    <Check size={20} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Watch & Earn */}
      <section className="mb-8">
        <SectionHeader eyebrow={t('Quick rewards')} title={t('Watch & Earn')} />
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={watchAndEarn}
            className="flex items-center justify-between rounded-xl border border-white/[.08] bg-white/[.03] p-4 text-left transition-colors hover:border-[#ff4fc3]/40"
          >
            <div>
              <p className="font-display text-lg text-white/90">{t('Watch Episode')}</p>
              <p className="mt-1 text-xs text-white/40">{t('Watch a complete episode to earn coins')}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-[#b78cff]">+10</p>
              <p className="text-[10px] text-white/30">{t('coins')}</p>
            </div>
          </button>
          <div className="flex items-center justify-between rounded-xl border border-white/[.08] bg-white/[.03] p-4">
            <div>
              <p className="font-display text-lg text-white/90">{t('Ad Boost')}</p>
              <p className="mt-1 text-xs text-white/40">{t('Watch an ad for bonus coins')}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-[#b78cff]">+25</p>
              <p className="text-[10px] text-white/30">{t('coins')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Missions */}
      <section className="mb-8">
        <SectionHeader eyebrow={t('Complete tasks')} title={t('Missions')} />
        <div className="space-y-3">
          {missions.length > 0 ? missions.map((mission) => (
            <div key={mission.id} className="flex items-center justify-between rounded-xl border border-white/[.08] bg-white/[.03] p-4">
              <div className="flex-1">
                <p className="font-display text-lg text-white/90">{t(mission.name)}</p>
                <p className="mt-1 text-xs text-white/40">{t(mission.description)}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div 
                    className="h-full rounded-full bg-[#ff4fc3] transition-all" 
                    style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-white/30">{mission.progress}/{mission.target}</p>
              </div>
              <div className="ml-4 text-right">
                <p className="font-display text-lg text-[#b78cff]">+{mission.reward}</p>
                {!mission.completed && mission.progress >= mission.target && (
                  <button
                    type="button"
                    onClick={() => completeMission(mission.id)}
                    className="mt-1 rounded-full bg-[#ff4fc3] px-3 py-1 text-[10px] font-semibold text-[#171720]"
                  >
                    {t('Claim')}
                  </button>
                )}
                {mission.completed && (
                  <p className="mt-1 text-[10px] text-[#70d59b]">{t('Completed')}</p>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[.02] p-8 text-center">
              <Gift size={24} className="mx-auto text-white/30" />
              <p className="mt-3 text-sm text-white/40">{t('Missions will appear here soon')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Bonus History */}
      <section className="mb-8">
        <SectionHeader eyebrow={t('Your earnings')} title={t('Bonus History')} />
        <div className="space-y-2">
          {bonusHistory.length > 0 ? bonusHistory.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border border-white/[.06] bg-white/[.02] p-3">
              <div>
                <p className="text-sm text-white/90">{item.reward}</p>
                <p className="text-[10px] text-white/30">{t(item.source)} · {new Date(item.date).toLocaleDateString()}</p>
              </div>
              <p className="font-mono-ui text-sm text-[#b78cff]">+{item.amount}</p>
            </div>
          )) : (
            <p className="text-sm text-white/40">{t('No bonus history yet. Start earning!')}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfilePage() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { savedIds } = useAppValue();
  const t = useT();
  const [watchHistory, setWatchHistory] = useState<Array<{ dramaId: string; episode: number; date: string }>>(() => {
    const stored = localStorage.getItem('veyra:watch-history');
    return stored ? JSON.parse(stored) : [];
  });
  
  const profileSections = [
    { icon: <Bookmark size={18} />, label: t('My List'), value: String(savedIds.length), href: '/saved' },
    { icon: <UsersRound size={18} />, label: t('Following'), value: t('View all'), href: '/following' },
    { icon: <Clock3 size={18} />, label: t('Watch History'), value: `${watchHistory.length} ${t('Episodes').toLowerCase()}`, href: '/history' },
    { icon: <Download size={18} />, label: t('Downloads'), value: t('View library'), href: '/downloads' },
    { icon: <Gift size={18} />, label: t('Rewards'), value: t('Collect coins'), href: '/rewards' },
    { icon: <Wallet size={18} />, label: t('Wallet'), value: t('View balance'), href: '/wallet' },
    { icon: <Sparkles size={18} />, label: t('VIP'), value: t('Unlock all'), href: '/vip' },
  ];

  const settingsSections = [
    { icon: <Bell size={18} />, label: t('Notifications'), href: '/settings/notifications' },
    { icon: <Languages size={18} />, label: t('Language'), href: '/settings/language' },
    { icon: <Settings size={18} />, label: t('Settings'), href: '/settings' },
    { icon: <Share2 size={18} />, label: t('Referral / Invite'), href: '/referral' },
    { icon: <ShieldCheck size={18} />, label: t('Help / FAQ'), href: '/help' },
    { icon: <Upload size={18} />, label: t('Feedback'), href: '/feedback' },
    { icon: <Lock size={18} />, label: t('Privacy'), href: '/privacy' },
    { icon: <FileText size={18} />, label: t('Terms'), href: '/terms' },
  ];

  return (
    <div className="animate-rise">
      {/* Profile Header */}
      <div className="mb-9 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#ff4fc3]/15 text-[#ff4fc3]">
          <UserCircle size={30} />
        </div>
        <div>
          <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t('Your profile')}</p>
          <h1 className="mt-1 font-display text-3xl text-white">{user?.firstName ?? user?.username ?? t('Guest viewer')}</h1>
          <p className="mt-1 text-xs text-white/40">{user?.primaryEmailAddress?.emailAddress ?? t('Guest account · local data only')}</p>
          <p className="mt-1 font-mono-ui text-[10px] text-white/30">UID: {user?.id ?? 'guest-local'}</p>
        </div>
        <Link href="/profile/edit" className="ml-auto rounded-full border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#ff4fc3]/50 hover:text-white">{t('Edit Profile')}</Link>
      </div>

      {!isSignedIn && (
        <section className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-[#ff4fc3]/25 bg-[#ff4fc3]/[.06] p-5">
          <div><p className="font-display text-lg text-white">{t('Sync your VEYRA profile')}</p><p className="mt-1 text-xs text-white/50">{t('Sign in to keep My List, Following, history and rewards across devices.')}</p></div>
          <AuthAction className="shrink-0 rounded-full bg-[#ff4fc3] px-4 py-2 text-xs font-semibold text-[#171720]">{authConfigured ? t('Sign in') : t('Auth unavailable')}</AuthAction>
        </section>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {profileSections.map((section) => (
          <Link key={section.label} href={section.href}>
            <div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4 transition-colors hover:border-white/20">
              <div className="flex items-center gap-2 text-[#ff4fc3]">
                {section.icon}
                <p className="text-xs text-white/40">{section.label}</p>
              </div>
              <p className="mt-2 font-display text-xl text-white/90">{section.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {settingsSections.map((section) => (
          <Link key={section.label} href={section.href} className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.02] p-4 text-sm text-white/65 transition-colors hover:border-white/20 hover:text-white">
            {section.icon}
            {section.label}
          </Link>
        ))}
      </div>

      {/* Account Info */}
      <section className="mb-8 rounded-2xl border border-white/[.08] bg-white/[.02] p-6">
        <h3 className="font-display text-lg text-white">{t('Account Information')}</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/[.06]">
            <span className="text-sm text-white/60">{t('Username')}</span>
            <span className="text-sm text-white/90">{user?.username ?? t('Not set')}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[.06]">
            <span className="text-sm text-white/60">{t('Email')}</span>
            <span className="text-sm text-white/90">{user?.primaryEmailAddress?.emailAddress ?? t('Not set')}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[.06]">
            <span className="text-sm text-white/60">{t('Provider')}</span>
            <span className="text-sm text-white/90">{user?.externalAccounts?.[0]?.provider ?? t('Email')}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/60">{t('Member since')}</span>
            <span className="text-sm text-white/90">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('Recent')}</span>
          </div>
        </div>
      </section>

      {/* My List Preview */}
      <section className="mb-8">
        <SectionHeader eyebrow="Saved for later" title="My List" href="/saved" />
        {savedIds.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {dramas.filter((drama) => savedIds.includes(drama.id)).slice(0, 5).map((drama) => (
              <DramaCard drama={drama} key={drama.id} />
            ))}
          </div>
        ) : (
          <EmptySaved />
        )}
      </section>

      {/* Watch History Preview */}
      <section className="mb-8">
        <SectionHeader eyebrow="Recently watched" title="Watch History" href="/history" />
        {watchHistory.length > 0 ? (
          <div className="space-y-2">
            {watchHistory.slice(0, 5).map((item, index) => {
              const drama = dramas.find(d => d.id === item.dramaId);
              if (!drama) return null;
              return (
                <Link key={index} href={`/watch/${item.dramaId}/${item.episode}`} className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3 transition-colors hover:bg-white/[.05]">
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${drama.image}")` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/90">{drama.title}</p>
                    <p className="text-xs text-white/40">Episode {item.episode} · {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[.02] p-8 text-center">
            <Clock3 size={24} className="mx-auto text-white/30" />
            <p className="mt-3 text-sm text-white/40">No watch history yet</p>
          </div>
        )}
      </section>

      {/* Sign Out */}
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h3 className="font-display text-lg text-red-400">{t('Danger Zone')}</h3>
        <p className="mt-2 text-sm text-white/40">{t('These actions are irreversible. Please be certain.')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10">
            Delete Account
          </button>
          <button type="button" onClick={() => void signOut()} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white">
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

function ProfileStat({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = <div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4"><p className="text-xs text-white/40">{label}</p><p className="mt-2 font-display text-xl text-white/90">{value}</p></div>;
  return href ? <Link href={href}>{content}</Link> : content;
}

function AuthPrompt({ title, copy }: { title: string; copy: string }) {
  return <div className="mx-auto max-w-xl rounded-[1.5rem] border border-white/[.08] bg-white/[.03] px-6 py-16 text-center"><UserCircle size={28} className="mx-auto text-[#ff4fc3]" /><h1 className="mt-5 font-display text-3xl text-white">{title}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/45">{copy}</p><AuthAction className="mt-7 rounded-full bg-[#ff4fc3] px-5 py-3 text-sm font-semibold text-[#171720]">{authConfigured ? 'Sign in to continue' : 'Authentication is not configured'}</AuthAction></div>;
}

function AdminPage() {
  const { isSignedIn } = useUser();
  const [data, setData] = useState<{ users: number; series: number; episodes: number; events: number; revenueMinor: number } | null>(null);
  const [error, setError] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const { uploadFile, isUploading, progress } = useUpload({ onSuccess: (response) => setUploadNote(`Uploaded ${response.metadata.name} to ${response.objectPath}`), onError: (uploadError) => setUploadNote(uploadError.message) });
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/admin/overview', { credentials: 'include' }).then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error ?? 'Admin access denied'); setData(body); }).catch((reason: Error) => setError(reason.message));
  }, [isSignedIn]);
  if (!isSignedIn) return <AuthPrompt title="VEYRA Console" copy="This is a protected administration area. Sign in with an authorized admin account." />;
  return <div className="animate-rise"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Protected workspace</p><h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff]">Admin Console<span className="text-[#ff4fc3]">.</span></h1></div><span className="inline-flex items-center gap-2 rounded-full border border-[#76b7bd]/30 bg-[#76b7bd]/10 px-3 py-2 text-xs text-[#a9d6d8]"><ShieldCheck size={14} /> Server protected</span></div>{error ? <div className="rounded-xl border border-[#ff4fc3]/30 bg-[#ff4fc3]/10 px-4 py-3 text-sm text-[#ffb2a3]">{error}</div> : <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[['Users', data?.users ?? '—'], ['Series', data?.series ?? '—'], ['Episodes', data?.episodes ?? '—'], ['Events', data?.events ?? '—'], ['Revenue', data ? `$${(data.revenueMinor / 100).toFixed(2)}` : '—']].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4"><p className="text-xs text-white/40">{label}</p><p className="mt-2 font-display text-2xl text-white">{value}</p></div>)}</div><div className="mt-8 grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><div className="flex items-center gap-2"><Library size={16} className="text-[#ff4fc3]" /><h2 className="font-display text-xl text-white">Catalog operations</h2></div><p className="mt-3 text-sm leading-relaxed text-white/45">Series, episode, media, user, transaction, monetization, reward, and analytics endpoints are now available under the protected admin API.</p><div className="mt-5 grid grid-cols-2 gap-2 text-xs text-white/55"><span className="rounded-lg bg-white/[.04] px-3 py-2">Catalog CRUD surface</span><span className="rounded-lg bg-white/[.04] px-3 py-2">User moderation</span><span className="rounded-lg bg-white/[.04] px-3 py-2">Coin ledger review</span><span className="rounded-lg bg-white/[.04] px-3 py-2">Analytics summary</span></div></section><section className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><div className="flex items-center gap-2"><Upload size={16} className="text-[#b78cff]" /><h2 className="font-display text-xl text-white">Media intake</h2></div><p className="mt-3 text-sm leading-relaxed text-white/45">Uploads use a server-issued presigned URL. No storage credentials are exposed to the browser.</p><label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/[.025] px-3 py-3 text-xs text-white/65 hover:border-[#b78cff]/50"><span>{isUploading ? `Uploading ${progress}%` : 'Choose MP4, HLS manifest, image, or subtitle'}</span><input type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); }} /></label>{uploadNote && <p className="mt-3 text-xs text-[#a9d6d8]">{uploadNote}</p>}</section></div></>}</div>;
}

function EmptySaved() {
  return (
    <div className="relative overflow-hidden rounded-[1.4rem] border border-white/[.08] bg-[#181a25] px-6 py-16 text-center">
      <div className="absolute left-1/2 top-[-80px] h-52 w-52 -translate-x-1/2 rounded-full bg-[#ff4fc3]/10 blur-3xl" />
      <div className="relative">
        <Bookmark size={24} className="mx-auto text-[#ff4fc3]" />
        <h2 className="mt-5 font-display text-2xl text-white">Nothing saved yet</h2>
        <p className="mx-auto mt-2 max-w-[290px] text-sm leading-relaxed text-white/40">The best stories are the ones you cannot stop thinking about. Keep a few close.</p>
        <Link href="/search" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#ff4fc3] px-5 text-xs font-semibold text-[#171720]" data-testid="link-empty-browse">Browse dramas <ChevronRight size={14} /></Link>
      </div>
    </div>
  );
}

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

const CONTROLS_AUTO_HIDE_MS = 3200;
const PROGRESS_SAVE_INTERVAL_SECONDS = 3;
const VIP_QUALITY = '1080p';

const formatTimestamp = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const describeVideoError = (code?: number) => {
  switch (code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return 'Playback was interrupted. Tap try again to resume.';
    case MediaError.MEDIA_ERR_NETWORK:
      return 'A network problem interrupted the stream. Check your connection and retry.';
    case MediaError.MEDIA_ERR_DECODE:
      return 'This episode could not be decoded on this device.';
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'This video format is not supported on this device.';
    default:
      return 'The episode could not be loaded right now.';
  }
};

function WatchPage() {
  const { dramaId, episode: episodeParam } = useParams<{ dramaId: string; episode: string }>();
  const [, navigate] = useLocation();
  const drama = dramas.find((entry) => entry.id === dramaId) ?? dramas[0];
  const { setMiniPlayer } = useAppValue();
  const t = useT();
  const selectedNumber = Math.max(1, Number(episodeParam) || 1);
  const episodeIndex = Math.min(selectedNumber - 1, drama.episodes.length - 1);
  const episode = drama.episodes[episodeIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const resumePositionRef = useRef(0);
  const lastSavedRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const progressKey = `veyra:progress:${drama.id}:${episode.number}`;
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [episodeFinished, setEpisodeFinished] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsNonce, setControlsNonce] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>('720p');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isVip, setIsVip] = useState<boolean>(() => localStorage.getItem('veyra:vip') === 'true');
  const touchStartYRef = useRef<number | null>(null);
  const playingRef = useRef(false);
  const fullscreenRef = useRef(false);
  const nextEpisode = drama.episodes[episodeIndex + 1];
  const previousEpisode = drama.episodes[episodeIndex - 1];

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { fullscreenRef.current = isFullscreen; }, [isFullscreen]);
  useEffect(() => () => {
    const video = videoRef.current;
    if (video && playingRef.current && !fullscreenRef.current && !window.location.pathname.includes('/watch/')) {
      setMiniPlayer({ dramaId: drama.id, episode: episode.number, title: `${drama.title} · Episode ${episode.number}`, source: video.currentSrc || episode.videoUrl, currentTime: video.currentTime, playing: true });
    }
  }, []);

  // --- bölüm değişince durumu sıfırla + kaldığı yeriyi hatırla ---
  useEffect(() => {
    const storedProgress = Number(localStorage.getItem(progressKey) ?? 0);
    resumePositionRef.current = Number.isFinite(storedProgress) ? storedProgress : 0;
    lastSavedRef.current = 0;
    localStorage.setItem(`veyra:last-episode:${drama.id}`, String(episode.number));
    setProgress(0);
    setDuration(0);
    setCurrentTime(0);
    setEpisodeFinished(false);
    setPlaying(false);
    setBuffering(true);
    setLoadError(null);
    setControlsVisible(true);
    const available = (['540p', '720p', '1080p'] as VideoQuality[]).filter((option) => Boolean(episode.videoSources[option]));
    const nextQuality = available.includes(quality) ? quality : (available[0] ?? '720p');
    setQuality(nextQuality);
    const history = JSON.parse(localStorage.getItem('veyra:watch-history') ?? '[]') as Array<{ dramaId: string; episode: number; date: string }>;
    const nextHistory = [{ dramaId: drama.id, episode: episode.number, date: new Date().toISOString() }, ...history.filter((entry) => !(entry.dramaId === drama.id && entry.episode === episode.number))].slice(0, 50);
    localStorage.setItem('veyra:watch-history', JSON.stringify(nextHistory));
  }, [progressKey, drama.id, episode.number]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const frame = window.requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [drama.id, episode.number]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const availableQualities = (['540p', '720p', '1080p'] as VideoQuality[]).filter((option) => Boolean(episode.videoSources[option]));
    const selectedQuality = availableQualities.includes(quality) ? quality : (availableQualities[0] ?? '720p');
    const source = episode.videoSources[selectedQuality] ?? episode.videoUrl;
    if (video.src.endsWith(source)) return;
    const position = video.currentTime;
    const wasPlaying = !video.paused;
    video.src = source;
    video.load();
    video.addEventListener('loadedmetadata', () => {
      if (position > 0 && Number.isFinite(position)) video.currentTime = position;
      if (wasPlaying) void video.play().catch(() => undefined);
    }, { once: true });
  }, [episode.videoSources, episode.videoUrl, quality]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [episode.number, playbackRate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || loadError) return;
      setBuffering(true);
      void video.play().catch(() => setPlaying(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [drama.id, episode.number]);

  const saveProgress = (seconds: number) => {
    if (Number.isFinite(seconds) && seconds > 0) {
      lastSavedRef.current = seconds;
      localStorage.setItem(progressKey, String(seconds));
    }
  };

  /** Kontrolleri gösterir ve otomatik gizleme sayacını sıfırlar. */
  const pokeControls = () => {
    setControlsVisible(true);
    setControlsNonce((current) => current + 1);
  };

  // --- ekran uyanık kalsın (Screen Wake Lock; desteklenmeyen tarayıcıda sessizce atlanır) ---
  useEffect(() => {
    if (!playing) {
      wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
      return;
    }
    let cancelled = false;
    const request = () => {
      const navigatorWithWakeLock = navigator as WakeLockNavigator;
      if (!navigatorWithWakeLock.wakeLock) return;
      navigatorWithWakeLock.wakeLock
        .request('screen')
        .then((sentinel) => {
          if (cancelled) sentinel.release().catch(() => undefined);
          else wakeLockRef.current = sentinel;
        })
        .catch(() => undefined);
    };
    request();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
    };
  }, [playing]);

  // --- kontroller: oynatırken bir süre sonra kendiliğinden gizlenir ---
  useEffect(() => {
    if (!playing || !controlsVisible) return;
    const timer = window.setTimeout(() => setControlsVisible(false), CONTROLS_AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [playing, controlsVisible, controlsNonce]);

  // --- bölüm bittiğinde bir sonraki bölüme doğrudan geç ---
  useEffect(() => {
    if (!episodeFinished) return;
    if (!nextEpisode) return;
    const timer = window.setTimeout(() => {
      navigateEpisode(nextEpisode.number);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [episodeFinished, nextEpisode, navigate]);

  // --- fullscreen durumunu takip et (tarayıcı + Escape) ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleNativeEnter = () => setIsFullscreen(true);
    const handleNativeExit = () => setIsFullscreen(false);
    const handleNativeBack = () => {
      if (isFullscreen) void handleFullscreen();
      else navigate(`/drama/${drama.id}`, { replace: true });
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('veyra-fullscreen-enter', handleNativeEnter);
    window.addEventListener('veyra-fullscreen-exit', handleNativeExit);
    window.addEventListener('veyra-native-back', handleNativeBack);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('veyra-fullscreen-enter', handleNativeEnter);
      window.removeEventListener('veyra-fullscreen-exit', handleNativeExit);
      window.removeEventListener('veyra-native-back', handleNativeBack);
    };
  }, [drama.id, isFullscreen, navigate]);

  useEffect(() => {
    document.body.classList.toggle('veyra-fullscreen-active', isFullscreen);
    return () => document.body.classList.remove('veyra-fullscreen-active');
  }, [isFullscreen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) void handleFullscreen();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  // --- sekme kapanırken ilerlemeyi kaybetme ---
  useEffect(() => {
    const flush = () => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.currentTime) && video.currentTime > 0) saveProgress(video.currentTime);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressKey]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setCurrentTime(video.currentTime);
    const resumePosition = resumePositionRef.current;
    if (resumePosition > 0 && resumePosition < video.duration - 2) {
      video.currentTime = resumePosition;
      setCurrentTime(resumePosition);
      setProgress((resumePosition / video.duration) * 100);
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video || loadError) return;
    if (video.paused) {
      setBuffering(true);
      try {
        await video.play();
      } catch {
        setPlaying(false);
        setBuffering(false);
      }
    } else {
      video.pause();
    }
  };

  // Yüzeye dokunma: duraklatılmışsa oynatır, oynuyorsa kontrolleri aç/kapa.
  const handleSurfaceClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, [data-player-ui]')) return;
    if (loadError || episodeFinished) return;
    if (!playing) {
      pokeControls();
      void togglePlay();
      return;
    }
    setControlsVisible((current) => !current);
  };

  const navigateEpisode = (nextNumber: number) => {
    if (nextNumber < 1 || nextNumber > drama.episodes.length) return;
    navigate(`/watch/${drama.id}/${nextNumber}`, { replace: true });
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const startY = touchStartYRef.current;
    touchStartYRef.current = null;
    const endY = event.changedTouches[0]?.clientY;
    if (startY === null || endY === undefined || Math.abs(endY - startY) < 56) return;
    navigateEpisode(episode.number + (endY < startY ? 1 : -1));
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = (value / 100) * duration;
    setProgress(value);
    setCurrentTime(video.currentTime);
    saveProgress(video.currentTime);
    pokeControls();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setCurrentTime(video.currentTime);
    setProgress((video.currentTime / video.duration) * 100);
    if (Math.abs(video.currentTime - lastSavedRef.current) >= PROGRESS_SAVE_INTERVAL_SECONDS) {
      saveProgress(video.currentTime);
    }
  };

  const handleFullscreen = async () => {
    pokeControls();
    const frame = frameRef.current;
    const video = videoRef.current;
    if (isFullscreen) {
      setIsFullscreen(false);
      window.VeyraNative?.setFullscreen?.(false);
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch {
        // Native Android fullscreen may already be handling the exit.
      }
      const legacyVideo = video as (HTMLVideoElement & { webkitExitFullscreen?: () => void }) | null;
      legacyVideo?.webkitExitFullscreen?.();
      return;
    }

    setIsFullscreen(true);
    if (window.VeyraNative?.setFullscreen) {
      window.VeyraNative.setFullscreen(true);
      return;
    }
    try {
      if (frame?.requestFullscreen) {
        await frame.requestFullscreen();
      }
    } catch {
      // Keep the app-level immersive layout even when WebView fullscreen is unavailable.
    }
  };

  const selectQuality = (nextQuality: VideoQuality) => {
    if (nextQuality === VIP_QUALITY && !isVip) {
      setQualityOpen(false);
      setMoreOpen(false);
      return;
    }
    if (!episode.videoSources[nextQuality]) return;
    setQuality(nextQuality);
    setQualityOpen(false);
    setMoreOpen(false);
  };

  const setSpeed = (next: number) => {
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
    setSpeedOpen(false);
    pokeControls();
  };
  const shareEpisode = async () => {
    try {
      const url = `${getPublicAppUrl()}${window.location.pathname}`;
      if (window.VeyraNative?.share) {
        window.VeyraNative.share(`${drama.title} — Episode ${episode.number}`, url);
      } else if (navigator.share) {
        await navigator.share({ title: `${drama.title} — Episode ${episode.number}`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      // User cancelled or clipboard not available - silently ignore
    }
    setMoreOpen(false);
  };

  const downloadEpisode = async () => {
    try {
      const fileName = `${drama.id}-episode-${episode.number}.mp4`;
      if (window.VeyraNative?.download) {
        window.VeyraNative.download(episode.videoUrl, fileName);
      } else {
        const response = await fetch(episode.videoUrl);
        if (!response.ok) throw new Error('Download request failed');
        const blobUrl = URL.createObjectURL(await response.blob());
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      // Download failed - silently ignore
    }
    setMoreOpen(false);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(100);
    setCurrentTime(duration);
    setControlsVisible(true);
    saveProgress(duration || 0);
    if (nextEpisode) {
      navigateEpisode(nextEpisode.number);
      return;
    }
    setEpisodeFinished(true);
  };

  const handleRetry = () => {
    const video = videoRef.current;
    if (!video) return;
    setLoadError(null);
    setBuffering(true);
    setEpisodeFinished(false);
    video.load();
    void video.play().catch(() => setPlaying(false));
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    setEpisodeFinished(false);
    video.currentTime = 0;
    setProgress(0);
    saveProgress(0);
    void togglePlay();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    pokeControls();
  };

  const showControls = controlsVisible || !playing;
  const activeCaption = episode.captions.find((caption) => caption.language === 'en' && currentTime >= caption.start && currentTime <= caption.end);
  const timeLabel = duration > 0 ? `${formatTimestamp(currentTime)} / ${formatTimestamp(duration)}` : episode.runtime;

  return (
    <div className={`grain min-h-[100dvh] bg-[#0d0d13] text-white ${isFullscreen ? 'veyra-player-fullscreen-root' : ''}`}>
      <div className="mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col lg:flex-row">
        <section
          ref={playerRef}
          className={`${isFullscreen ? 'fixed inset-0 z-[9999] m-0 h-[100dvh] w-screen max-w-none bg-black' : 'relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden bg-black lg:min-h-[100dvh]'}`}
          data-testid="player-surface"
        >
          {/* 9:16 dikey sahne: mobilde tam ekran, desktop'ta ortalanmış dikey çerçeve */}
          <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-black">
            <div
              ref={frameRef}
              className="veyra-stage relative overflow-hidden bg-black"
              onClick={handleSurfaceClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onPointerMove={(event) => {
                if (event.pointerType === 'mouse' && playing) pokeControls();
              }}
            >
              <video
                key={`${drama.id}-${episode.number}`}
                ref={videoRef}
                className="absolute inset-0 h-full w-full bg-[#09090d] object-cover"
                src={episode.videoSources[quality] ?? episode.videoUrl}
                poster={drama.image}
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => {
                  playingRef.current = true;
                  setPlaying(true);
                  setEpisodeFinished(false);
                }}
                onPause={() => {
                  playingRef.current = false;
                  setPlaying(false);
                  if (videoRef.current) saveProgress(videoRef.current.currentTime);
                }}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => {
                  setBuffering(false);
                  setLoadError(null);
                }}
                onCanPlay={() => setBuffering(false)}
                onEnded={handleEnded}
                onError={(event) => {
                  const video = event.currentTarget;
                  setBuffering(false);
                  setPlaying(false);
                  setLoadError(describeVideoError(video.error?.code));
                }}
                aria-label={`${drama.title}, episode ${episode.number}: ${episode.title}`}
              />

              {/* okunabilirlik gradyanı — kontroller gizliyken de alt bölge hafif karartılır */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(9,9,13,.72),transparent)]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(9,9,13,.94),rgba(9,9,13,.45)_55%,transparent)]" />

              {/* yükleme göstergesi */}
              {buffering && !loadError && !episodeFinished && (
                <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-[#ff4fc3]" aria-hidden="true" />
                    <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-white/50">{t('Loading episode')}</span>
                  </div>
                </div>
              )}

              {/* hata durumu */}
              {loadError && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-[#0d0d13]/88 px-6 backdrop-blur-sm">
                  <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111118]/92 p-6 text-center shadow-2xl" data-testid="player-error-card">
                    <AlertTriangle size={26} className="mx-auto text-[#ff4fc3]" />
                    <h3 className="mt-3 font-display text-xl">{t('Playback failed')}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">{loadError}</p>
                    <div className="mt-5 flex items-center justify-center gap-2">
                      <button type="button" onClick={handleRetry} className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4fc3] px-4 py-2 text-xs font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]" data-testid="button-player-retry">
                        <RotateCw size={13} /> {t('Try again')}
                      </button>
                      <Link href={`/drama/${drama.id}`} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white">Back to story</Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TEK play/pause kontrolü */}
              <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
                <button
                  type="button"
                  onClick={() => {
                    pokeControls();
                    void togglePlay();
                  }}
                  className={`grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-[#111118]/45 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#ff4fc3] hover:text-[#ff4fc3] ${playing && !controlsVisible ? 'pointer-events-none scale-90 opacity-0' : 'pointer-events-auto opacity-100'}`}
                  aria-label={playing ? 'Pause episode' : 'Play episode'}
                  data-testid="button-player-toggle"
                >
                  {playing ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" className="translate-x-0.5" />}
                </button>
              </div>

              {/* üst çubuk — kontrollerle birlikte açılıp kapanır, notch güvenli */}
              <div className={`veyra-safe-top absolute inset-x-0 top-0 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                  <Link href={`/drama/${drama.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/25 transition-colors hover:border-white/50" aria-label="Back to drama" data-testid="link-player-back"><ArrowLeft size={16} /></Link>
                  <div className={`min-w-0 px-3 text-center ${isFullscreen ? 'invisible' : ''}`}>
                    <p className="truncate font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/50">{drama.title}</p>
                    <p className="mt-1 truncate text-xs text-white/85">Episode {episode.number} <span className="text-white/30">·</span> {episode.title}</p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                            setMoreOpen((v) => !v);
                            setSpeedOpen(false);
                        pokeControls();
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/25 text-white/75 transition-colors hover:border-white/50"
                      aria-label="More options"
                      data-testid="button-player-more"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {moreOpen && !speedOpen && !qualityOpen && (
                      <div
                        data-player-ui
                        className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#111118]/95 p-1 shadow-2xl backdrop-blur-xl"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareEpisode();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"
                        >
                          <Share2 size={14} />
                          {t('Share')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadEpisode();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"
                        >
                          <Download size={14} />
                          {t('Download')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpeedOpen(true);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"
                        >
                          <span className="flex items-center gap-3">
                            <Zap size={14} />
                            {t('Speed')}
                          </span>
                          <span className="text-white/45">{playbackRate}x</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQualityOpen(true);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"
                        >
                          <span className="flex items-center gap-3">
                            <SlidersHorizontal size={14} />
                            {t('Quality')}
                          </span>
                          <span className="text-white/45">{quality}</span>
                        </button>
                      </div>
                    )}
                    {moreOpen && speedOpen && (
                      <div data-player-ui className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#111118]/95 p-1 shadow-2xl backdrop-blur-xl">
                        <button type="button" onClick={() => setSpeedOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-white/60 hover:bg-white/[.06]">
                          <ArrowLeft size={14} />
                          {t('Playback speed')}
                        </button>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button key={speed} type="button" onClick={() => setSpeed(speed)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06] ${speed === playbackRate ? 'text-[#ff4fc3]' : 'text-white/85'}`}>
                            <span>{speed.toFixed(2).replace(/0$/, '')}x</span>
                            {speed === playbackRate && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                    {moreOpen && qualityOpen && (
                      <div data-player-ui className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#111118]/95 p-1 shadow-2xl backdrop-blur-xl">
                        <button type="button" onClick={() => setQualityOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-white/60 hover:bg-white/[.06]">
                          <ArrowLeft size={14} />
                          {t('Video quality')}
                        </button>
                        {(['540p', '720p', '1080p'] as VideoQuality[]).map((option) => {
                          const available = Boolean(episode.videoSources[option]);
                          const locked = option === VIP_QUALITY && !isVip;
                          const disabled = !available || locked;
                          return (
                            <button key={option} type="button" disabled={disabled} onClick={() => selectQuality(option)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs ${disabled ? 'cursor-not-allowed text-white/25' : 'text-white/85 hover:bg-white/[.06]'}`}>
                              <span>{locked ? `${option} · ${t('VIP')}` : option}</span>
                              <span className="flex items-center gap-1.5">
                                {disabled && <span className="text-[9px]">{locked ? t('VIP locked') : t('Unavailable')}</span>}
                                {!disabled && option === quality && <Check size={14} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* alt bölge: altyazı (güvenli alan) + açılır kontroller + bölüm bilgisi */}
              <div className="veyra-safe-bottom absolute inset-x-0 bottom-0 z-30">
                <div className="px-4 pb-3 pt-14 sm:px-6">
                  {activeCaption && (
                    <div className="pointer-events-none mb-3 flex justify-center" aria-live="polite" data-testid="player-caption">
                      <div className="max-w-[88%] rounded-md bg-black/55 px-3 py-1.5 text-center text-sm leading-snug text-white shadow-lg backdrop-blur-sm">
                        {activeCaption.text}
                        <span className="ml-2 font-mono-ui text-[9px] uppercase tracking-[.16em] text-white/45">{activeCaption.language}</span>
                      </div>
                    </div>
                  )}

                  <div className={`overflow-hidden transition-all duration-300 ${showControls ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex items-center gap-3" data-player-ui="controls">
                      <input type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => handleSeek(Number(event.target.value))} className="h-1 min-w-0 flex-1 accent-[#ff4fc3]" aria-label="Episode progress" data-testid="input-player-progress" />
                      <span className="shrink-0 font-mono-ui text-[10px] tabular-nums text-white/55">{timeLabel}</span>
                      <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="shrink-0 text-white/70 transition-colors hover:text-white" data-testid="button-player-mute">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                      <button type="button" onClick={() => void handleFullscreen()} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} className="shrink-0 text-white/70 transition-colors hover:text-white" data-testid="button-player-fullscreen">{isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
                    </div>
                  </div>

                  {/* Hide episode title, description, and prev/next buttons when fullscreen is active */}
                  {!isFullscreen && (
                    <>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-display text-lg leading-tight sm:text-xl">{episode.title}</p>
                          <p className="mt-1 line-clamp-2 max-w-[430px] text-[11px] leading-relaxed text-white/55">{episode.synopsis}</p>
                        </div>
                        <span className="shrink-0 font-mono-ui text-[10px] text-white/35">{episode.number} / {drama.episodeCount}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                        {previousEpisode ? <Link href={`/watch/${drama.id}/${previousEpisode.number}`} className="text-white/45 transition-colors hover:text-white" data-testid="link-player-previous-mobile">{t('Previous episode')}</Link> : <span className="text-white/15">{t('First episode')}</span>}
                        {nextEpisode ? <Link href={`/watch/${drama.id}/${nextEpisode.number}`} className="inline-flex items-center gap-1 rounded-full bg-[#ff4fc3] px-4 py-2 font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]" data-testid="link-player-next-mobile">{t('Next Episode')} <ChevronRight size={13} /></Link> : <span className="text-white/35">{episodeFinished ? t('End of story') : t('Continue Watching')}</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* desktop meta — dikey çerçevenin altında (mobilde overlay zaten gösteriyor) */}
          {!isFullscreen && (
            <div className="hidden shrink-0 border-t border-white/[.06] bg-[#0d0d13] px-8 py-5 lg:block">
              <p className="max-w-[560px] font-display text-2xl leading-[.95]">{episode.title}</p>
              <p className="mt-2 max-w-[540px] text-xs leading-relaxed text-white/55">{episode.synopsis}</p>
            </div>
          )}
        </section>
        <aside className={`${isFullscreen ? 'hidden' : 'w-full border-t border-white/[.08] bg-[#111118] lg:w-[350px] lg:border-l lg:border-t-0'}`}>
          <div className="flex items-center justify-between border-b border-white/[.08] px-5 py-5">
            <div><p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">Now watching</p><h2 className="mt-1 font-display text-xl">{drama.title}</h2></div>
            <span className="font-mono-ui text-[10px] text-white/35">{episode.number} / {drama.episodeCount}</span>
          </div>
          <div className="scrollbar-none max-h-[330px] overflow-y-auto p-3 lg:max-h-[calc(100vh-100px)]">
            {drama.episodes.map((entry) => (
              <Link href={`/watch/${drama.id}/${entry.number}`} key={entry.number} className={`group flex items-center gap-3 rounded-xl p-2.5 transition-colors ${entry.number === episode.number ? 'bg-[#ff4fc3]/12' : 'hover:bg-white/[.05]'}`} data-testid={`link-player-episode-${entry.number}`}>
                <div className="relative h-12 w-[76px] shrink-0 overflow-hidden rounded-lg bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,10,16,.1), rgba(10,10,16,.7)), url("${drama.image}")` }}>
                  <span className={`absolute inset-0 grid place-items-center ${entry.number === episode.number ? 'text-[#ff4fc3]' : 'text-white/0 group-hover:text-white'}`}><CirclePlay size={20} /></span>
                </div>
                <div className="min-w-0"><p className={`truncate text-xs font-medium ${entry.number === episode.number ? 'text-[#ff4fc3]' : 'text-white/75'}`}>{String(entry.number).padStart(2, '0')} <span className="ml-1 text-white/25">·</span> {entry.title}</p><p className="mt-1 text-[10px] text-white/35">{entry.runtime}</p></div>
              </Link>
            ))}
          </div>
          <div className="hidden border-t border-white/[.08] px-5 py-4 lg:block">
            <div className="flex items-center justify-between text-xs">
              {previousEpisode ? <Link href={`/watch/${drama.id}/${previousEpisode.number}`} className="text-white/45 hover:text-white" data-testid="link-player-previous">{t('Previous episode')}</Link> : <span className="text-white/15">{t('Previous episode')}</span>}
              {nextEpisode ? <Link href={`/watch/${drama.id}/${nextEpisode.number}`} className="inline-flex items-center gap-1 text-[#ff4fc3] hover:text-white" data-testid="link-player-next">{t('Next episode')} <ChevronRight size={13} /></Link> : <span className="text-white/15">{t('End of story')}</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


function WalletPage() {
  const t = useT();
  const [balance, setBalance] = useState<number>(() => Number(localStorage.getItem('veyra:coins') ?? 0));
  const [transactionHistory, setTransactionHistory] = useState<Array<{ date: string; type: string; amount: number; description: string }>>(() => {
    const stored = localStorage.getItem('veyra:transactions');
    return stored ? JSON.parse(stored) : [];
  });
  const [unlockHistory, setUnlockHistory] = useState<Array<{ date: string; drama: string; episode: number; cost: number }>>(() => {
    const stored = localStorage.getItem('veyra:unlocks');
    return stored ? JSON.parse(stored) : [];
  });
  const [checkoutMessage, setCheckoutMessage] = useState('');
  
  useEffect(() => {
    const h = () => setBalance(Number(localStorage.getItem('veyra:coins') ?? 0));
    window.addEventListener('veyra:coins', h);
    return () => window.removeEventListener('veyra:coins', h);
  }, []);

  const coinPacks = [
    { coins: '700', bonus: '+35', price: '$4.99', bonusPercent: '5%' },
    { coins: '1,200', bonus: '+200', price: '$8.99', bonusPercent: '17%' },
    { coins: '2,500', bonus: '+500', price: '$17.99', bonusPercent: '20%' },
    { coins: '5,000', bonus: '+1,250', price: '$32.99', bonusPercent: '25%' },
  ];

  const purchaseCoins = async (pack: typeof coinPacks[0]) => {
    setCheckoutMessage('Connecting to the payment provider…');
    try {
      const response = await fetch('/api/payments/checkout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'coins', pack: pack.coins }) });
      const body = await response.json().catch(() => ({}));
      setCheckoutMessage(response.ok ? 'Checkout started. Coins are added only after verified payment.' : body.reason ?? body.error ?? 'Coin checkout is currently unavailable.');
    } catch {
      setCheckoutMessage('Coin checkout is currently unavailable.');
    }
  };

  return (
    <div className="animate-rise">
      <div className="mb-8">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t('Your wallet')}</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-white sm:text-[4rem]">{t('Coins')}<span className="text-[#ff4fc3]">.</span></h1>
        <p className="mt-3 text-sm text-white/45">Unlock more episodes and keep watching without interruption.</p>
      </div>

      {/* Current Balance */}
      <div className="mb-8 rounded-[1.5rem] border border-white/[.08] bg-gradient-to-br from-[#ff4fc3]/20 via-[#9f7cff]/10 to-transparent p-6">
        <p className="text-[10px] uppercase tracking-[.2em] text-white/45">{t('Current balance')}</p>
        <div className="mt-2 flex items-center gap-2 font-display text-4xl text-white">
          <Coins size={30} className="text-[#ff4fc3]" />
          {balance}
        </div>
      </div>

      {/* Coin Packs */}
      <section className="mb-8">
        <SectionHeader eyebrow="Top up" title="Coin packs" href="/wallet" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {coinPacks.map((pack) => (
            <button
              key={pack.coins}
              type="button"
              onClick={() => purchaseCoins(pack)}
              className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5 text-left transition hover:border-[#ff4fc3]/40"
            >
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-[#ff4fc3]" />
                <span className="font-display text-2xl">{pack.coins}</span>
              </div>
              <p className="mt-1 text-xs text-[#70d59b]">Bonus {pack.bonus}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/40">{pack.bonusPercent} bonus</span>
                <span className="rounded-full bg-[#ff4fc3] px-3 py-1.5 text-[11px] font-bold text-black">{pack.price}</span>
              </div>
            </button>
          ))}
        </div>
        {checkoutMessage && <p className="mt-3 text-xs text-white/50">{checkoutMessage}</p>}
      </section>

      {/* Transaction History */}
      <section className="mb-8">
        <SectionHeader eyebrow="Your activity" title="Transaction history" />
        <div className="space-y-2">
          {transactionHistory.length > 0 ? transactionHistory.slice(0, 10).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border border-white/[.06] bg-white/[.02] p-3">
              <div>
                <p className="text-sm text-white/90">{transaction.type}</p>
                <p className="text-[10px] text-white/30">{transaction.description} · {new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <p className="font-mono-ui text-sm text-[#70d59b]">+{transaction.amount}</p>
            </div>
          )) : (
            <p className="text-sm text-white/40">No transactions yet. Purchase coins to get started!</p>
          )}
        </div>
      </section>

      {/* Unlock History */}
      <section className="mb-8">
        <SectionHeader eyebrow="Spending" title="Unlock history" />
        <div className="space-y-2">
          {unlockHistory.length > 0 ? unlockHistory.slice(0, 10).map((unlock, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border border-white/[.06] bg-white/[.02] p-3">
              <div>
                <p className="text-sm text-white/90">{unlock.drama}</p>
                <p className="text-[10px] text-white/30">Episode {unlock.episode} · {new Date(unlock.date).toLocaleDateString()}</p>
              </div>
              <p className="font-mono-ui text-sm text-[#ff4fc3]">-{unlock.cost}</p>
            </div>
          )) : (
            <p className="text-sm text-white/40">No unlocks yet. Episodes 1-2 are free!</p>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <p className="font-semibold text-white/90">Payment methods</p>
          <p className="mt-2 text-xs leading-relaxed text-white/35">Google Play Billing integration ready for production deployment.</p>
        </div>
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <p className="font-semibold text-white/90">Reward history</p>
          <p className="mt-2 text-xs leading-relaxed text-white/35">View your daily check-ins, missions, and bonus earnings.</p>
        </div>
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <p className="font-semibold text-white/90">VIP benefits</p>
          <p className="mt-2 text-xs leading-relaxed text-white/35">Upgrade to VIP for exclusive rewards and unlimited access.</p>
        </div>
      </section>
    </div>
  );
}

function VipPage() {
  const [selectedPlan, setSelectedPlan] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [checkoutState, setCheckoutState] = useState('');
  
  const plans = [
    { 
      name: 'Weekly', 
      price: '$9.99',
      productId: 'veyra_vip_weekly',
      label: 'Flexible',
      period: 'week',
      benefits: ['Ad-free viewing', '720p quality', 'Daily VIP reward', 'Skip wait times']
    },
    { 
      name: 'Monthly', 
      price: '$29.99',
      productId: 'veyra_vip_monthly',
      label: 'Most popular',
      period: 'month',
      originalPrice: '$15.99',
      savings: '19%',
      benefits: ['Ad-free viewing', '1080p quality', 'Daily VIP reward', 'Auto-unlock episodes', 'Exclusive content', 'Priority support']
    },
    { 
      name: 'Yearly', 
      price: '$239.99',
      productId: 'veyra_vip_yearly',
      label: 'Best value',
      period: 'year',
      originalPrice: '$155.88',
      savings: '68%',
    benefits: ['All Monthly benefits', 'Exclusive VIP events', 'Early access to new releases', 'Custom profile badge']
    }
  ];

  const selectedPlanData = plans.find(p => p.name === selectedPlan);

  return (
    <div className="animate-rise">
      <div className="mb-8 text-center">
        <Sparkles className="mx-auto text-[#ff4fc3]" size={22} />
        <p className="mt-3 font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA VIP</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-white sm:text-[4rem]">Unlock every story<span className="text-[#ff4fc3]">.</span></h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-white/45">Ad-free viewing, 1080p quality, daily rewards and automatic episode unlocks.</p>
      </div>

      {/* Plan Selection */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <button
            key={plan.name}
            type="button"
            onClick={() => setSelectedPlan(plan.name as any)}
            className={`rounded-[1.5rem] border p-6 text-left transition-all ${
              selectedPlan === plan.name 
                ? 'border-[#ff4fc3]/70 bg-[#ff4fc3]/[.06]' 
                : 'border-white/[.08] bg-white/[.025] hover:border-white/20'
            }`}
          >
            <span className="rounded-full bg-white/[.06] px-2.5 py-1 text-[9px] uppercase tracking-[.12em] text-white/45">
              {plan.label}
            </span>
            <h2 className="mt-5 font-display text-xl">{plan.name}</h2>
            <div className="mt-2">
              {plan.originalPrice && (
                <p className="text-xs text-white/30 line-through">{plan.originalPrice}</p>
              )}
              <p className="font-display text-3xl">{plan.price}<span className="text-sm text-white/40">/{plan.period}</span></p>
              {plan.savings && (
                <p className="mt-1 text-xs text-[#70d59b]">Save {plan.savings}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Plan Details */}
      {selectedPlanData && (
        <section className="mb-8 rounded-2xl border border-white/[.08] bg-white/[.02] p-6">
          <h3 className="font-display text-2xl text-white">{selectedPlanData.name} Plan Benefits</h3>
          <ul className="mt-4 space-y-3">
            {selectedPlanData.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-white/80">
                <Check size={16} className="text-[#70d59b]" />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Total due today</p>
              <p className="font-display text-2xl text-white">{selectedPlanData.price}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                setCheckoutState('Connecting to the payment provider…');
                try {
                  const response = await fetch('/api/payments/checkout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: selectedPlanData.productId }) });
                  const body = await response.json().catch(() => ({}));
                  setCheckoutState(response.ok ? 'Checkout started. Complete payment to activate VIP.' : body.reason ?? body.error ?? 'Checkout is currently unavailable.');
                } catch {
                  setCheckoutState('Checkout is currently unavailable.');
                }
              }}
              className="rounded-full bg-[#ff4fc3] px-6 py-3 text-sm font-bold text-[#171720] transition-colors hover:bg-[#ff8bdd]"
            >
              Subscribe to {selectedPlanData.name}
            </button>
          </div>
          {checkoutState && <p className="mt-4 text-xs text-white/50">{checkoutState}</p>}
        </section>
      )}

      {/* Benefit Comparison */}
      <section className="mb-8">
        <SectionHeader eyebrow="Compare plans" title="Benefits" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[.08]">
                <th className="pb-3 text-xs text-white/40">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.name} className="pb-3 text-center text-xs text-white/40">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {['Ad-free viewing', '720p quality', '1080p quality', 'Daily VIP reward', 'Auto-unlock episodes', 'Exclusive content', 'Priority support', 'Early access', 'Custom badge'].map((feature) => (
                <tr key={feature} className="border-b border-white/[.06]">
                  <td className="py-3 text-white/80">{feature}</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="py-3 text-center">
                      {plan.benefits.includes(feature) ? (
                        <Check size={16} className="mx-auto text-[#70d59b]" />
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-6">
        <h3 className="font-display text-xl text-white">Frequently Asked Questions</h3>
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-semibold text-white/90">Can I cancel anytime?</p>
            <p className="mt-1 text-sm text-white/40">Yes, you can cancel your subscription at any time. Your benefits will continue until the end of the current billing period.</p>
          </div>
          <div>
            <p className="font-semibold text-white/90">What payment methods are accepted?</p>
            <p className="mt-1 text-sm text-white/40">We accept Google Play payments, credit cards, and other local payment methods depending on your region.</p>
          </div>
          <div>
            <p className="font-semibold text-white/90">Is there a free trial?</p>
            <p className="mt-1 text-sm text-white/40">New subscribers get a 7-day free trial on the Monthly plan. No credit card required to start.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LanguagePage(){
  const langs: Locale[] = ['English','Türkçe','Español','Português','Français','Deutsch','Bahasa Indonesia','日本語','繁體中文','简体中文','한국어','ภาษาไทย','Italiano','Melayu','العربية','Tiếng Việt','हिन्दी'];
  const { locale, setLocale } = useAppValue();
  const t = useT();
  return <SimpleSettingsPage title="Language" icon={<Languages size={18}/>}><div className="grid grid-cols-2 gap-2">{langs.map((language) => <button key={language} type="button" onClick={() => setLocale(language)} aria-pressed={locale === language} className={`rounded-xl border p-3 text-left text-xs ${locale === language ? 'border-[#ff4fc3] bg-[#ff4fc3]/10 text-white' : 'border-white/[.08] bg-white/[.02] text-white/65'}`}>{language}</button>)}</div><p className="mt-4 text-xs text-white/40">{t('Selected language is saved on this device. Video audio tracks remain unchanged unless a real alternate track exists.')}</p></SimpleSettingsPage>;
}

function HistoryPage() {
  const t = useT();
  const history = JSON.parse(localStorage.getItem('veyra:watch-history') ?? '[]') as Array<{ dramaId: string; episode: number; date: string }>;
  return (
    <div className="animate-rise">
      <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45"><ArrowLeft size={14} /> {t('Back to Profile')}</Link>
      <div className="mt-7"><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{t('Your viewing trail')}</p><h1 className="mt-1 font-display text-3xl">{t('Watch History')}</h1></div>
      <div className="mt-7 space-y-2">
        {history.length ? history.map((entry) => {
          const drama = dramas.find((item) => item.id === entry.dramaId);
          const episode = drama?.episodes.find((item) => item.number === entry.episode);
          if (!drama || !episode) return null;
          return <Link key={`${entry.dramaId}-${entry.episode}`} href={`/watch/${drama.id}/${episode.number}`} className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.02] p-3 hover:bg-white/[.05]"><div className="h-14 w-24 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${drama.image}")` }} /><div className="min-w-0 flex-1"><p className="truncate font-display text-sm text-white/90">{drama.title}</p><p className="mt-1 truncate text-xs text-white/45">{t('Episode')} {episode.number}: {episode.title}</p></div><ChevronRight size={15} className="text-white/30" /></Link>;
        }) : <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">{t('Your watched episodes will appear here.')}</div>}
      </div>
    </div>
  );
}

function EditProfilePage() {
  const { user } = useUser();
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('veyra:display-name') ?? user?.firstName ?? user?.username ?? 'VEYRA viewer');
  const [saved, setSaved] = useState(false);
  return <div className="animate-rise max-w-xl"><Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45"><ArrowLeft size={14} /> Back to Profile</Link><div className="mt-7"><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your identity</p><h1 className="mt-1 font-display text-3xl">Edit Profile</h1></div><div className="mt-7 space-y-4 rounded-2xl border border-white/[.08] bg-white/[.02] p-5"><label className="block text-xs text-white/50">Display name<input value={displayName} onChange={(event) => { setDisplayName(event.target.value); setSaved(false); }} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 text-sm text-white outline-none focus:border-[#ff4fc3]/60" /></label><p className="text-xs text-white/35">UID: {user?.id ?? 'guest-local'}</p><button type="button" onClick={() => { localStorage.setItem('veyra:display-name', displayName.trim() || 'VEYRA viewer'); setSaved(true); }} className="rounded-full bg-[#ff4fc3] px-4 py-2 text-xs font-semibold text-[#171720]">Save profile</button>{saved && <p className="text-xs text-[#70d59b]">Profile saved on this device.</p>}</div></div>;
}

function DownloadsPage() {
  const t = useT();
  const [downloads, setDownloads] = useState<Array<{
    id: string;
    dramaId: string;
    dramaTitle: string;
    episode: number;
    episodeTitle: string;
    status: 'downloading' | 'downloaded' | 'failed' | 'pending';
    progress: number;
    size: string;
    date: string;
  }>>(() => {
    const stored = localStorage.getItem('veyra:downloads');
    return stored ? JSON.parse(stored) : [];
  });

  const storageUsed = downloads.reduce((sum, download) => {
    if (download.status !== 'downloaded') return sum;
    const size = Number.parseFloat(download.size);
    return Number.isFinite(size) ? sum + size : sum;
  }, 0);
  const storageLimit = 1000; // 1GB limit

  const deleteDownload = (id: string) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('veyra:downloads', JSON.stringify(updated));
  };

  return (
    <div className="animate-rise max-w-2xl">
      <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45">
        <ArrowLeft size={14} /> {t('Back to Profile')}
      </Link>
      <div className="mt-7 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff4fc3]/12 text-[#ff4fc3]">
          <Download size={18} />
        </div>
        <div>
          <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA</p>
          <h1 className="mt-1 font-display text-3xl">{t('Downloads')}</h1>
        </div>
      </div>

      <div className="mt-7 space-y-6">
        {/* Storage Info */}
        <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">{t('Storage used')}</p>
              <p className="mt-1 font-display text-2xl text-white">{storageUsed} MB / {storageLimit} MB</p>
            </div>
            <div className="h-12 w-12">
              <svg viewBox="0 0 36 36" className="h-full w-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ff4fc3"
                  strokeWidth="3"
                  strokeDasharray={`${(storageUsed / storageLimit) * 100}, 100`}
                />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/30">
            {t('Downloads are stored locally on your device. Storage varies by device.')}
          </p>
        </section>

        {/* Download Status */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-white">{t('Your downloads')}</h3>
            <span className="text-xs text-white/40">{downloads.length} {t('Episodes').toLowerCase()}</span>
          </div>
          
          {downloads.length > 0 ? (
            <div className="space-y-3">
              {downloads.map((download) => (
                <div key={download.id} className="rounded-xl border border-white/[.08] bg-white/[.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-display text-sm text-white/90">{download.dramaTitle}</p>
                      <p className="mt-1 text-xs text-white/40">{t('Episode')} {download.episode}: {download.episodeTitle}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {download.status === 'downloading' && (
                          <>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                              <div 
                                className="h-full rounded-full bg-[#ff4fc3] transition-all"
                                style={{ width: `${download.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-white/30">{download.progress}%</span>
                          </>
                        )}
                        {download.status === 'downloaded' && (
                          <span className="text-[10px] text-[#70d59b]">{t('Downloaded')}</span>
                        )}
                        {download.status === 'failed' && (
                          <span className="text-[10px] text-red-400">{t('Failed')}</span>
                        )}
                        {download.status === 'pending' && (
                          <span className="text-[10px] text-white/30">{t('Pending')}</span>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-white/30">{download.size} · {new Date(download.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {download.status === 'failed' && <span className="text-xs text-white/40">{t('Retry from the player')}</span>}
                      {download.status === 'downloaded' && (
                        <button
                          type="button"
                          onClick={() => deleteDownload(download.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          {t('Delete')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[.02] p-8 text-center">
              <Download size={24} className="mx-auto text-white/30" />
              <p className="mt-3 text-sm text-white/40">{t('No downloads yet')}</p>
              <p className="mt-1 text-xs text-white/30">{t('Download episodes to watch offline')}</p>
            </div>
          )}
        </section>

        {/* Download Info */}
        <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <h3 className="font-display text-sm text-white/90">{t('About downloads')}</h3>
          <ul className="mt-3 space-y-2 text-xs text-white/40">
            <li>• {t('Downloaded episodes can be watched without an internet connection')}</li>
            <li>• {t('Downloads are stored on your device and count against local storage')}</li>
            <li>• {t('Download quality matches your current streaming quality setting')}</li>
            <li>• {t('Downloads may be removed if storage space is needed')}</li>
            <li>• {t('Not all content may be available for download due to licensing')}</li>
          </ul>
        </section>

        {/* Integration Note */}
        <section className="rounded-2xl border border-[#b78cff]/30 bg-[#b78cff]/10 p-5">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-[#b78cff] mt-0.5" />
            <div>
                <p className="font-display text-sm text-white/90">{t('Secure downloads')}</p>
              <p className="mt-2 text-xs text-white/60">
                Android downloads use the native DownloadManager. Offline playback and authenticated media delivery require a configured backend media entitlement service.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ReferralPage() {
  const [referralCode, setReferralCode] = useState(() => {
    const stored = localStorage.getItem('veyra:referral-code');
    return stored || 'VEYRA' + Math.random().toString(36).substring(2, 8).toUpperCase();
  });
  const [invitedUsers, setInvitedUsers] = useState<number>(() => {
    const stored = localStorage.getItem('veyra:invited-users');
    return stored ? Number(stored) : 0;
  });
  const [bonusHistory, setBonusHistory] = useState<Array<{ date: string; type: string; amount: number; description: string }>>(() => {
    const stored = localStorage.getItem('veyra:referral-history');
    return stored ? JSON.parse(stored) : [];
  });

  const milestones = [
    { users: 1, reward: 50, description: 'First friend joins' },
    { users: 3, reward: 150, description: '3 friends join' },
    { users: 5, reward: 300, description: '5 friends join' },
    { users: 10, reward: 750, description: '10 friends join' },
    { users: 25, reward: 2000, description: '25 friends join' },
  ];

  const copyReferralLink = () => {
    const link = `https://veyra.app?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
  };

  const shareReferral = async () => {
    const link = `https://veyra.app?ref=${referralCode}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join VEYRA',
          text: 'Check out VEYRA - Short Stories. Big Emotions.',
          url: link
        });
      } else {
        navigator.clipboard.writeText(link);
      }
    } catch (error) {
      // User cancelled or clipboard not available
    }
  };

  return (
    <div className="animate-rise max-w-2xl">
      <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45">
        <ArrowLeft size={14} /> Back to Profile
      </Link>
      <div className="mt-7 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff4fc3]/12 text-[#ff4fc3]">
          <Share2 size={18} />
        </div>
        <div>
          <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA</p>
          <h1 className="mt-1 font-display text-3xl">Referral Program</h1>
        </div>
      </div>

      <div className="mt-7 space-y-6">
        {/* Referral Code */}
        <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-6">
          <h3 className="font-display text-lg text-white">Your referral code</h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 font-mono-ui text-lg text-[#ff4fc3]">
              {referralCode}
            </div>
            <button
              type="button"
              onClick={copyReferralLink}
              className="rounded-full border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={shareReferral}
              className="rounded-full bg-[#ff4fc3] px-4 py-3 text-sm font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]"
            >
              Share
            </button>
          </div>
          <p className="mt-3 text-xs text-white/40">Share this code with friends and earn coins when they join!</p>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
            <p className="text-xs text-white/40">Friends invited</p>
            <p className="mt-2 font-display text-3xl text-white">{invitedUsers}</p>
          </div>
          <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
            <p className="text-xs text-white/40">Total earned</p>
            <p className="mt-2 font-display text-3xl text-[#b78cff]">{bonusHistory.reduce((sum, item) => sum + item.amount, 0)}</p>
          </div>
        </section>

        {/* Milestones */}
        <section>
          <h3 className="font-display text-lg text-white">Milestones</h3>
          <div className="mt-4 space-y-3">
            {milestones.map((milestone) => {
              const achieved = invitedUsers >= milestone.users;
              const nextProgress = Math.min((invitedUsers / milestone.users) * 100, 100);
              
              return (
                <div key={milestone.users} className="rounded-xl border border-white/[.08] bg-white/[.02] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-display text-sm ${achieved ? 'text-[#70d59b]' : 'text-white/70'}`}>
                        {milestone.description}
                      </p>
                      <p className="mt-1 text-xs text-white/40">{milestone.users} friends</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-display text-lg ${achieved ? 'text-[#70d59b]' : 'text-white/70'}`}>
                        +{milestone.reward}
                      </p>
                      <p className="text-[10px] text-white/30">coins</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div 
                      className={`h-full rounded-full transition-all ${achieved ? 'bg-[#70d59b]' : 'bg-[#ff4fc3]'}`}
                      style={{ width: `${nextProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bonus History */}
        <section>
          <h3 className="font-display text-lg text-white">Bonus history</h3>
          <div className="mt-4 space-y-2">
            {bonusHistory.length > 0 ? bonusHistory.map((bonus, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-white/[.06] bg-white/[.02] p-3">
                <div>
                  <p className="text-sm text-white/90">{bonus.type}</p>
                  <p className="text-[10px] text-white/30">{bonus.description} · {new Date(bonus.date).toLocaleDateString()}</p>
                </div>
                <p className="font-mono-ui text-sm text-[#b78cff]">+{bonus.amount}</p>
              </div>
            )) : (
              <p className="text-sm text-white/40">No referral bonuses yet. Start inviting friends!</p>
            )}
          </div>
        </section>

        {/* Terms */}
        <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
          <h3 className="font-display text-sm text-white/90">Program terms</h3>
          <ul className="mt-3 space-y-2 text-xs text-white/40">
            <li>• Your friend must sign up using your referral code</li>
            <li>• Bonuses are awarded when your friend completes their first watch session</li>
            <li>• Maximum 25 referrals per account for bonus eligibility</li>
            <li>• VEYRA reserves the right to modify or terminate the program</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const t = useT();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'New episode' | 'New series' | 'Reward earned' | 'Streak reminder' | 'VIP reward' | 'System' | 'Promotional';
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>>(() => {
    const stored = localStorage.getItem('veyra:notifications');
    if (stored) return JSON.parse(stored);
    return [];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('veyra:notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('veyra:notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('veyra:notifications', JSON.stringify(updated));
  };

  return (
    <div className="animate-rise max-w-2xl">
      <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45">
        <ArrowLeft size={14} /> {t('Back to Profile')}
      </Link>
      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff4fc3]/12 text-[#ff4fc3]">
            <Bell size={18} />
          </div>
          <div>
            <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA</p>
            <h1 className="mt-1 font-display text-3xl">{t('Notifications')}</h1>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs text-[#ff4fc3] hover:text-white"
          >
            {t('Mark all read')}
          </button>
        )}
      </div>

      <div className="mt-7">
        {unreadCount > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff4fc3]" />
                  <span className="text-xs text-white/60">{unreadCount} {t(unreadCount > 1 ? 'unread notifications' : 'unread notification')}</span>
          </div>
        )}

        <div className="space-y-2">
          {notifications.length > 0 ? notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 transition-colors ${
                notification.read 
                  ? 'border-white/[.06] bg-white/[.02]' 
                  : 'border-[#ff4fc3]/30 bg-[#ff4fc3]/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-[#ff4fc3]" />
                    )}
                    <p className={`font-display text-sm ${notification.read ? 'text-white/70' : 'text-white'}`}>
                      {notification.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-white/40">{notification.message}</p>
                  <p className="mt-2 text-[10px] text-white/30">
                    {new Date(notification.date).toLocaleDateString()} · {notification.type}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-white/40 hover:text-white"
                      aria-label="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs text-white/40 hover:text-red-400"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[.02] p-8 text-center">
              <Bell size={24} className="mx-auto text-white/30" />
              <p className="mt-3 text-sm text-white/40">{t('No notifications yet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function SettingsPage(){ const t = useT(); return <SimpleSettingsPage title="Settings" icon={<Settings size={18}/>}><div className="space-y-2"><Link href="/settings/language" className="block rounded-xl border border-white/[.08] p-4 text-sm">{t('Language')}</Link><Link href="/settings/notifications" className="block rounded-xl border border-white/[.08] p-4 text-sm">{t('Notifications')}</Link><Link href="/privacy" className="block rounded-xl border border-white/[.08] p-4 text-sm">{t('Privacy')}</Link><Link href="/terms" className="block rounded-xl border border-white/[.08] p-4 text-sm">{t('Terms')}</Link><Link href="/feedback" className="block rounded-xl border border-white/[.08] p-4 text-sm">{t('Feedback')}</Link></div></SimpleSettingsPage>; }
function SimpleSettingsPage({title,icon,children}:{title:string;icon:ReactNode;children:ReactNode}){ const t = useT(); return <div className="animate-rise max-w-2xl"><Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45"><ArrowLeft size={14}/> {t('Back to Profile')}</Link><div className="mt-7 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff4fc3]/12 text-[#ff4fc3]">{icon}</div><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA</p><h1 className="mt-1 font-display text-3xl">{t(title)}</h1></div></div><div className="mt-7 rounded-2xl border border-white/[.08] bg-white/[.02] p-5">{children}</div></div>; }
function InfoPage({title,text}:{title:string;text:string}){ return <SimpleSettingsPage title={title} icon={<ShieldCheck size={18}/>}>{<p className="text-sm leading-7 text-white/60">{text}</p>}</SimpleSettingsPage>; }

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AppRouter() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/watch/:dramaId/:episode" component={WatchPage} />
        <Route path="/" component={() => <PageFrame><HomePage /></PageFrame>} />
        <Route path="/drama/:id" component={() => <PageFrame><DramaDetailPage /></PageFrame>} />
        <Route path="/search" component={() => <PageFrame><SearchPage /></PageFrame>} />
        <Route path="/for-you" component={() => <PageFrame><ForYouPage /></PageFrame>} />
         <Route path="/discover" component={() => <PageFrame><DiscoverPage /></PageFrame>} />
        <Route path="/saved" component={() => <PageFrame><SavedPage /></PageFrame>} />
         <Route path="/following" component={() => <PageFrame><FollowingPage /></PageFrame>} />
         <Route path="/rewards" component={() => <PageFrame><RewardsPage /></PageFrame>} />
         <Route path="/wallet" component={() => <PageFrame><WalletPage /></PageFrame>} />
         <Route path="/vip" component={() => <PageFrame><VipPage /></PageFrame>} />
         <Route path="/profile" component={() => <PageFrame><ProfilePage /></PageFrame>} />
         <Route path="/history" component={() => <PageFrame><HistoryPage /></PageFrame>} />
         <Route path="/profile/edit" component={() => <PageFrame><EditProfilePage /></PageFrame>} />
         <Route path="/settings" component={() => <PageFrame><SettingsPage /></PageFrame>} />
         <Route path="/settings/language" component={() => <PageFrame><LanguagePage /></PageFrame>} />
         <Route path="/settings/notifications" component={() => <PageFrame><NotificationsPage /></PageFrame>} />
         <Route path="/referral" component={() => <PageFrame><ReferralPage /></PageFrame>} />
         <Route path="/downloads" component={() => <PageFrame><DownloadsPage /></PageFrame>} />
         <Route path="/privacy" component={() => <PageFrame><InfoPage title="Privacy Policy" text="VEYRA will publish its final privacy policy before public launch." /></PageFrame>} />
         <Route path="/terms" component={() => <PageFrame><InfoPage title="Terms of Service" text="VEYRA will publish its final terms before public launch." /></PageFrame>} />
         <Route path="/help" component={() => <PageFrame><InfoPage title="Help & FAQ" text="Help, account support, billing and playback guidance will be available here." /></PageFrame>} />
         <Route path="/feedback" component={() => <PageFrame><InfoPage title="Feedback" text="Send feedback to help us improve VEYRA." /></PageFrame>} />
         <Route path="/admin" component={() => <PageFrame><AdminPage /></PageFrame>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function AuthenticatedApp() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('veyra:saved') ?? '[]') as string[]; } catch { return []; }
  });
  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('veyra:following') ?? '[]') as string[]; } catch { return []; }
  });
  const [miniPlayer, setMiniPlayer] = useState<AppContextValue['miniPlayer']>(null);
  const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem('veyra:locale') as Locale | null) ?? 'English');
  const { isSignedIn } = useAuth();
  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    localStorage.setItem('veyra:locale', nextLocale);
    document.documentElement.lang = nextLocale === 'Türkçe' ? 'tr' : nextLocale === 'Español' ? 'es' : nextLocale === 'Português' ? 'pt' : nextLocale === 'Français' ? 'fr' : nextLocale === 'Deutsch' ? 'de' : nextLocale === 'Bahasa Indonesia' ? 'id' : nextLocale === '日本語' ? 'ja' : nextLocale === '繁體中文' ? 'zh-TW' : nextLocale === '简体中文' ? 'zh-CN' : nextLocale === '한국어' ? 'ko' : nextLocale === 'ภาษาไทย' ? 'th' : nextLocale === 'Italiano' ? 'it' : nextLocale === 'Melayu' ? 'ms' : nextLocale === 'العربية' ? 'ar' : nextLocale === 'Tiếng Việt' ? 'vi' : nextLocale === 'हिन्दी' ? 'hi' : 'en';
    window.dispatchEvent(new CustomEvent('veyra-locale-change', { detail: nextLocale }));
  };
  useEffect(() => {
    const languageCode = locale === 'Türkçe' ? 'tr' : locale === 'Español' ? 'es' : locale === 'Português' ? 'pt' : locale === 'Français' ? 'fr' : locale === 'Deutsch' ? 'de' : locale === 'Bahasa Indonesia' ? 'id' : locale === '日本語' ? 'ja' : locale === '繁體中文' ? 'zh-TW' : locale === '简体中文' ? 'zh-CN' : locale === '한국어' ? 'ko' : locale === 'ภาษาไทย' ? 'th' : locale === 'Italiano' ? 'it' : locale === 'Melayu' ? 'ms' : locale === 'العربية' ? 'ar' : locale === 'Tiếng Việt' ? 'vi' : locale === 'हिन्दी' ? 'hi' : 'en';
    document.documentElement.lang = languageCode;
    document.documentElement.dir = locale === 'العربية' ? 'rtl' : 'ltr';
  }, [locale]);
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/me/list', { credentials: 'include' }).then((response) => response.ok ? response.json() : []).then((items: Array<{ slug?: string }>) => {
      const remoteIds = items.map((item) => item.slug).filter((slug): slug is string => Boolean(slug));
      if (remoteIds.length) setSavedIds(remoteIds);
    }).catch(() => undefined);
      fetch('/api/me/following', { credentials: 'include' }).then((response) => response.ok ? response.json() : []).then((items: Array<{ slug?: string }>) => {
        const remoteIds = items.map((item) => item.slug).filter((slug): slug is string => Boolean(slug));
        setFollowingIds(remoteIds);
        localStorage.setItem('veyra:following', JSON.stringify(remoteIds));
      }).catch(() => undefined);
  }, [isSignedIn]);
  const value = useMemo<AppContextValue>(() => ({
    savedIds,
    toggleSaved: (id) => {
      const saving = !savedIds.includes(id);
      setSavedIds((current) => { const next = saving ? [...current, id] : current.filter((entry) => entry !== id); localStorage.setItem('veyra:saved', JSON.stringify(next)); return next; });
      if (isSignedIn) {
        const method = saving ? 'POST' : 'DELETE';
        void fetch(saving ? '/api/me/list' : `/api/me/list/${encodeURIComponent(id)}`, { method, credentials: 'include', headers: saving ? { 'Content-Type': 'application/json' } : undefined, body: saving ? JSON.stringify({ seriesId: id }) : undefined });
      }
    },
    isSaved: (id) => savedIds.includes(id),
    followingIds,
    toggleFollowing: (id) => {
      const following = !followingIds.includes(id);
      const next = following ? [...followingIds, id] : followingIds.filter((entry) => entry !== id);
      setFollowingIds(next);
      localStorage.setItem('veyra:following', JSON.stringify(next));
      if (isSignedIn) {
        void fetch(following ? '/api/me/following' : `/api/me/following/${encodeURIComponent(id)}`, { method: following ? 'POST' : 'DELETE', credentials: 'include', headers: following ? { 'Content-Type': 'application/json' } : undefined, body: following ? JSON.stringify({ seriesId: id }) : undefined });
      }
    },
    isFollowing: (id) => followingIds.includes(id),
    miniPlayer,
    setMiniPlayer,
    locale,
    t: createTranslator(locale),
    setLocale,
  }), [followingIds, isSignedIn, locale, miniPlayer, savedIds]);
  return <QueryClientProvider client={queryClient}><TooltipProvider><AppContext.Provider value={value}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRouter /></WouterRouter><MiniPlayer /></AppContext.Provider><Toaster /></TooltipProvider></QueryClientProvider>;
}

function MiniPlayer() {
  const { miniPlayer, setMiniPlayer } = useAppValue();
  const videoRef = useRef<HTMLVideoElement>(null);
  if (!miniPlayer) return null;
  const open = () => {
    const video = videoRef.current;
    if (video) setMiniPlayer({ ...miniPlayer, currentTime: video.currentTime, playing: !video.paused });
    window.history.pushState({}, '', `/watch/${miniPlayer.dramaId}/${miniPlayer.episode}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setMiniPlayer(null);
  };
  return <div className="veyra-mini-player fixed bottom-[5.25rem] right-3 z-[60] w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/15 bg-[#111118] shadow-2xl md:bottom-5" data-testid="mini-player">
    <video ref={videoRef} className="aspect-video w-full bg-black object-cover" src={miniPlayer.source} poster={posterImages.voicemail} autoPlay playsInline onLoadedMetadata={(event) => { event.currentTarget.currentTime = miniPlayer.currentTime; }} onEnded={() => setMiniPlayer(null)} />
    <div className="flex items-center gap-2 p-2"><button type="button" onClick={open} className="min-w-0 flex-1 truncate text-left text-xs text-white/80">{miniPlayer.title}</button><button type="button" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10); }} aria-label="Back 10 seconds" className="text-xs text-white/60">-10</button><button type="button" onClick={() => { const video = videoRef.current; if (video) video.paused ? void video.play() : video.pause(); }} aria-label="Play or pause" className="grid h-7 w-7 place-items-center rounded-full bg-[#ff4fc3] text-[#171720]"><Play size={12} fill="currentColor" /></button><button type="button" onClick={() => { const video = videoRef.current; if (video) video.currentTime += 10; }} aria-label="Forward 10 seconds" className="text-xs text-white/60">+10</button><button type="button" onClick={() => setMiniPlayer(null)} aria-label="Close mini player" className="grid h-7 w-7 place-items-center text-white/60">×</button></div>
  </div>;
}

function App() {
  return <ClerkProvider publishableKey={clerkPublishableKey}><AuthenticatedApp /></ClerkProvider>;
}

export default App;