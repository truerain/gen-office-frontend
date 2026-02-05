import { useMemo, useState } from 'react';
import { Combobox } from '@gen-office/ui';
import styles from './ComboboxDemoPage.module.css';

const options = [
  { value: 'seoul', label: 'Seoul', description: 'South Korea' },
  { value: 'tokyo', label: 'Tokyo', description: 'Japan' },
  { value: 'singapore', label: 'Singapore', description: 'Singapore' },
  { value: 'bangkok', label: 'Bangkok', description: 'Thailand' },
  { value: 'hongkong', label: 'Hong Kong', description: 'China SAR' },
  { value: 'sydney', label: 'Sydney', description: 'Australia' },
  { value: 'losangeles', label: 'Los Angeles', description: 'United States' },
  { value: 'london', label: 'London', description: 'United Kingdom' },
  { value: 'paris', label: 'Paris', description: 'France' },
  { value: 'rome', label: 'Rome', description: 'Italy' },
  { value: 'barcelona', label: 'Barcelona', description: 'Spain', disabled: true },
];

function ComboboxDemoPage() {
  const [basicValue, setBasicValue] = useState<string | undefined>('seoul');
  const [inputValue, setInputValue] = useState('');
  const [controlledValue, setControlledValue] = useState<string | undefined>();
  const [noMatchValue, setNoMatchValue] = useState('');

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === basicValue)?.label ?? 'None';
  }, [basicValue]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Combobox Demo</h1>
        <p>Input + dropdown suggestions with filtering and keyboard navigation.</p>
      </div>

      <section className={styles.section}>
        <h2>Basics</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Default</h3>
            <Combobox
              label="City"
              placeholder="Type to search..."
              options={options}
              value={basicValue}
              onValueChange={(next) => setBasicValue(next)}
              fullWidth
              clearable
              clearLabel="Clear input"
              onClear={() => console.log('cleared')}
            />
            <div className={styles.meta}>Selected: {selectedLabel}</div>
          </div>

          <div className={styles.card}>
            <h3>With Helper + Error</h3>
            <Combobox
              label="Office"
              placeholder="Pick one..."
              options={options}
              helperText="Try typing 'to' or 'pa'."
              error
              fullWidth
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Controlled Input</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Input & Value Controlled</h3>
            <Combobox
              label="Search City"
              placeholder="Type city name"
              options={options}
              inputValue={inputValue}
              onInputValueChange={setInputValue}
              value={controlledValue}
              onValueChange={(next) => setControlledValue(next)}
              fullWidth
            />
            <div className={styles.meta}>Input: {inputValue || 'None'}</div>
            <div className={styles.meta}>
              Value: {controlledValue ?? 'None'}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Custom Filter</h3>
            <Combobox
              label="Starts With"
              placeholder="Type first letter"
              options={options}
              filterOptions={(option, value) =>
                option.label.toLowerCase().startsWith(value.trim().toLowerCase())
              }
              fullWidth
            />
            <div className={styles.meta}>Filter: startsWith</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Edge Cases</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>No Results</h3>
            <Combobox
              label="Empty State"
              placeholder="Type something..."
              options={[]}
              emptyMessage="No matches found"
              value={noMatchValue}
              onValueChange={(next) => setNoMatchValue(next)}
              fullWidth
            />
          </div>

          <div className={styles.card}>
            <h3>Disabled</h3>
            <Combobox
              label="Disabled"
              placeholder="Not available"
              options={options}
              disabled
              fullWidth
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComboboxDemoPage;
