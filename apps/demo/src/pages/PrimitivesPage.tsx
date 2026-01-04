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
import '@gen-office/theme/index.css';


function PrimitivesPage() {
  const [inputValue, setInputValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Primitives Components</h1>
        <p className="subtitle">
          Core UI components built on Radix UI with full accessibility support
        </p>
      </div>

      <div className="content">
        {/* Buttons */}
        <section className="section">
          <h2>Buttons</h2>
          <div className="component-group">
            <Button variant="default">디폴트</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="component-group">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="component-group">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="section">
          <h2>Input</h2>
          <div className="component-group-vertical">
            <div className="form-field">
              <Label htmlFor="input-basic">Basic Input</Label>
              <Input
                id="input-basic"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="input-error">Input with Error</Label>
              <Input
                id="input-error"
                placeholder="Error state"
                error
                helperText="This field is required"
              />
            </div>
            <div className="form-field">
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
        <section className="section">
          <h2>Select</h2>
          <div className="component-group-vertical">
            <div className="form-field">
              <Label htmlFor="select-basic">Select an option</Label>
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger id="select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label>Select with Groups</Label>
              <SimpleSelect
                placeholder="Choose..."
                groups={[
                  {
                    label: 'Fruits',
                    options: [
                      { value: 'apple', label: 'Apple' },
                      { value: 'banana', label: 'Banana' },
                    ],
                  },
                  {
                    label: 'Vegetables',
                    options: [
                      { value: 'carrot', label: 'Carrot' },
                      { value: 'potato', label: 'Potato' },
                    ],
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Checkboxes & Radios */}
        <section className="section">
          <h2>Checkbox & Radio</h2>
          <div className="component-group-vertical">
            <div className="form-field">
              <div className="checkbox-group">
                <Checkbox
                  id="checkbox1"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value === true)}
                />
                <Label htmlFor="checkbox1">Accept terms and conditions</Label>
              </div>
            </div>
            <div className="form-field">
              <Label>Choose an option</Label>
               <SimpleRadioGroup
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Switch */}
        <section className="section">
          <h2>Switch</h2>
          <div className="form-field">
            <div className="checkbox-group">
              <Switch
                id="switch1"
                checked={switchOn}
                onCheckedChange={(v) => setSwitchOn(v === true)}
              />
              <Label htmlFor="switch1">
                Enable notifications {switchOn ? '(On)' : '(Off)'}
              </Label>
            </div>
          </div>
        </section>

        {/* Textarea */}
        <section className="section">
          <h2>Textarea</h2>
          <div className="form-field">
            <Label htmlFor="textarea1">Description</Label>
            <Textarea
              id="textarea1"
              placeholder="Enter description..."
              rows={4}
            />
          </div>
        </section>

        {/* Badges */}
        <section className="section">
          <h2>Badge</h2>
          <div className="component-group">
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
        <section className="section">
          <h2>Dialog</h2>
          <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
          <SimpleDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Dialog Title"
            description="This is a dialog description. You can put any content here."
          >
            <div style={{ padding: '1rem 0' }}>
              <p>Dialog content goes here.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            </div>
          </SimpleDialog>
        </section>
      </div>
    </div>
  );
}

export default PrimitivesPage;