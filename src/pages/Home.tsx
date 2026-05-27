import Hero from '../components/Hero';
import About from '../components/About';
import CoreValues from '../components/CoreValues';
import Process from '../components/Process';
import Portfolio from '../components/Portfolio';
import CustomCare from '../components/CustomCare';
import StayConnected from '../components/StayConnected';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <CoreValues />
      <Process />
      <Portfolio />
      <CustomCare />
      <StayConnected />
    </>
  );
}
