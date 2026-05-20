import PageTitle      from '../../components/shared/PageTitle'
import Banner         from './Banner'
import TrendingIdeas  from './TrendingIdeas'
import WhyIdeaVault   from './WhyIdeaVault'
import HowItWorks     from './HowItWorks'

const Home = () => (
  <>
    <PageTitle title="Home – Share & Discover Startup Ideas" />
    <Banner />
    <TrendingIdeas />
    <WhyIdeaVault />
    <HowItWorks />
  </>
)

export default Home