import { useState } from 'react';
import { Slider } from '@gen-office/ui';
import styles from './SliderDemoPage.module.css';

function SliderDemoPage() {
  const [volume, setVolume] = useState([35]);
  const [range, setRange] = useState([20, 75]);
  const [stepValue, setStepValue] = useState([50]);
  const [small, setSmall] = useState([25]);
  const [large, setLarge] = useState([60]);
  const [ocean, setOcean] = useState([45]);
  const [mint, setMint] = useState([30]);
  const [amber, setAmber] = useState([70]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Slider Demo</h1>
        <p>Radix Slider 기반 단일/범위 값을 빠르게 선택하는 컴포넌트</p>
      </div>

      <section className={styles.section}>
        <h2>Basic</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Single Value</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Volume</span>
                <span className={styles.value}>{volume[0]}%</span>
              </div>
              <Slider value={volume} onValueChange={setVolume} />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Range</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Price Range</span>
                <span className={styles.value}>${range[0]} - ${range[1]}</span>
              </div>
              <Slider value={range} onValueChange={setRange} min={0} max={100} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Variants</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Steps</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Step 5</span>
                <span className={styles.value}>{stepValue[0]}</span>
              </div>
              <Slider
                value={stepValue}
                onValueChange={setStepValue}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Sizes</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Small</span>
                <span className={styles.value}>{small[0]}%</span>
              </div>
              <Slider value={small} onValueChange={setSmall} size="sm" />
              <div className={styles.sliderRow}>
                <span>Large</span>
                <span className={styles.value}>{large[0]}%</span>
              </div>
              <Slider value={large} onValueChange={setLarge} size="lg" />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Disabled & Error</h3>
            <div className={styles.sliderStack}>
              <Slider defaultValue={[40]} disabled />
              <Slider defaultValue={[70]} error />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Custom Colors</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Ocean</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Brightness</span>
                <span className={styles.value}>{ocean[0]}%</span>
              </div>
              <Slider
                className={styles.themeOcean}
                value={ocean}
                onValueChange={setOcean}
              />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Mint</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Humidity</span>
                <span className={styles.value}>{mint[0]}%</span>
              </div>
              <Slider
                className={styles.themeMint}
                value={mint}
                onValueChange={setMint}
              />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Amber</h3>
            <div className={styles.sliderStack}>
              <div className={styles.sliderRow}>
                <span>Intensity</span>
                <span className={styles.value}>{amber[0]}%</span>
              </div>
              <Slider
                className={styles.themeAmber}
                value={amber}
                onValueChange={setAmber}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SliderDemoPage;
