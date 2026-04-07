import { useMemo, useState } from 'react';
import { Combobox, ModalInput, TreeCombobox, type ModalInputSelection } from '@gen-office/ui';
import styles from './ComboboxDemoPage.module.css';

const options = [
  { value: 'seoul', label: 'Seoul' },
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'bangkok', label: 'Bangkok' },
  { value: 'hongkong', label: 'Hong Kong' },
  { value: 'sydney', label: 'Sydney' },
  { value: 'losangeles', label: 'Los Angeles' },
  { value: 'london', label: 'London' },
  { value: 'paris', label: 'Paris' },
  { value: 'rome', label: 'Rome' },
  { value: 'barcelona', label: 'Barcelona', description: 'Spain', disabled: true },
];

const countries = [
  { code: 'ar', value: 'argentina', label: 'Argentina', continent: 'South America' },
  { code: 'au', value: 'australia', label: 'Australia', continent: 'Oceania' },
  { code: 'br', value: 'brazil', label: 'Brazil', continent: 'South America' },
  { code: 'ca', value: 'canada', label: 'Canada', continent: 'North America' },
  { code: 'cn', value: 'china', label: 'China', continent: 'Asia' },
  { code: 'fr', value: 'france', label: 'France', continent: 'Europe' },
  { code: 'de', value: 'germany', label: 'Germany', continent: 'Europe' },
  { code: 'jp', value: 'japan', label: 'Japan', continent: 'Asia' },
  { code: 'kr', value: 'south-korea', label: 'South Korea', continent: 'Asia' },
  { code: 'us', value: 'united-states', label: 'United States', continent: 'North America' },
];

const categoryTreeOptions = [
  { id: 'electronics', value: 'electronics', label: 'Electronics' },
  { id: 'phones', parentId: 'electronics', value: 'phones', label: 'Phones' },
  { id: 'android', parentId: 'phones', value: 'android', label: 'Android', description: 'Google ecosystem' },
  { id: 'ios', parentId: 'phones', value: 'ios', label: 'iOS', description: 'Apple ecosystem' },
  { id: 'laptops', parentId: 'electronics', value: 'laptops', label: 'Laptops' },
  { id: 'gaming-laptop', parentId: 'laptops', value: 'gaming-laptop', label: 'Gaming Laptop' },
  { id: 'ultrabook', parentId: 'laptops', value: 'ultrabook', label: 'Ultrabook', disabled: true },
  { id: 'home', value: 'home', label: 'Home' },
  { id: 'kitchen', parentId: 'home', value: 'kitchen', label: 'Kitchen' },
  { id: 'cookware', parentId: 'kitchen', value: 'cookware', label: 'Cookware' },
  { id: 'appliances', parentId: 'kitchen', value: 'appliances', label: 'Appliances' },
  { id: 'furniture', parentId: 'home', value: 'furniture', label: 'Furniture' },
  { id: 'chair', parentId: 'furniture', value: 'chair', label: 'Chair' },
  { id: 'desk', parentId: 'furniture', value: 'desk', label: 'Desk' },
];

type EmployeeData = {
  empNo: string;
  dept: string;
};

const employeeItems: ModalInputSelection<EmployeeData>[] = [
  {
    value: '1001',
    label: '김하늘',
    description: 'Finance',
    data: { empNo: '1001', dept: 'Finance' },
    keywords: ['finance', 'kim'],
  },
  {
    value: '1002',
    label: '박지수',
    description: 'HR',
    data: { empNo: '1002', dept: 'HR' },
    keywords: ['hr', 'park'],
  },
  {
    value: '1003',
    label: '이도윤',
    description: 'IT',
    data: { empNo: '1003', dept: 'IT' },
    keywords: ['it', 'lee'],
  },
  {
    value: '1004',
    label: '최서연',
    description: 'Sales',
    data: { empNo: '1004', dept: 'Sales' },
    keywords: ['sales', 'choi'],
  },
];

function ComboboxDemoPage() {
  const [basicValue, setBasicValue] = useState<string | undefined>('seoul');
  const [inputValue, setInputValue] = useState('');
  const [controlledValue, setControlledValue] = useState<string | undefined>();
  const [noMatchValue, setNoMatchValue] = useState('');
  const [groupedCountryValue, setGroupedCountryValue] = useState<string | undefined>();
  const [treeValue, setTreeValue] = useState<string | undefined>();
  const [treeControlledValue, setTreeControlledValue] = useState<string | undefined>();
  const [treeExpanded, setTreeExpanded] = useState<(string | number)[]>(['electronics', 'home']);
  const [employeeSelection, setEmployeeSelection] = useState<ModalInputSelection<EmployeeData> | null>(
    null
  );

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === basicValue)?.label ?? 'None';
  }, [basicValue]);

  const groupedCountryLabel = useMemo(() => {
    return countries.find((country) => country.value === groupedCountryValue)?.label ?? 'None';
  }, [groupedCountryValue]);

  const treeLabel = useMemo(() => {
    return categoryTreeOptions.find((option) => option.value === treeValue)?.label ?? 'None';
  }, [treeValue]);

  const treeControlledLabel = useMemo(() => {
    return (
      categoryTreeOptions.find((option) => option.value === treeControlledValue)?.label ?? 'None'
    );
  }, [treeControlledValue]);

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

      <section className={styles.section}>
        <h2>Grouped Options</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Combobox with Group Separator</h3>
            <Combobox
              label="Country"
              placeholder="Type to search..."
              options={countries.map((country) => ({
                value: country.value,
                label: `${country.label} (${country.code})`,
                group: country.continent,
              }))}
              value={groupedCountryValue}
              onValueChange={(next) => setGroupedCountryValue(next)}
              fullWidth
            />
            <div className={styles.meta}>Grouped by continent</div>
            <div className={styles.meta}>Selected: {groupedCountryLabel}</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>ModalInput</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Employee Picker</h3>
            <ModalInput<EmployeeData>
              label="Employee"
              placeholder="Select employee"
              title="Select Employee"
              modalDescription="Search and select an employee from the list."
              searchPlaceholder="Search by name, id, or department"
              items={employeeItems}
              selection={employeeSelection}
              onSelectionChange={setEmployeeSelection}
              listColumns={[
                { key: 'empNo', header: 'ID', width: '96px', render: (item) => item.value },
                { key: 'name', header: 'Name', width: '1.5fr', render: (item) => item.label },
                {
                  key: 'dept',
                  header: 'Department',
                  width: '1fr',
                  render: (item) => item.data?.dept ?? '-',
                },
              ]}
              fullWidth
            />
            <div className={styles.meta}>Selected: {employeeSelection?.label ?? 'None'}</div>
            <div className={styles.meta}>Value: {employeeSelection?.value ?? 'None'}</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>TreeCombobox</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Basic Tree</h3>
            <TreeCombobox
              label="Category"
              placeholder="Search category..."
              options={categoryTreeOptions}
              value={treeValue}
              onValueChange={(next) => setTreeValue(next)}
              defaultExpandedIds={['electronics', 'home']}
              fullWidth
              clearable
            />
            <div className={styles.meta}>Selected: {treeLabel}</div>
          </div>

          <div className={styles.card}>
            <h3>Controlled Expanded</h3>
            <TreeCombobox
              label="Category (Controlled)"
              placeholder="Type to filter..."
              options={categoryTreeOptions}
              value={treeControlledValue}
              onValueChange={(next) => setTreeControlledValue(next)}
              expandedIds={treeExpanded}
              onExpandedIdsChange={setTreeExpanded}
              fullWidth
            />
            <div className={styles.meta}>Selected: {treeControlledLabel}</div>
            <div className={styles.meta}>Expanded: {treeExpanded.join(', ') || 'None'}</div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default ComboboxDemoPage;
