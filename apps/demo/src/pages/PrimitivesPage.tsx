import { useState } from 'react';
import {
  Button,
  Input,
  SimpleSelect,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  SimpleRadioGroup,
  Switch,
  Textarea,
  Badge,
  SimpleDialog,
  Label,
} from '@gen-office/primitives';
import { Box } from 'lucide-react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import styles from './PrimitivesPage.module.css';

function PrimitivesPage() {
  const [inputValue, setInputValue] = useState('');
  const [checked, setChecked] = useState<CheckedState>(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <Box size={40} />
        </div>
        <div>
          <h1>Primitives Components</h1>
          <p className={styles.subtitle}>
            Core UI components built on Radix UI with full accessibility support
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Buttons */}
        <section className={styles.section}>
          <h2>Buttons</h2>
          <p className={styles.sectionDescription}>
            Interactive buttons with multiple variants, sizes, and states
          </p>
          
          <div className={styles.demoGroup}>
            <h3>Variants</h3>
            <div className={styles.componentRow}>
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <div className={styles.demoGroup}>
            <h3>Sizes</h3>
            <div className={styles.componentRow}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className={styles.demoGroup}>
            <h3>States</h3>
            <div className={styles.componentRow}>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className={styles.section}>
          <h2>Input</h2>
          <p className={styles.sectionDescription}>
            Text input fields with error states and helper text
          </p>
          
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <Label htmlFor="input-basic">Basic Input</Label>
              <Input
                id="input-basic"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            
            <div className={styles.formField}>
              <Label htmlFor="input-error">Input with Error</Label>
              <Input
                id="input-error"
                placeholder="Error state"
                error
                helperText="This field is required"
              />
            </div>
            
            <div className={styles.formField}>
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input
                id="input-disabled"
                placeholder="Disabled"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Select */}
        <section className={styles.section}>
          <h2>Select</h2>
          <p className={styles.sectionDescription}>
            Dropdown selection with searchable options
          </p>
          
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <Label htmlFor="select-basic">Select Component</Label>
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger id="select-basic">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                  <SelectItem value="option4">Option 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formField}>
              <Label htmlFor="select-simple">Simple Select</Label>
              <SimpleSelect
                id="select-simple"
                placeholder="Choose..."
                options={[
                  { value: 'red', label: 'Red' },
                  { value: 'green', label: 'Green' },
                  { value: 'blue', label: 'Blue' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Checkbox & Radio */}
        <section className={styles.section}>
          <h2>Checkbox & Radio</h2>
          <p className={styles.sectionDescription}>
            Selection controls for single and multiple choices
          </p>
          
          <div className={styles.demoGrid}>
            <div className={styles.demoGroup}>
              <h3>Checkbox</h3>
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <Checkbox
                    id="checkbox-1"
                    checked={checked}
                    onCheckedChange={setChecked}
                  />
                  <Label htmlFor="checkbox-1">Accept terms and conditions</Label>
                </div>
                <div className={styles.checkboxItem}>
                  <Checkbox id="checkbox-2" />
                  <Label htmlFor="checkbox-2">Subscribe to newsletter</Label>
                </div>
                <div className={styles.checkboxItem}>
                  <Checkbox id="checkbox-3" disabled />
                  <Label htmlFor="checkbox-3">Disabled option</Label>
                </div>
              </div>
            </div>

            <div className={styles.demoGroup}>
              <h3>Radio Group</h3>
              <SimpleRadioGroup
                name="notification"
                options={[
                  { value: 'all', label: 'All notifications' },
                  { value: 'important', label: 'Important only' },
                  { value: 'none', label: 'None' },
                ]}
                defaultValue="all"
              />
            </div>
          </div>
        </section>

        {/* Switch */}
        <section className={styles.section}>
          <h2>Switch</h2>
          <p className={styles.sectionDescription}>
            Toggle switch for binary settings
          </p>
          
          <div className={styles.switchGroup}>
            <div className={styles.switchItem}>
              <div>
                <Label htmlFor="switch-1">Enable notifications</Label>
                <p className={styles.switchDescription}>
                  Receive push notifications for new messages
                </p>
              </div>
              <Switch
                id="switch-1"
                checked={switchOn}
                onCheckedChange={setSwitchOn}
              />
            </div>
            
            <div className={styles.switchItem}>
              <div>
                <Label htmlFor="switch-2">Dark mode</Label>
                <p className={styles.switchDescription}>
                  Enable dark theme across the application
                </p>
              </div>
              <Switch id="switch-2" />
            </div>
            
            <div className={styles.switchItem}>
              <div>
                <Label htmlFor="switch-3">Disabled switch</Label>
                <p className={styles.switchDescription}>
                  This option is not available
                </p>
              </div>
              <Switch id="switch-3" disabled />
            </div>
          </div>
        </section>

        {/* Textarea */}
        <section className={styles.section}>
          <h2>Textarea</h2>
          <p className={styles.sectionDescription}>
            Multi-line text input for longer content
          </p>
          
          <div className={styles.formField}>
            <Label htmlFor="textarea">Description</Label>
            <Textarea
              id="textarea"
              placeholder="Enter a description..."
              rows={5}
            />
          </div>
        </section>

        {/* Badges */}
        <section className={styles.section}>
          <h2>Badges</h2>
          <p className={styles.sectionDescription}>
            Small status indicators and labels
          </p>
          
          <div className={styles.badgeGroup}>
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Dialog */}
        <section className={styles.section}>
          <h2>Dialog</h2>
          <p className={styles.sectionDescription}>
            Modal dialogs for important interactions
          </p>
          
          <Button onClick={() => setDialogOpen(true)}>
            Open Dialog
          </Button>

          <SimpleDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Dialog Title"
            description="This is a dialog description. It provides additional context about the action."
          >
            <div className={styles.dialogContent}>
              <p>This is the dialog content. You can put any React components here.</p>
              <div className={styles.dialogActions}>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    console.log('Confirmed');
                    setDialogOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </SimpleDialog>
        </section>

        {/* Info Section */}
        <section className={styles.infoSection}>
          <h2>Component Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>♿ Accessible</h3>
              <p>Built on Radix UI with full ARIA support and keyboard navigation</p>
            </div>
            <div className={styles.featureCard}>
              <h3>🎨 Themeable</h3>
              <p>Fully customizable with CSS variables and dark mode support</p>
            </div>
            <div className={styles.featureCard}>
              <h3>📦 TypeScript</h3>
              <p>Complete type definitions for better developer experience</p>
            </div>
            <div className={styles.featureCard}>
              <h3>🔧 Flexible</h3>
              <p>Supports both controlled and uncontrolled patterns</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrimitivesPage;