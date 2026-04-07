import { useMemo, useState } from 'react';
import { PopupInput } from '@gen-office/ui';
import type { PopupInputSelection } from '@gen-office/ui';
import styles from './PopupInputDemoPage.module.css';

type Employee = {
  id: string;
  name: string;
  dept: string;
  email: string;
};

const employees: Employee[] = [
  { id: 'E1001', name: 'Olivia Harper', dept: 'Finance', email: 'olivia.harper@corp.local' },
  { id: 'E1002', name: 'Noah Kim', dept: 'Sales', email: 'noah.kim@corp.local' },
  { id: 'E1003', name: 'Emma Park', dept: 'Operations', email: 'emma.park@corp.local' },
  { id: 'E1004', name: 'Liam Choi', dept: 'Engineering', email: 'liam.choi@corp.local' },
  { id: 'E1005', name: 'Ava Lee', dept: 'HR', email: 'ava.lee@corp.local' },
  { id: 'E1006', name: 'Mason Jung', dept: 'Strategy', email: 'mason.jung@corp.local' },
];

function filterEmployees(keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return employees;
  return employees.filter((employee) => {
    return (
      employee.name.toLowerCase().includes(normalized) ||
      employee.id.toLowerCase().includes(normalized) ||
      employee.dept.toLowerCase().includes(normalized)
    );
  });
}

function toSelection(employee: Employee): PopupInputSelection<Employee> {
  return {
    value: employee.id,
    label: `${employee.name} (${employee.id})`,
    data: employee,
  };
}

function PopupInputDemoPage() {
  const [basicSelection, setBasicSelection] = useState<PopupInputSelection<Employee> | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchSelection, setSearchSelection] = useState<PopupInputSelection<Employee> | null>(null);
  const [requiredSelection, setRequiredSelection] = useState<PopupInputSelection<Employee> | null>(null);

  const basicMeta = basicSelection?.data
    ? `${basicSelection.data.name} / ${basicSelection.data.dept}`
    : 'None';

  const searchMeta = searchSelection?.data
    ? `${searchSelection.data.name} / ${searchSelection.data.email}`
    : 'None';

  const filteredByInput = useMemo(() => filterEmployees(searchValue), [searchValue]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>PopupInput Demo</h1>
        <p>Input + popup selection pattern for searching and committing structured values.</p>
      </div>

      <section className={styles.section}>
        <h2>Basic</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>ReadOnly Trigger + Selection</h3>
            <PopupInput<Employee>
              label="Assignee"
              placeholder="Select employee"
              selection={basicSelection}
              onSelectionChange={setBasicSelection}
              onCommitValue={(value, selection) => {
                console.log('[PopupInputDemo] basic committed', { value, selection });
              }}
              fullWidth={true}
              content={({ setSelection, close }) => (
                <div className={styles.popupPanel}>
                  <div className={styles.list}>
                    {employees.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        className={styles.item}
                        onClick={() => {
                          setSelection(toSelection(employee));
                          close();
                        }}
                      >
                        <span className={styles.itemTitle}>{employee.name}</span>
                        <span className={styles.itemMeta}>{employee.id} · {employee.dept}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
            <div className={styles.meta}>Selected: {basicMeta}</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Searchable</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Type to Filter</h3>
            <PopupInput<Employee>
              label="Employee Search"
              placeholder="Type name / id / department"
              readOnly={false}
              openOnInputFocus={true}
              value={searchValue}
              selection={searchSelection}
              onValueChange={setSearchValue}
              onSelectionChange={setSearchSelection}
              helperText="Press Enter or click icon to open."
              fullWidth={true}
              content={({ value, setSelection, close }) => {
                const matched = filterEmployees(value);
                if (matched.length === 0) {
                  return <div className={styles.empty}>No matching employees.</div>;
                }
                return (
                  <div className={styles.popupPanel}>
                    <div className={styles.list}>
                      {matched.map((employee) => (
                        <button
                          key={employee.id}
                          type="button"
                          className={styles.item}
                          onClick={() => {
                            setSelection(toSelection(employee));
                            close();
                          }}
                        >
                          <span className={styles.itemTitle}>{employee.name}</span>
                          <span className={styles.itemMeta}>{employee.id} · {employee.dept}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            <div className={styles.meta}>Input: {searchValue || 'None'}</div>
            <div className={styles.meta}>Committed: {searchMeta}</div>
          </div>

          <div className={styles.card}>
            <h3>Required + Error Style</h3>
            <PopupInput<Employee>
              label="Approver"
              placeholder="Select required approver"
              required={true}
              error={!requiredSelection}
              selection={requiredSelection}
              onSelectionChange={setRequiredSelection}
              helperText={!requiredSelection ? 'Approver is required.' : 'Approver selected.'}
              fullWidth={true}
              content={({ setSelection, close }) => (
                <div className={styles.popupPanel}>
                  <div className={styles.list}>
                    {filteredByInput.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        className={styles.item}
                        onClick={() => {
                          setSelection(toSelection(employee));
                          close();
                        }}
                      >
                        <span className={styles.itemTitle}>{employee.name}</span>
                        <span className={styles.itemMeta}>{employee.id} · {employee.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
            <div className={styles.meta}>
              State: {requiredSelection ? 'Valid' : 'Missing required value'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PopupInputDemoPage;
