import MineralsHero from './MineralsHero.jpg'
import MineralsCategory from './MineralsCategory.jpg'
import Threads from './Threads.jpg'
import Bracelets from './Bracelets.jpg'
import BeadsAgate from './BeadsAgate.jpg'
import BlueAgate from './BlueAgate.jpg'
import Jasper from './Jasper.jpg'
import Amethyst from './Amethyst.jpg'
import QuartzCrystal from './QuartzCrystal.jpg'
import PinkQuartz from './PinkQuartz.jpg'
import Moonstone from './Moonstone.jpg'
import Labradorite from './Labradorite.jpg'
import TigerEye from './TigerEye.jpg'
import Obsidian from './Obsidian.jpg'
import ObsidianRock from './ObsidianRock.jpg'
import WaxThread from './WaxThread.jpg'
import BeigeThread from './BeigeThread.jpg'
import ElasticThread from './ElasticThread.jpg'
import CottonThread from './CottonThread.jpg'
import SilkThread from './SilkThread.jpg'
import WomenBracelet from './WomenBracelet.jpg'
import MenBracelet from './MenBracelet.jpg'
import KidsBracelet from './KidsBracelet.jpg'
import HandmadeBracelet from './HandmadeBracelet.jpg'
import LimitedBracelet from './LimitedBracelet.jpg'
import AboutStore from './AboutStore.jpg'

export const mockImages = {
  mineralsHero: MineralsHero,
  mineralsCategory: MineralsCategory,
  threads: Threads,
  bracelets: Bracelets,
  beadsAgate: BeadsAgate,
  blueAgate: BlueAgate,
  jasper: Jasper,
  amethyst: Amethyst,
  quartzCrystal: QuartzCrystal,
  pinkQuartz: PinkQuartz,
  moonstone: Moonstone,
  labradorite: Labradorite,
  tigerEye: TigerEye,
  obsidian: Obsidian,
  obsidianRock: ObsidianRock,
  waxThread: WaxThread,
  beigeThread: BeigeThread,
  elasticThread: ElasticThread,
  cottonThread: CottonThread,
  silkThread: SilkThread,
  womenBracelet: WomenBracelet,
  menBracelet: MenBracelet,
  kidsBracelet: KidsBracelet,
  handmadeBracelet: HandmadeBracelet,
  limitedBracelet: LimitedBracelet,
  aboutStore: AboutStore,
} as const

export type MockImageKey = keyof typeof mockImages
