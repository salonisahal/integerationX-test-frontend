import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'

// General application settings. No dedicated settings endpoint was present
// in the inferred backend contract, so this screen only simulates a save
// locally for now — wire it to a real settings API once one is available.
export default function SettingsPage() {
  const [institutionName, setInstitutionName] = useState('Student Management System')
  const [academicYear, setAcademicYear] = useState('2024-2025')
  const [defaultPageSize, setDefaultPageSize] = useState('10')
  const [saving, setSaving] = useState(false)

  function handleSave() {
    setSaving(true)
    // MOCK: no settings endpoint exists in the inferred backend contract
    // yet; this simulates a successful save.
    setTimeout(() => {
      setSaving(false)
      toast.success('Settings saved successfully.')
    }, 500)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Institution-wide configuration." />

      <div className="max-w-2xl rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Institution Name" htmlFor="institutionName">
            <Input id="institutionName" value={institutionName} onChange={(event) => setInstitutionName(event.target.value)} />
          </FormField>

          <FormField label="Academic Year" htmlFor="academicYear">
            <Input id="academicYear" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} />
          </FormField>

          <FormField label="Default Page Size" htmlFor="defaultPageSize">
            <Select id="defaultPageSize" value={defaultPageSize} onChange={(event) => setDefaultPageSize(event.target.value)}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Select>
          </FormField>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
