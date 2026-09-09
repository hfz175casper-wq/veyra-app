import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CirclePlay,
  Clock3,
  Home as HomeIcon,
  Library,
  Maximize2,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Sparkles,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
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

const createEpisodes = (titles: string[], runtimes: string[], synopses: string[]): Episode[] =>
  titles.map((title, index) => ({
    number: index + 1,
    title,
    runtime: runtimes[index] ?? '08:10',
    released: index === 0 ? 'Today' : `${index}d ago`,
    synopsis: synopses[index] ?? 'A small decision turns the night in an unexpected direction.',
  }));

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
    accent: '#f47e68',
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
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-[#f47e68] text-[#171720] shadow-[0_0_24px_rgba(244,126,104,.22)]">
        <span className="font-display text-[17px] font-bold tracking-[-.12em]">V</span>
        <span className="absolute bottom-[6px] h-[2px] w-3 rounded-full bg-[#171720]/70" />
      </span>
      <span className="font-display text-[19px] font-bold tracking-[.16em] text-[#f7f1e8] transition-colors group-hover:text-[#f47e68]">VEYRA</span>
    </Link>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-[100dvh] bg-[#111118]">
      <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#111118]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/" className="text-[13px] text-white/60 transition-colors hover:text-white" data-testid="link-home-nav">Home</Link>
            <Link href="/search" className="text-[13px] text-white/60 transition-colors hover:text-white" data-testid="link-search-nav">Search</Link>
            <Link href="/saved" className="text-[13px] text-white/60 transition-colors hover:text-white" data-testid="link-saved-nav">My List</Link>
          </nav>
          <Link href="/search" aria-label="Search dramas" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/65 transition-all hover:border-[#f47e68]/50 hover:text-[#f47e68]" data-testid="link-search-button">
            <Search size={16} strokeWidth={2} />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1180px] px-5 pb-28 pt-7 md:px-8 md:pb-12 md:pt-10">{children}</main>
      <nav className="glass fixed inset-x-4 bottom-4 z-40 flex h-[3.9rem] items-center justify-around rounded-2xl md:hidden">
        <MobileNavLink href="/" icon={<HomeIcon size={18} />} label="Home" />
        <MobileNavLink href="/search" icon={<Search size={18} />} label="Search" />
        <MobileNavLink href="/saved" icon={<Library size={18} />} label="My List" />
      </nav>
    </div>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="flex min-w-[4rem] flex-col items-center gap-0.5 text-[10px] text-white/45 transition-colors hover:text-[#f47e68]" data-testid={`link-mobile-${label.toLowerCase().replace(' ', '-')}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, href = '/search' }: { eyebrow?: string; title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {eyebrow && <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#f47e68]">{eyebrow}</p>}
        <h2 className="mt-1 font-display text-[1.65rem] leading-none tracking-[-.035em] text-[#f7f1e8]">{title}</h2>
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
        className={`absolute right-1 top-2 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-all ${saved ? 'border-[#f47e68]/50 bg-[#f47e68] text-[#171720]' : 'border-white/20 bg-[#111118]/45 text-white/75 hover:border-white/60 hover:text-white'}`}
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
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#f47e68]/10 blur-3xl" />
        <div className="relative flex min-h-[455px] max-w-[570px] flex-col justify-end p-6 pb-7 md:min-h-[510px] md:p-10 md:pb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#f47e68] px-2.5 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[.14em] text-[#15151f]">Featured tonight</span>
            <span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-white/50">8 episodes · 1h 12m</span>
          </div>
          <h1 className="max-w-[500px] font-display text-[3.25rem] leading-[.88] tracking-[-.065em] text-[#fcf4e8] sm:text-[4.4rem]">The Last<br />Voicemail</h1>
          <p className="mt-5 max-w-[430px] text-sm leading-relaxed text-white/62 md:text-[15px]">{featured.description}</p>
          <div className="mt-7 flex items-center gap-3">
            <Link href="/watch/the-last-voicemail/1" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f47e68] px-5 text-sm font-semibold text-[#171720] transition-all hover:bg-[#ff987f] hover:shadow-[0_10px_30px_rgba(244,126,104,.2)]" data-testid="link-featured-play">
              <Play size={15} fill="currentColor" /> Start watching
            </Link>
            <button type="button" onClick={() => toggleSaved(featured.id)} className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-all ${saved ? 'border-[#f47e68]/60 bg-[#f47e68]/15 text-[#f47e68]' : 'border-white/15 bg-white/[.06] text-white/80 hover:border-white/35'}`} data-testid="button-featured-save">
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? 'In My List' : 'My List'}
            </button>
          </div>
        </div>
        <div className="absolute right-7 top-7 hidden items-center gap-2 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f47e68]" />
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
            <Sparkles size={18} className="text-[#e7b769]" />
             <p className="mt-8 max-w-[230px] font-display text-2xl leading-[.98] text-[#edf3ef]">Short stories.<br />Deep impact.</p>
            <p className="mt-4 max-w-[240px] text-xs leading-relaxed text-white/45">A global slate of short stories, mini-series, and AI-generated films to carry with you.</p>
            <Link href="/search" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-[#e7b769] hover:text-white" data-testid="link-explore-all">Explore the collection <ChevronRight size={13} /></Link>
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
      <Play size={15} className="mr-2 text-white/30 transition-colors group-hover:text-[#f47e68]" fill="currentColor" />
    </Link>
  );
}

function DramaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSaved, toggleSaved } = useAppValue();
  const drama = dramas.find((entry) => entry.id === id) ?? dramas[0];
  const saved = isSaved(drama.id);
  return (
    <div className="animate-rise">
      <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white" data-testid="link-detail-back"><ArrowLeft size={15} /> Back to Home</Link>
      <section className="relative overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#1c1b27]">
        <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `linear-gradient(90deg, #1b1b27 3%, rgba(27,27,39,.82) 46%, rgba(27,27,39,.2)), url("${drama.image}")` }} />
        <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[210px_1fr] md:gap-10 md:p-10">
          <Poster drama={drama} className="aspect-[.72] w-[180px] shadow-2xl sm:w-[210px]" />
          <div className="flex flex-col justify-end">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#f47e68]">{drama.eyebrow}</p>
            <h1 className="mt-3 max-w-[560px] font-display text-[3rem] leading-[.88] tracking-[-.06em] text-[#fbf3e8] sm:text-[4.7rem]">{drama.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
              <span className="rounded bg-white/10 px-2 py-1 text-white/75">{drama.rating}</span>
              <span>{drama.year}</span><span className="text-white/20">•</span><span>{drama.episodeCount} episodes</span>
              {drama.genre.map((item) => <span key={item} className="rounded-full border border-white/10 px-2 py-1">{item}</span>)}
            </div>
            <p className="mt-5 max-w-[590px] text-sm leading-relaxed text-white/65">{drama.description}</p>
            <div className="mt-7 flex gap-3">
              <Link href={`/watch/${drama.id}/1`} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f47e68] px-5 text-sm font-semibold text-[#171720] transition-all hover:bg-[#ff987f]" data-testid="link-detail-play"><Play size={15} fill="currentColor" /> Play episode 1</Link>
              <button type="button" onClick={() => toggleSaved(drama.id)} className={`grid h-11 w-11 place-items-center rounded-full border transition-all ${saved ? 'border-[#f47e68]/60 bg-[#f47e68]/15 text-[#f47e68]' : 'border-white/15 bg-white/[.05] text-white/75 hover:border-white/40'}`} aria-label={saved ? 'Remove from My List' : 'Save to My List'} data-testid="button-detail-save">{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#f47e68]">Watch in order</p><h2 className="mt-1 font-display text-2xl text-white">Episodes</h2></div>
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
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#f47e68] text-[#171720]"><Play size={12} fill="currentColor" /></span></span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-[16px] text-white/85 group-hover:text-white">{episode.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-white/40">{episode.synopsis}</p>
      </div>
      <div className="hidden items-center gap-1 text-[10px] text-white/35 sm:flex"><Clock3 size={12} /> {episode.runtime}</div>
      <ChevronRight size={15} className="text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-[#f47e68]" />
    </Link>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const genres = ['All', 'Thriller', 'Romance', 'Mystery', 'Drama', 'Sci-fi', 'Noir'];
  const results = useMemo(() => dramas.filter((drama) => {
    const matchesQuery = `${drama.title} ${drama.eyebrow} ${drama.genre.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = activeGenre === 'All' || drama.genre.includes(activeGenre);
    return matchesQuery && matchesGenre;
  }), [activeGenre, query]);
  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#f47e68]">Find your next obsession</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#fbf3e8] sm:text-[4.2rem]">What are you<br />in the mood for?</h1>
      </div>
      <label className="relative block max-w-[650px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, moods, genres..." className="h-14 w-full rounded-2xl border border-white/10 bg-white/[.05] pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#f47e68]/60" data-testid="input-search" />
      </label>
      <div className="scrollbar-none -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {genres.map((genre) => <button key={genre} type="button" onClick={() => setActiveGenre(genre)} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition-all ${activeGenre === genre ? 'border-[#f47e68] bg-[#f47e68] text-[#171720]' : 'border-white/10 bg-white/[.03] text-white/55 hover:border-white/25 hover:text-white'}`} data-testid={`button-genre-${genre.toLowerCase()}`}>{genre}</button>)}
      </div>
      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl text-white">{query || activeGenre !== 'All' ? `${results.length} stories found` : 'The full collection'}</h2><SlidersHorizontal size={16} className="text-white/35" /></div>
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
      <button type="button" onClick={onReset} className="mt-5 text-xs font-semibold text-[#f47e68] hover:text-white" data-testid="button-reset-search">Clear search</button>
    </div>
  );
}

function SavedPage() {
  const { savedIds } = useAppValue();
  const savedDramas = dramas.filter((drama) => savedIds.includes(drama.id));
  return (
    <div className="animate-rise">
      <div className="mb-9">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#f47e68]">Your VEYRA collection</p>
        <h1 className="mt-2 font-display text-[3rem] leading-[.9] tracking-[-.06em] text-[#fbf3e8] sm:text-[4.2rem]">My List<span className="text-[#f47e68]">.</span></h1>
        <p className="mt-4 text-sm text-white/45">{savedDramas.length ? `${savedDramas.length} stories waiting for you` : 'Save something for a later night.'}</p>
      </div>
      {savedDramas.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{savedDramas.map((drama) => <DramaCard drama={drama} key={drama.id} />)}</div> : <EmptySaved />}
    </div>
  );
}

function EmptySaved() {
  return (
    <div className="relative overflow-hidden rounded-[1.4rem] border border-white/[.08] bg-[#181a25] px-6 py-16 text-center">
      <div className="absolute left-1/2 top-[-80px] h-52 w-52 -translate-x-1/2 rounded-full bg-[#f47e68]/10 blur-3xl" />
      <div className="relative">
        <Bookmark size={24} className="mx-auto text-[#f47e68]" />
        <h2 className="mt-5 font-display text-2xl text-white">Nothing saved yet</h2>
        <p className="mx-auto mt-2 max-w-[290px] text-sm leading-relaxed text-white/40">The best stories are the ones you cannot stop thinking about. Keep a few close.</p>
        <Link href="/search" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#f47e68] px-5 text-xs font-semibold text-[#171720]" data-testid="link-empty-browse">Browse dramas <ChevronRight size={14} /></Link>
      </div>
    </div>
  );
}

function WatchPage() {
  const { dramaId, episode: episodeParam } = useParams<{ dramaId: string; episode: string }>();
  const drama = dramas.find((entry) => entry.id === dramaId) ?? dramas[0];
  const selectedNumber = Math.max(1, Number(episodeParam) || 1);
  const episodeIndex = Math.min(selectedNumber - 1, drama.episodes.length - 1);
  const episode = drama.episodes[episodeIndex];
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(34);
  const nextEpisode = drama.episodes[episodeIndex + 1];
  const previousEpisode = drama.episodes[episodeIndex - 1];
  return (
    <div className="grain min-h-[100dvh] bg-[#0d0d13] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col lg:flex-row">
        <section className="relative flex min-h-[min(78dvh,700px)] flex-1 flex-col overflow-hidden bg-[#181622] lg:min-h-[100dvh]">
          <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `linear-gradient(180deg, rgba(13,13,19,.42), rgba(13,13,19,.02) 35%, rgba(13,13,19,.94) 100%), url("${drama.image}")` }} />
          <div className="relative flex items-center justify-between px-5 py-5 sm:px-8">
            <Link href={`/drama/${drama.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 transition-colors hover:border-white/50" aria-label="Back to drama" data-testid="link-player-back"><ArrowLeft size={16} /></Link>
            <div className="text-center"><p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/50">{drama.title}</p><p className="mt-1 text-xs text-white/80">Episode {episode.number} <span className="text-white/30">·</span> {episode.title}</p></div>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 text-white/75 transition-colors hover:border-white/50" aria-label="More options" data-testid="button-player-more"><MoreHorizontal size={17} /></button>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <button type="button" onClick={() => setPlaying(!playing)} className={`grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-[#111118]/35 text-white backdrop-blur-md transition-all hover:scale-105 hover:border-[#f47e68] hover:text-[#f47e68] ${playing ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`} aria-label={playing ? 'Pause episode' : 'Play episode'} data-testid="button-player-toggle">
              {playing ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" className="translate-x-0.5" />}
            </button>
          </div>
          <div className="relative px-5 pb-5 sm:px-8">
            <p className="max-w-[470px] font-display text-2xl leading-[.95] sm:text-3xl">{episode.title}</p>
            <p className="mt-2 max-w-[450px] text-xs leading-relaxed text-white/55">{episode.synopsis}</p>
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause episode' : 'Play episode'} className="text-white" data-testid="button-player-play-bottom">{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
              <input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="h-1 min-w-0 flex-1 accent-[#f47e68]" aria-label="Episode progress" data-testid="input-player-progress" />
              <span className="font-mono-ui text-[10px] text-white/45">{episode.runtime}</span>
              <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute' : 'Mute'} className="text-white/65 hover:text-white" data-testid="button-player-mute">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
              <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Fullscreen" className="hidden text-white/65 hover:text-white sm:block" data-testid="button-player-fullscreen"><Maximize2 size={15} /></button>
            </div>
          </div>
        </section>
        <aside className="w-full border-t border-white/[.08] bg-[#111118] lg:w-[350px] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-white/[.08] px-5 py-5">
            <div><p className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#f47e68]">Now watching</p><h2 className="mt-1 font-display text-xl">{drama.title}</h2></div>
            <span className="font-mono-ui text-[10px] text-white/35">{episode.number} / {drama.episodeCount}</span>
          </div>
          <div className="scrollbar-none max-h-[330px] overflow-y-auto p-3 lg:max-h-[calc(100vh-100px)]">
            {drama.episodes.map((entry) => (
              <Link href={`/watch/${drama.id}/${entry.number}`} key={entry.number} className={`group flex items-center gap-3 rounded-xl p-2.5 transition-colors ${entry.number === episode.number ? 'bg-[#f47e68]/12' : 'hover:bg-white/[.05]'}`} data-testid={`link-player-episode-${entry.number}`}>
                <div className="relative h-12 w-[76px] shrink-0 overflow-hidden rounded-lg bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,10,16,.1), rgba(10,10,16,.7)), url("${drama.image}")` }}>
                  <span className={`absolute inset-0 grid place-items-center ${entry.number === episode.number ? 'text-[#f47e68]' : 'text-white/0 group-hover:text-white'}`}><CirclePlay size={20} /></span>
                </div>
                <div className="min-w-0"><p className={`truncate text-xs font-medium ${entry.number === episode.number ? 'text-[#f47e68]' : 'text-white/75'}`}>{String(entry.number).padStart(2, '0')} <span className="ml-1 text-white/25">·</span> {entry.title}</p><p className="mt-1 text-[10px] text-white/35">{entry.runtime}</p></div>
              </Link>
            ))}
          </div>
          <div className="hidden border-t border-white/[.08] px-5 py-4 lg:block">
            <div className="flex items-center justify-between text-xs">
              {previousEpisode ? <Link href={`/watch/${drama.id}/${previousEpisode.number}`} className="text-white/45 hover:text-white" data-testid="link-player-previous">Previous</Link> : <span className="text-white/15">Previous</span>}
              {nextEpisode ? <Link href={`/watch/${drama.id}/${nextEpisode.number}`} className="inline-flex items-center gap-1 text-[#f47e68] hover:text-white" data-testid="link-player-next">Next episode <ChevronRight size={13} /></Link> : <span className="text-white/15">End of story</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

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
        <Route path="/saved" component={() => <PageFrame><SavedPage /></PageFrame>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  const [savedIds, setSavedIds] = useState<string[]>(['after-midnight']);
  const value = useMemo<AppContextValue>(() => ({
    savedIds,
    toggleSaved: (id) => setSavedIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]),
    isSaved: (id) => savedIds.includes(id),
  }), [savedIds]);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContext.Provider value={value}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRouter />
          </WouterRouter>
        </AppContext.Provider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;