import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  Bell,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CirclePlay,
  Download,
  Clock3,
  BarChart3,
  Check,
  Coins,
  Gift,
  Home as HomeIcon,
  Library,
  Languages,
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
  Zap,
} from 'lucide-react';
import { ClerkProvider, Show, SignInButton, UserButton, useAuth, useUser } from '@clerk/react';
import { useUpload } from '@workspace/object-storage-web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import '@/index.css';

const queryClient = new QueryClient();

type Episode = {
  number: number;
  title: string;
  runtime: string;
  released: string;
  synopsis: string;
  videoUrl: string;
  captions: CaptionCue[];
};

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
};

const AppContext = createContext<AppContextValue | null>(null);

function useAppValue() {
  const context = useContext(AppContext);
  if (!context) throw new Error('VEYRA app context is missing');
  return context;
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

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-[100dvh] bg-[#07080c]">
      <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#07080c]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-[1240px] items-center justify-between px-4 lg:px-7">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-[13px] text-white/65 transition-colors hover:text-white">Home</Link>
            <Link href="/discover" className="text-[13px] text-white/65 transition-colors hover:text-white">Discover</Link>
            <Link href="/rewards" className="text-[13px] text-white/65 transition-colors hover:text-white">Rewards</Link>
            <Link href="/following" className="text-[13px] text-white/65 transition-colors hover:text-white">My List</Link>
            <Link href="/wallet" className="text-[13px] text-white/65 transition-colors hover:text-white">Wallet</Link>
            <Link href="/vip" className="text-[13px] font-semibold text-[#ff4fc3] transition-colors hover:text-white">VIP</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/search" aria-label="Search dramas" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/65 transition-all hover:border-[#ff4fc3]/50 hover:text-[#ff4fc3]" data-testid="link-search-button"><Search size={16} strokeWidth={2}/></Link>
            <Link href="/wallet" aria-label="Wallet" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/65 transition-all hover:border-[#ff4fc3]/50 hover:text-[#ff4fc3]"><Wallet size={16}/></Link>
            <Show when="signed-in"><UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} /></Show>
            <Show when="signed-out"><SignInButton mode="modal"><button type="button" className="hidden h-9 rounded-full border border-white/10 px-3 text-xs text-white/70 transition-colors hover:border-[#ff4fc3]/60 hover:text-white sm:block">Sign in</button></SignInButton></Show>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-6 md:px-7 md:pb-12 md:pt-9">{children}</main>
      <nav className="glass fixed inset-x-3 bottom-3 z-40 flex h-[3.9rem] items-center justify-around rounded-2xl md:hidden">
        <MobileNavLink href="/" icon={<HomeIcon size={18}/>} label="Home" />
        <MobileNavLink href="/discover" icon={<Search size={18}/>} label="Discover" />
        <MobileNavLink href="/rewards" icon={<Gift size={18}/>} label="Rewards" />
        <MobileNavLink href="/following" icon={<Bookmark size={18}/>} label="My List" />
        <MobileNavLink href="/profile" icon={<UserCircle size={18}/>} label="Profile" />
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
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {eyebrow && <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{eyebrow}</p>}
        <h2 className="mt-1 font-display text-[1.65rem] leading-none tracking-[-.035em] text-[#f7f2ff]">{title}</h2>
      </div>
      <Link href={href} className="group inline-flex items-center gap-1 pb-0.5 text-xs text-white/45 transition-colors hover:text-white" data-testid={`link-see-${title.toLowerCase().replaceAll(' ', '-')}`}>
        See all <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function DramaCard({ drama, compact = false }: { drama: Drama; compact?: boolean }) {
  const { isSaved, toggleSaved } = useAppValue();
  const saved = isSaved(drama.id);
  return (
    <article className={`group relative shrink-0 ${compact ? 'w-[146px]' : 'w-[158px] sm:w-[190px]'}`} data-testid={`card-drama-${drama.id}`}>
      <Link href={`/drama/${drama.id}`} className="block" data-testid={`link-drama-${drama.id}`}>
        <Poster drama={drama} className={`${compact ? 'aspect-[.69]' : 'aspect-[.72]'} transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl`} />
        <div className="mt-2.5 pr-7">
          <h3 className="truncate font-display text-[15px] leading-tight text-white/90">{drama.title}</h3>
          <p className="mt-1 truncate text-[11px] text-white/40">{drama.genre.join(' · ')} <span className="text-white/20">·</span> {drama.episodeCount} eps</p>
        </div>
      </Link>
      <button
        type="button"
        className={`absolute right-1 top-2 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-all ${saved ? 'border-[#ff4fc3]/50 bg-[#ff4fc3] text-[#171720]' : 'border-white/20 bg-[#111118]/45 text-white/75 hover:border-white/60 hover:text-white'}`}
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
  const { isSaved, toggleSaved } = useAppValue();
  const featured = dramas[0];
  const saved = isSaved(featured.id);
  return (
    <div className="animate-rise space-y-12">
      <section className="relative min-h-[455px] overflow-hidden rounded-[1.6rem] border border-white/[.08] bg-[#1b1a27] md:min-h-[510px]">
        <div className="absolute inset-0 bg-cover bg-center md:bg-[position:58%_38%]" style={{ backgroundImage: `linear-gradient(90deg, #15151f 0%, rgba(21,21,31,.85) 28%, rgba(21,21,31,.22) 72%, rgba(21,21,31,.3) 100%), linear-gradient(0deg, #15151f 0%, transparent 40%), url("${featured.image}")` }} />
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#ff4fc3]/10 blur-3xl" />
        <div className="relative flex min-h-[455px] max-w-[570px] flex-col justify-end p-6 pb-7 md:min-h-[510px] md:p-10 md:pb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#ff4fc3] px-2.5 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[.14em] text-[#15151f]">Featured tonight</span>
            <span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-white/50">8 episodes · 1h 12m</span>
          </div>
          <h1 className="max-w-[500px] font-display text-[3.25rem] leading-[.88] tracking-[-.065em] text-[#f7f2ff] sm:text-[4.4rem]">The Last<br />Voicemail</h1>
          <p className="mt-5 max-w-[430px] text-sm leading-relaxed text-white/62 md:text-[15px]">{featured.description}</p>
          <div className="mt-7 flex items-center gap-3">
            <Link href={`/drama/${featured.id}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff4fc3] px-5 text-sm font-semibold text-[#171720] transition-all hover:bg-[#ff8bdd] hover:shadow-[0_10px_30px_rgba(244,126,104,.2)]" data-testid="link-featured-play">
              <Play size={15} fill="currentColor" /> Start watching
            </Link>
            <button type="button" onClick={() => toggleSaved(featured.id)} className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-all ${saved ? 'border-[#ff4fc3]/60 bg-[#ff4fc3]/15 text-[#ff4fc3]' : 'border-white/15 bg-white/[.06] text-white/80 hover:border-white/35'}`} data-testid="button-featured-save">
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? 'In My List' : 'My List'}
            </button>
          </div>
        </div>
        <div className="absolute right-7 top-7 hidden items-center gap-2 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4fc3]" />
          <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-white/45">New episode weekly</span>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="What people are watching" title="Popular right now" />
        <div className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5">
          {dramas.slice(1, 6).map((drama) => <DramaCard drama={drama} key={drama.id} />)}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
        <div>
          <SectionHeader eyebrow="Fresh from the writers' room" title="New episodes" href="/search?filter=new" />
          <div className="space-y-3">
            {dramas.slice(0, 3).map((drama, index) => <EpisodeRow drama={drama} episode={drama.episodes[index]} key={drama.id} />)}
          </div>
        </div>
        <div className="relative min-h-[245px] overflow-hidden rounded-[1.35rem] border border-white/[.08] bg-[#1b2029] p-6">
          <div className="absolute -right-6 -top-10 h-48 w-48 rounded-full bg-[#6eabb2]/20 blur-3xl" />
          <div className="absolute bottom-[-45px] right-[-15px] h-48 w-48 rounded-full border border-[#6eabb2]/20" />
          <div className="relative">
            <Sparkles size={18} className="text-[#b78cff]" />
             <p className="mt-8 max-w-[230px] font-display text-2xl leading-[.98] text-[#f2efff]">Short stories.<br />Deep impact.</p>
            <p className="mt-4 max-w-[240px] text-xs leading-relaxed text-white/45">A global slate of short stories, mini-series, and AI-generated films to carry with you.</p>
            <Link href="/search" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-[#b78cff] hover:text-white" data-testid="link-explore-all">Explore the collection <ChevronRight size={13} /></Link>
          </div>
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
  const { isSaved, toggleSaved } = useAppValue();
  const drama = dramas.find((entry) => entry.id === id) ?? dramas[0];
  const saved = isSaved(drama.id);
  const [resumeEpisode, setResumeEpisode] = useState(1);

  useEffect(() => {
    setResumeEpisode(Math.min(getLastEpisode(drama.id), drama.episodeCount));
  }, [drama.id, drama.episodeCount]);

  return (
    <div className="animate-rise">
      <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white" data-testid="link-detail-back"><ArrowLeft size={15} /> Back to Home</Link>
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
            <div className="mt-7 flex gap-3">
              <Link href={`/watch/${drama.id}/${resumeEpisode}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff4fc3] px-5 text-sm font-semibold text-[#171720] transition-all hover:bg-[#ff8bdd]" data-testid="link-detail-play"><Play size={15} fill="currentColor" /> {resumeEpisode > 1 ? `Continue episode ${resumeEpisode}` : 'Play episode 1'}</Link>
              <button type="button" onClick={() => toggleSaved(drama.id)} className={`grid h-11 w-11 place-items-center rounded-full border transition-all ${saved ? 'border-[#ff4fc3]/60 bg-[#ff4fc3]/15 text-[#ff4fc3]' : 'border-white/15 bg-white/[.05] text-white/75 hover:border-white/40'}`} aria-label={saved ? 'Remove from My List' : 'Save to My List'} data-testid="button-detail-save">{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Watch in order</p><h2 className="mt-1 font-display text-2xl text-white">Episodes</h2></div>
          <p className="text-xs text-white/35">{drama.episodeCount} chapters</p>
        </div>
        <div className="divide-y divide-white/[.06] overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.02]">
          {drama.episodes.map((episode) => <EpisodeDetailRow drama={drama} episode={episode} key={episode.number} />)}
        </div>
      </section>
    </div>
  );
}

function EpisodeDetailRow({ drama, episode }: { drama: Drama; episode: Episode }) {
  return (
    <Link href={`/watch/${drama.id}/${episode.number}`} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[.045] sm:px-5" data-testid={`link-episode-${drama.id}-${episode.number}`}>
      <span className="w-6 font-mono-ui text-[11px] text-white/35">{String(episode.number).padStart(2, '0')}</span>
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-cover bg-center sm:h-16 sm:w-28" style={{ backgroundImage: `linear-gradient(90deg, rgba(20,20,29,.1), rgba(20,20,29,.6)), url("${drama.image}")` }}>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff4fc3] text-[#171720]"><Play size={12} fill="currentColor" /></span></span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-[16px] text-white/85 group-hover:text-white">{episode.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-white/40">{episode.synopsis}</p>
      </div>
      <div className="hidden items-center gap-1 text-[10px] text-white/35 sm:flex"><Clock3 size={12} /> {episode.runtime}</div>
      <ChevronRight size={15} className="text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-[#ff4fc3]" />
    </Link>
  );
}

function DiscoverPage() {
  const groups = [
    ['Trending now', dramas.slice(0, 6)],
    ['Romance & forbidden love', dramas.filter((d) => d.genre.includes('Romance'))],
    ['Mystery & revenge', dramas.filter((d) => d.genre.some((g) => ['Mystery','Thriller','Noir'].includes(g)))],
    ['Fantasy & impossible worlds', dramas.filter((d) => d.genre.some((g) => ['Sci-fi'].includes(g)))],
  ];
  return <div className="animate-rise space-y-10"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Explore VEYRA</p><h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-white sm:text-[4.4rem]">Discover<span className="text-[#ff4fc3]">.</span></h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45">Find short dramas by mood, genre and story trope.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Link href="/search" className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/75 hover:border-[#ff4fc3]/40">Search stories</Link><button type="button" className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-left text-sm text-white/75">Top rated</button><button type="button" className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-left text-sm text-white/75">Most watched</button><button type="button" className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-left text-sm text-white/75">New releases</button></div>{groups.map(([title,items]) => <section key={title as string}><SectionHeader title={title as string} href="/search"/><div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">{(items as Drama[]).map((d)=><DramaCard drama={d} key={d.id}/>)}</div></section>)}</div>;
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const genres = ['All', 'Romance', 'Revenge', 'Mystery', 'Thriller', 'Fantasy', 'CEO', 'Mafia'];
  const suggestions = ['Hidden Identity', 'Fake Marriage', 'Billionaire', 'Revenge', 'Secret Baby', 'Werewolf'];
  const results = useMemo(() => dramas.filter((drama) => {
    const haystack = `${drama.title} ${drama.eyebrow} ${drama.genre.join(' ')} ${drama.description}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase().trim());
    const matchesGenre = activeGenre === 'All' || drama.genre.some((genre) => genre.toLowerCase().includes(activeGenre.toLowerCase()));
    return matchesQuery && matchesGenre;
  }), [activeGenre, query]);
  return (
    <div className="animate-rise">
      <div className="sticky top-[4.25rem] z-30 -mx-4 border-b border-white/[.06] bg-[#07080c]/95 px-4 pb-4 pt-3 backdrop-blur-xl md:-mx-7 md:px-7">
        <div className="flex items-center gap-3">
          <Link href="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.03] text-white/60" aria-label="Back home"><ArrowLeft size={16}/></Link>
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={17}/>
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories, characters, tropes..." className="h-11 w-full rounded-full border border-white/10 bg-white/[.06] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#ff4fc3]/60" data-testid="input-search" />
          </label>
          {query && <button type="button" onClick={() => setQuery('')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/50">×</button>}
        </div>
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {genres.map((genre) => <button key={genre} type="button" onClick={() => setActiveGenre(genre)} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-medium transition-all ${activeGenre === genre ? 'border-[#ff4fc3] bg-[#ff4fc3] text-[#171720]' : 'border-white/10 bg-white/[.03] text-white/55'}`}>{genre}</button>)}
        </div>
      </div>

      {!query && activeGenre === 'All' && (
        <section className="mt-6 rounded-2xl border border-white/[.07] bg-white/[.025] p-5">
          <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Popular searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((item) => <button key={item} type="button" onClick={() => setQuery(item)} className="rounded-full border border-white/10 bg-white/[.03] px-3.5 py-2 text-xs text-white/65 hover:border-[#ff4fc3]/50 hover:text-white">{item}</button>)}
          </div>
        </section>
      )}

      <div className="mt-7">
        <div className="mb-5 flex items-end justify-between"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">{query ? 'Search results' : 'Browse all stories'}</p><h1 className="mt-1 font-display text-2xl text-white">{query ? `${results.length} stories` : 'Discover your next obsession'}</h1></div><SlidersHorizontal size={17} className="text-white/35" /></div>
        {results.length > 0 ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{results.map((drama) => <DramaCard drama={drama} key={drama.id} />)}</div> : <EmptySearch onReset={() => { setQuery(''); setActiveGenre('All'); }} />}
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

function SavedPage() {
  const { savedIds } = useAppValue();
  const savedDramas = dramas.filter((drama) => savedIds.includes(drama.id));
  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your VEYRA collection</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.2rem]">My List<span className="text-[#ff4fc3]">.</span></h1>
        <p className="mt-4 text-sm text-white/45">{savedDramas.length ? `${savedDramas.length} stories waiting for you` : 'Save something for a later night.'}</p>
      </div>
      {savedDramas.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{savedDramas.map((drama) => <DramaCard drama={drama} key={drama.id} />)}</div> : <EmptySaved />}
    </div>
  );
}

function FollowingPage() {
  const [following, setFollowing] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/me/following', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : [])
      .then((items: Array<{ slug?: string; id?: number }>) => {
        const ids = new Set(items.map((item) => String(item.slug ?? item.id)));
        setFollowing(dramas.filter((drama) => ids.has(drama.id)));
      })
      .catch(() => setFollowing([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="animate-rise">
      <div className="mb-9"><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your watch circle</p><h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#f7f2ff] sm:text-[4.2rem]">Following<span className="text-[#ff4fc3]">.</span></h1><p className="mt-4 text-sm text-white/45">{loading ? 'Loading your followed stories…' : `${following.length} stories in your circle`}</p></div>
      {following.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{following.map((drama) => <DramaCard drama={drama} key={drama.id} />)}</div> : <EmptySaved />}
    </div>
  );
}

function RewardsPage() {
  type Mission = { id: string; title: string; subtitle: string; reward: number; action: string; progress?: number; target?: number };
  const days = [20, 25, 30, 30, 50, 50, 100];
  const [balance, setBalance] = useState<number>(() => Number(localStorage.getItem('veyra:coins') ?? 0));
  const [checkedIn, setCheckedIn] = useState(() => localStorage.getItem('veyra:daily-checkin') === new Date().toISOString().slice(0,10));
  const [message, setMessage] = useState('');
  const [adProgress, setAdProgress] = useState(0);
  const [claimed, setClaimed] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('veyra:reward-claims') ?? '{}'); } catch { return {}; }
  });

  const addCoins = (amount: number, key: string, text: string) => {
    if (claimed[key]) return;
    const next = balance + amount;
    setBalance(next);
    localStorage.setItem('veyra:coins', String(next));
    window.dispatchEvent(new Event('veyra:coins'));
    const nextClaims = { ...claimed, [key]: true };
    setClaimed(nextClaims);
    localStorage.setItem('veyra:reward-claims', JSON.stringify(nextClaims));
    setMessage(text);
  };

  const missions: Mission[] = [
    { id: 'ad', title: 'Watch ads', subtitle: 'Watch 12 short ads · +5 Coins each', reward: 60, action: 'Watch', progress: adProgress, target: 12 },
    { id: 'rate', title: 'Rate a story', subtitle: 'Give a story your rating', reward: 10, action: 'Rate' },
    { id: 'instagram', title: 'Follow VEYRA', subtitle: 'Follow us on Instagram', reward: 10, action: 'Follow' },
    { id: 'email', title: 'Connect email', subtitle: 'Secure your account and get a bonus', reward: 20, action: 'Bind' },
    { id: 'notifications', title: 'Enable notifications', subtitle: 'Never miss a new episode', reward: 10, action: 'Enable' },
  ];

  return (
    <div className="animate-rise space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#b78cff]">Earn more while you watch</p>
          <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-white sm:text-[4rem]">Rewards<span className="text-[#ff4fc3]">.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/45">Check in every day, complete missions, play bonus games and turn your time into Coins.</p>
        </div>
        <Link href="/wallet" className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs text-white/75 sm:inline-flex"><Coins size={14} className="text-[#ffcf70]" /> {balance}</Link>
      </div>

      {message && <button type="button" onClick={() => setMessage('')} className="w-full rounded-xl border border-[#b78cff]/25 bg-[#b78cff]/10 px-4 py-3 text-left text-xs text-[#eadcff]">{message}</button>}

      <section className="overflow-hidden rounded-[1.6rem] border border-[#b78cff]/20 bg-[radial-gradient(circle_at_80%_20%,rgba(255,79,195,.16),transparent_30%),linear-gradient(135deg,rgba(183,140,255,.13),rgba(255,255,255,.025))] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ffcf70]">Daily check-in</p>
            <h2 className="mt-2 font-display text-2xl text-white">Come back every day.</h2>
            <p className="mt-1 text-xs text-white/45">Your streak gets more valuable as you return.</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ffcf70]/10 text-[#ffcf70]"><Gift size={23}/></div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((coins, index) => <div key={coins + index} className={`rounded-xl border p-2 text-center ${index === 0 && !checkedIn ? 'border-[#ff4fc3]/60 bg-[#ff4fc3]/12 shadow-[0_0_24px_rgba(255,79,195,.12)]' : 'border-white/[.07] bg-white/[.025]'}`}>
            <p className="font-mono-ui text-[8px] text-white/35">DAY {index + 1}</p>
            <Coins size={13} className="mx-auto my-1.5 text-[#ffcf70]" />
            <p className="font-mono-ui text-[9px] text-white/80">+{coins}</p>
          </div>)}
        </div>
        <button type="button" disabled={checkedIn} onClick={() => { if (checkedIn) return; const today=new Date().toISOString().slice(0,10); setCheckedIn(true); localStorage.setItem('veyra:daily-checkin',today); addCoins(days[0], 'daily-checkin-'+today, `Daily check-in claimed: +${days[0]} Coins`); }} className="mt-5 w-full rounded-full bg-[#ff4fc3] px-5 py-3 text-xs font-bold text-[#171720] disabled:bg-white/10 disabled:text-white/30">{checkedIn ? 'Checked in today' : `Claim today's ${days[0]} Coins`}</button>
      </section>

      <section className="rounded-[1.4rem] border border-white/[.08] bg-white/[.025] p-5 sm:p-6">
        <div className="flex items-end justify-between"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">Today's benefits</p><h2 className="mt-1 font-display text-2xl text-white">Complete & earn</h2></div><span className="text-[10px] text-white/30">Coins go straight to Wallet</span></div>
        <div className="mt-4 divide-y divide-white/[.06]">
          {missions.map((mission) => {
            const done = Boolean(claimed[mission.id]);
            const progress = mission.progress ?? (done ? mission.target ?? 1 : 0);
            const target = mission.target ?? 1;
            return <div key={mission.id} className="flex items-center gap-3 py-4 first:pt-1 last:pb-1">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#b78cff]/10 text-[#b78cff]">{mission.id === 'ad' ? <Play size={17} fill="currentColor"/> : mission.id === 'rate' ? <Check size={17}/> : mission.id === 'notifications' ? <Bell size={17}/> : mission.id === 'email' ? <UserCircle size={17}/> : <UsersRound size={17}/>}</div>
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-white/90">{mission.title}</p><span className="font-mono-ui text-[10px] text-[#ffcf70]">+{mission.reward}</span></div><p className="mt-1 text-[11px] text-white/40">{mission.subtitle}</p>{mission.target && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#b78cff] to-[#ff4fc3]" style={{width:`${Math.round((progress/target)*100)}%`}}/></div>}</div>
              <button type="button" onClick={() => { if (mission.id === 'ad') { const next=Math.min(adProgress+1,12); setAdProgress(next); setMessage(next===12 ? 'Ad mission complete. Your final bonus is ready.' : `Demo ad ${next}/12 — ad provider will award Coins when connected.`); if(next===12) addCoins(60,'ad-bonus','12-ad mission bonus: +60 Coins'); return; } addCoins(mission.reward, mission.id, `${mission.title}: +${mission.reward} Coins`); }} disabled={done} className="shrink-0 rounded-full bg-[#b78cff] px-3.5 py-2 text-[10px] font-bold text-[#171720] disabled:bg-white/10 disabled:text-white/25">{done ? 'Done' : mission.action}</button>
            </div>;
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[1.4rem] border border-white/[.08] bg-gradient-to-br from-[#ff4fc3]/10 to-transparent p-5">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff4fc3]/12 text-[#ff4fc3]"><Zap size={19}/></div><div><p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#ff4fc3]">Bonus zone</p><h2 className="font-display text-xl text-white">Games & surprises</h2></div></div>
          <p className="mt-4 text-xs leading-relaxed text-white/45">Play short bonus games and collect extra Coins. New challenges can appear here every day.</p>
          <button type="button" onClick={() => setMessage('Bonus games are ready for the game partner integration.')} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-2.5 text-xs text-white/80">Play & earn <ChevronRight size={13}/></button>
        </section>
        <section className="rounded-[1.4rem] border border-white/[.08] bg-gradient-to-br from-[#b78cff]/10 to-transparent p-5">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#b78cff]/12 text-[#b78cff]"><Clock3 size={19}/></div><div><p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#b78cff]">Limited reward</p><h2 className="font-display text-xl text-white">1 hour of free drama</h2></div></div>
          <p className="mt-4 text-xs leading-relaxed text-white/45">Use a limited-time reward to watch selected locked episodes without spending Coins.</p>
          <Link href="/discover" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-2.5 text-xs text-white/80">Find eligible stories <ChevronRight size={13}/></Link>
        </section>
      </div>

      <section className="rounded-[1.4rem] border border-white/[.08] bg-white/[.02] p-5">
        <div className="flex items-center justify-between gap-3"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/30">More ways to earn</p><h2 className="mt-1 font-display text-xl text-white">New arrivals & special missions</h2></div><Link href="/discover" className="text-xs text-[#ff4fc3]">Explore</Link></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xs text-white/80">New arrival</p><p className="mt-1 text-[10px] text-white/35">Watch a new series</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xs text-white/80">Finish an episode</p><p className="mt-1 text-[10px] text-white/35">Earn a watch bonus</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xs text-white/80">Keep your streak</p><p className="mt-1 text-[10px] text-white/35">Return tomorrow</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xs text-white/80">Invite a friend</p><p className="mt-1 text-[10px] text-white/35">Referral bonus</p></div></div>
      </section>
    </div>
  );
}

function ProfilePage() {
  const { isSignedIn, user } = useUser();
  const { savedIds } = useAppValue();
  if (!isSignedIn) return <AuthPrompt title="Make VEYRA yours" copy="Sign in to sync your list, watch progress, notifications, and profile across devices." />;
  return <div className="animate-rise"><div className="mb-9 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#ff4fc3]/15 text-[#ff4fc3]"><UserCircle size={30} /></div><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your profile</p><h1 className="mt-1 font-display text-3xl text-white">{user?.firstName ?? user?.username ?? 'VEYRA viewer'}</h1><p className="mt-1 text-xs text-white/40">{user?.primaryEmailAddress?.emailAddress ?? 'Signed in'}</p></div></div><div className="grid gap-4 sm:grid-cols-4"><ProfileStat label="My List" value={String(savedIds.length)} /><ProfileStat label="Rewards" value="Collect coins" href="/rewards" /><ProfileStat label="Wallet" value="View balance" href="/wallet" /><ProfileStat label="VIP" value="Unlock all" href="/vip" /></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><Link href="/settings" className="rounded-xl border border-white/[.08] p-4 text-xs text-white/65">Settings</Link><Link href="/settings/language" className="rounded-xl border border-white/[.08] p-4 text-xs text-white/65">Language</Link><Link href="/settings/notifications" className="rounded-xl border border-white/[.08] p-4 text-xs text-white/65">Notifications</Link></div><section className="mt-10"><SectionHeader eyebrow="Saved for later" title="My List" href="/saved" />{savedIds.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{dramas.filter((drama) => savedIds.includes(drama.id)).map((drama) => <DramaCard drama={drama} key={drama.id} />)}</div> : <EmptySaved />}</section></div>;
}

function ProfileStat({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = <div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4"><p className="text-xs text-white/40">{label}</p><p className="mt-2 font-display text-xl text-white/90">{value}</p></div>;
  return href ? <Link href={href}>{content}</Link> : content;
}

function AuthPrompt({ title, copy }: { title: string; copy: string }) {
  return <div className="mx-auto max-w-xl rounded-[1.5rem] border border-white/[.08] bg-white/[.03] px-6 py-16 text-center"><UserCircle size={28} className="mx-auto text-[#ff4fc3]" /><h1 className="mt-5 font-display text-3xl text-white">{title}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/45">{copy}</p><SignInButton mode="modal"><button type="button" className="mt-7 rounded-full bg-[#ff4fc3] px-5 py-3 text-sm font-semibold text-[#171720]">Sign in to continue</button></SignInButton></div>;
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
const NEXT_EPISODE_COUNTDOWN = 5;
const PROGRESS_SAVE_INTERVAL_SECONDS = 3;

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const nextEpisode = drama.episodes[episodeIndex + 1];
  const previousEpisode = drama.episodes[episodeIndex - 1];

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
    setCountdown(null);
  }, [progressKey, drama.id, episode.number]);

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

  // --- bölüm bittiğinde geri sayım ile sonraki bölüme geç ---
  useEffect(() => {
    if (!episodeFinished || !nextEpisode) {
      setCountdown(null);
      return;
    }
    setCountdown(NEXT_EPISODE_COUNTDOWN);
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current === null) return null;
        if (current <= 1) {
          window.clearInterval(timer);
          navigate(`/watch/${drama.id}/${nextEpisode.number}`);
          return null;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [episodeFinished, nextEpisode, drama.id, navigate]);

  // --- fullscreen durumunu takip et (tarayıcı + Escape) ---
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
    setIsFullscreen((current) => !current);
    const frame = frameRef.current;
    const video = videoRef.current;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (frame?.requestFullscreen) {
        await frame.requestFullscreen();
        return;
      }
      // iOS Safari: öğe fullscreen yok, videoyu native tam ekrana aç.
      const legacyVideo = video as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      legacyVideo?.webkitEnterFullscreen?.();
    } catch {
      // WebView zaten native tam ekran yolunu (onShowCustomView) kullanır.
    }
  };

  const cycleSpeed = () => {
    const next = playbackRate >= 2 ? 0.75 : playbackRate === 0.75 ? 1 : playbackRate + 0.5;
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
    pokeControls();
  };
  const shareEpisode = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${drama.title} — Episode ${episode.number}`, url });
      else await navigator.clipboard?.writeText(url);
    } catch { /* user cancelled */ }
    setMoreOpen(false);
  };
  const downloadEpisode = () => {
    const a = document.createElement('a');
    a.href = episode.videoUrl; a.target = '_blank'; a.rel = 'noopener'; a.download = `${drama.id}-episode-${episode.number}.mp4`; a.click();
    setMoreOpen(false);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(100);
    setCurrentTime(duration);
    setEpisodeFinished(true);
    setControlsVisible(true);
    saveProgress(duration || 0);
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
    setCountdown(null);
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
    <div className="grain min-h-[100dvh] bg-[#0d0d13] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col lg:flex-row">
        <section ref={playerRef} className="relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden bg-black lg:min-h-[100dvh]" data-testid="player-surface">
          {/* 9:16 dikey sahne: mobilde tam ekran, desktop'ta ortalanmış dikey çerçeve */}
          <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-black">
            <div
              ref={frameRef}
              className={`veyra-stage relative overflow-hidden bg-black ${isFullscreen ? 'veyra-stage-immersive' : ''}`}
              onClick={handleSurfaceClick}
              onPointerMove={(event) => {
                if (event.pointerType === 'mouse' && playing) pokeControls();
              }}
            >
              <video
                key={`${drama.id}-${episode.number}`}
                ref={videoRef}
                className="absolute inset-0 h-full w-full bg-[#09090d] object-cover"
                src={episode.videoUrl}
                poster={drama.image}
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => {
                  setPlaying(true);
                  setEpisodeFinished(false);
                }}
                onPause={() => {
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
                    <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-white/50">Loading episode</span>
                  </div>
                </div>
              )}

              {/* hata durumu */}
              {loadError && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-[#0d0d13]/88 px-6 backdrop-blur-sm">
                  <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111118]/92 p-6 text-center shadow-2xl" data-testid="player-error-card">
                    <AlertTriangle size={26} className="mx-auto text-[#ff4fc3]" />
                    <h3 className="mt-3 font-display text-xl">Playback failed</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">{loadError}</p>
                    <div className="mt-5 flex items-center justify-center gap-2">
                      <button type="button" onClick={handleRetry} className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4fc3] px-4 py-2 text-xs font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]" data-testid="button-player-retry">
                        <RotateCw size={13} /> Try again
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
                  <div className="min-w-0 px-3 text-center">
                    <p className="truncate font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/50">{drama.title}</p>
                    <p className="mt-1 truncate text-xs text-white/85">Episode {episode.number} <span className="text-white/30">·</span> {episode.title}</p>
                  </div>
                  <div className="relative"><button type="button" onClick={(e)=>{e.stopPropagation(); setMoreOpen((v)=>!v); pokeControls();}} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/25 text-white/75 transition-colors hover:border-white/50" aria-label="More options" data-testid="button-player-more"><MoreHorizontal size={17} /></button>{moreOpen && <div data-player-ui className="absolute right-0 top-11 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#111118]/95 p-1 shadow-2xl backdrop-blur-xl"><button type="button" onClick={shareEpisode} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"><Share2 size={14}/> Share</button><button type="button" onClick={downloadEpisode} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"><Download size={14}/> Download</button><button type="button" onClick={() => { setMoreOpen(false); pokeControls(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]">Subtitles <span className="ml-auto text-white/35">EN</span></button><button type="button" onClick={() => { setMoreOpen(false); pokeControls(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]">Quality <span className="ml-auto text-white/35">Auto</span></button><button type="button" onClick={cycleSpeed} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/[.06]"><span className="flex items-center gap-3"><Zap size={14}/> Speed</span><span className="text-white/45">{playbackRate}x</span></button></div>}</div>
                </div>
              </div>

              {/* bölüm bitti kartı — videonun üzerinde modern overlay */}
              {episodeFinished && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-black/62 px-5 backdrop-blur-[3px]" data-testid="player-complete-card">
                  <div className="w-full max-w-[21rem] overflow-hidden rounded-3xl border border-white/12 bg-[#111118]/94 shadow-2xl">
                    <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(13,13,19,.15), rgba(17,17,24,.92)), url("${drama.image}")` }}>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#ff4fc3]">{nextEpisode ? 'Up next' : 'Season complete'}</p>
                        <p className="mt-1 font-display text-lg leading-tight">{nextEpisode ? nextEpisode.title : drama.title}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      {nextEpisode ? (
                        <>
                          <p className="text-center text-[11px] text-white/55">
                            Next episode starts in <span className="font-mono-ui text-[#ff4fc3]">{countdown ?? NEXT_EPISODE_COUNTDOWN}s</span>
                          </p>
                          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[#ff4fc3] transition-all duration-1000 ease-linear" style={{ width: `${((countdown ?? 0) / NEXT_EPISODE_COUNTDOWN) * 100}%` }} />
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <Link href={`/watch/${drama.id}/${nextEpisode.number}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-[#ff4fc3] px-4 py-2.5 text-xs font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]" data-testid="link-player-next-complete">
                              Play next <ChevronRight size={13} />
                            </Link>
                            <button type="button" onClick={handleReplay} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white" aria-label="Replay episode"><RotateCw size={14} /></button>
                            <button type="button" onClick={() => setEpisodeFinished(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white" aria-label="Stay on this episode"><Pause size={14} /></button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={handleReplay} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#ff4fc3] px-4 py-2.5 text-xs font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]"><RotateCw size={13} /> Replay</button>
                          <Link href={`/drama/${drama.id}`} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-xs text-white/75 transition-colors hover:border-white/40 hover:text-white">Back to story</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* alt bölge: altyazı (güvenli alan) + açılır kontroller + bölüm bilgisi */}
              <div className={`veyra-safe-bottom absolute inset-x-0 bottom-0 z-30 transition-opacity duration-200 ${isFullscreen && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg leading-tight sm:text-xl">{episode.title}</p>
                      <p className="mt-1 line-clamp-2 max-w-[430px] text-[11px] leading-relaxed text-white/55">{episode.synopsis}</p>
                    </div>
                    <span className="shrink-0 font-mono-ui text-[10px] text-white/35">{episode.number} / {drama.episodeCount}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    {previousEpisode ? <Link href={`/watch/${drama.id}/${previousEpisode.number}`} className="text-white/45 transition-colors hover:text-white" data-testid="link-player-previous-mobile">Previous episode</Link> : <span className="text-white/15">First episode</span>}
                    {nextEpisode ? <Link href={`/watch/${drama.id}/${nextEpisode.number}`} className="inline-flex items-center gap-1 rounded-full bg-[#ff4fc3] px-4 py-2 font-semibold text-[#171720] transition-colors hover:bg-[#ff8bdd]" data-testid="link-player-next-mobile">Next Episode <ChevronRight size={13} /></Link> : <span className="text-white/35">{episodeFinished ? 'End of story' : 'Continue watching'}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* desktop meta — dikey çerçevenin altında (mobilde overlay zaten gösteriyor) */}
          <div className="hidden shrink-0 border-t border-white/[.06] bg-[#0d0d13] px-8 py-5 lg:block">
            <p className="max-w-[560px] font-display text-2xl leading-[.95]">{episode.title}</p>
            <p className="mt-2 max-w-[540px] text-xs leading-relaxed text-white/55">{episode.synopsis}</p>
          </div>
        </section>
        <aside className="w-full border-t border-white/[.08] bg-[#111118] lg:w-[350px] lg:border-l lg:border-t-0">
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
              {previousEpisode ? <Link href={`/watch/${drama.id}/${previousEpisode.number}`} className="text-white/45 hover:text-white" data-testid="link-player-previous">Previous</Link> : <span className="text-white/15">Previous</span>}
              {nextEpisode ? <Link href={`/watch/${drama.id}/${nextEpisode.number}`} className="inline-flex items-center gap-1 text-[#ff4fc3] hover:text-white" data-testid="link-player-next">Next episode <ChevronRight size={13} /></Link> : <span className="text-white/15">End of story</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


function WalletPage() {
  const [balance, setBalance] = useState<number>(() => Number(localStorage.getItem('veyra:coins') ?? 0));
  useEffect(() => { const h=()=>setBalance(Number(localStorage.getItem('veyra:coins') ?? 0)); window.addEventListener('veyra:coins',h); return()=>window.removeEventListener('veyra:coins',h); }, []);
  const packs = [['700','+35','$4.99'],['1,200','+200','$8.99'],['2,500','+500','$17.99'],['5,000','+1,250','$32.99']];
  return <div className="animate-rise">
    <div className="mb-8"><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">Your wallet</p><h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-white sm:text-[4rem]">Coins<span className="text-[#ff4fc3]">.</span></h1><p className="mt-3 text-sm text-white/45">Unlock more episodes and keep watching without interruption.</p></div>
    <div className="rounded-[1.5rem] border border-white/[.08] bg-gradient-to-br from-[#ff4fc3]/20 via-[#9f7cff]/10 to-transparent p-6">
      <p className="text-[10px] uppercase tracking-[.2em] text-white/45">Current balance</p><div className="mt-2 flex items-center gap-2 font-display text-4xl text-white"><Coins size={30} className="text-[#ff4fc3]"/>{balance}</div>
    </div>
    <div className="mt-8"><SectionHeader eyebrow="Top up" title="Coin packs" href="/wallet"/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{packs.map(([coins,bonus,price])=><button key={coins} type="button" className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5 text-left transition hover:border-[#ff4fc3]/40"><div className="flex items-center gap-2"><Coins size={16} className="text-[#ff4fc3]"/><span className="font-display text-2xl">{coins}</span></div><p className="mt-1 text-xs text-[#70d59b]">Bonus {bonus}</p><div className="mt-5 flex items-center justify-between"><span className="text-xs text-white/40">One-time</span><span className="rounded-full bg-[#ff4fc3] px-3 py-1.5 text-[11px] font-bold text-black">{price}</span></div></button>)}</div></div>
    <div className="mt-8 grid gap-3 sm:grid-cols-3">{[['Transaction history','Your coin purchases and bonuses'],['Opened episodes','See what you have unlocked'],['Membership rewards','VIP and daily reward history']].map(([t,c])=><div key={t} className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5"><p className="font-semibold text-white/90">{t}</p><p className="mt-2 text-xs leading-relaxed text-white/35">{c}</p></div>)}</div>
  </div>;
}

function VipPage() {
  const plans=[['Weekly','$4.99','Flexible'],['Monthly','$12.99','Most popular'],['Yearly','$49.99','Best value']];
  return <div className="animate-rise">
    <div className="mb-8 text-center"><Sparkles className="mx-auto text-[#ff4fc3]" size={22}/><p className="mt-3 font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA VIP</p><h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-white sm:text-[4rem]">Unlock every story<span className="text-[#ff4fc3]">.</span></h1><p className="mx-auto mt-4 max-w-lg text-sm text-white/45">Ad-free viewing, 1080p quality, daily rewards and automatic episode unlocks.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{plans.map(([name,price,label],i)=><div key={name} className={`rounded-[1.5rem] border p-6 ${i===1?'border-[#ff4fc3]/70 bg-[#ff4fc3]/[.06]':'border-white/[.08] bg-white/[.025]'}`}><span className="rounded-full bg-white/[.06] px-2.5 py-1 text-[9px] uppercase tracking-[.12em] text-white/45">{label}</span><h2 className="mt-5 font-display text-xl">{name}</h2><p className="mt-2 font-display text-3xl">{price}</p><ul className="mt-6 space-y-3 text-xs text-white/65">{['Unlimited episodes','No ads','1080p quality','Daily VIP reward','Auto-unlock next episode'].map(x=><li key={x} className="flex items-center gap-2"><Check size={14} className="text-[#70d59b]"/>{x}</li>)}</ul><button type="button" className="mt-7 w-full rounded-full bg-[#ff4fc3] px-4 py-3 text-xs font-bold text-black">Continue</button></div>)}</div>
  </div>;
}

function LanguagePage(){ const langs=['English','Türkçe','Español','Português','Français','Deutsch','हिन्दी','Bahasa Indonesia']; return <SimpleSettingsPage title="Language" icon={<Languages size={18}/>}>{<div className="grid grid-cols-2 gap-2">{langs.map(x=><button key={x} type="button" className={`rounded-xl border p-3 text-left text-xs ${x==='English'?'border-[#ff4fc3] bg-[#ff4fc3]/10 text-white':'border-white/[.08] bg-white/[.02] text-white/65'}`}>{x}</button>)}</div>}</SimpleSettingsPage>; }
function NotificationsPage(){ return <SimpleSettingsPage title="Notifications" icon={<Bell size={18}/>}>{<div className="space-y-2">{['New episode alerts','Daily reward reminder','Personalized recommendations','VIP offers'].map(x=><div key={x} className="flex items-center justify-between rounded-xl border border-white/[.08] p-4"><span className="text-sm">{x}</span><span className="rounded-full bg-[#ff4fc3]/15 px-3 py-1 text-[10px] font-semibold text-[#ff4fc3]">ON</span></div>)}</div>}</SimpleSettingsPage>; }
function SettingsPage(){ return <SimpleSettingsPage title="Settings" icon={<Settings size={18}/>}>{<div className="space-y-2"><Link href="/settings/language" className="block rounded-xl border border-white/[.08] p-4 text-sm">Language</Link><Link href="/settings/notifications" className="block rounded-xl border border-white/[.08] p-4 text-sm">Notifications</Link><Link href="/privacy" className="block rounded-xl border border-white/[.08] p-4 text-sm">Privacy Policy</Link><Link href="/terms" className="block rounded-xl border border-white/[.08] p-4 text-sm">Terms of Service</Link><Link href="/feedback" className="block rounded-xl border border-white/[.08] p-4 text-sm">Feedback</Link></div>}</SimpleSettingsPage>; }
function SimpleSettingsPage({title,icon,children}:{title:string;icon:ReactNode;children:ReactNode}){ return <div className="animate-rise max-w-2xl"><Link href="/profile" className="inline-flex items-center gap-2 text-xs text-white/45"><ArrowLeft size={14}/> Back to Profile</Link><div className="mt-7 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff4fc3]/12 text-[#ff4fc3]">{icon}</div><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#ff4fc3]">VEYRA</p><h1 className="mt-1 font-display text-3xl">{title}</h1></div></div><div className="mt-7 rounded-2xl border border-white/[.08] bg-white/[.02] p-5">{children}</div></div>; }
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
         <Route path="/discover" component={() => <PageFrame><DiscoverPage /></PageFrame>} />
        <Route path="/saved" component={() => <PageFrame><SavedPage /></PageFrame>} />
         <Route path="/following" component={() => <PageFrame><FollowingPage /></PageFrame>} />
         <Route path="/rewards" component={() => <PageFrame><RewardsPage /></PageFrame>} />
         <Route path="/wallet" component={() => <PageFrame><WalletPage /></PageFrame>} />
         <Route path="/vip" component={() => <PageFrame><VipPage /></PageFrame>} />
         <Route path="/profile" component={() => <PageFrame><ProfilePage /></PageFrame>} />
         <Route path="/settings" component={() => <PageFrame><SettingsPage /></PageFrame>} />
         <Route path="/settings/language" component={() => <PageFrame><LanguagePage /></PageFrame>} />
         <Route path="/settings/notifications" component={() => <PageFrame><NotificationsPage /></PageFrame>} />
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
  const [savedIds, setSavedIds] = useState<string[]>(['after-midnight']);
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/me/list', { credentials: 'include' }).then((response) => response.ok ? response.json() : []).then((items: Array<{ slug?: string }>) => {
      const remoteIds = items.map((item) => item.slug).filter((slug): slug is string => Boolean(slug));
      if (remoteIds.length) setSavedIds(remoteIds);
    }).catch(() => undefined);
  }, [isSignedIn]);
  const value = useMemo<AppContextValue>(() => ({
    savedIds,
    toggleSaved: (id) => {
      const saving = !savedIds.includes(id);
      setSavedIds((current) => saving ? [...current, id] : current.filter((entry) => entry !== id));
      if (isSignedIn) {
        const method = saving ? 'POST' : 'DELETE';
        void fetch(saving ? '/api/me/list' : `/api/me/list/${encodeURIComponent(id)}`, { method, credentials: 'include', headers: saving ? { 'Content-Type': 'application/json' } : undefined, body: saving ? JSON.stringify({ seriesId: id }) : undefined });
      }
    },
    isSaved: (id) => savedIds.includes(id),
  }), [isSignedIn, savedIds]);
  return <QueryClientProvider client={queryClient}><TooltipProvider><AppContext.Provider value={value}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRouter /></WouterRouter></AppContext.Provider><Toaster /></TooltipProvider></QueryClientProvider>;
}

function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
  return <ClerkProvider publishableKey={publishableKey}><AuthenticatedApp /></ClerkProvider>;
}

export default App;