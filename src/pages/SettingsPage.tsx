import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button.tsx'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { ErrorBanner } from '../components/ErrorBanner.tsx'
import { Field } from '../components/Field.tsx'
import { useCairn } from '../store/CairnProvider.tsx'

export function SettingsPage() {
  const { state, saveSettings, exportJson, importJson, resetAll } = useCairn()
  const mergeInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [pendingReplace, setPendingReplace] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0)
  const [message, setMessage] = useState<string | null>(null)
  const archived = state.missions.filter((mission) => mission.status === 'archived')

  function downloadExport() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cairn-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File | undefined, mode: 'merge' | 'replace') {
    if (!file) return
    setImportError(null)
    try {
      const raw = await file.text()
      await importJson(raw, mode)
      setMessage(mode === 'replace' ? 'Imported and replaced.' : 'Imported and merged.')
    } catch {
      setImportError('That file could not be imported. Use a Cairn export JSON file.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-4xl">Settings</h1>
        <p className="mt-3 text-[var(--muted)]">
          This site keeps one shared cairn. Any device that opens this link sees the same stones,
          with a local copy saved in the browser.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Appearance</h2>
        <Field label="Theme">
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'evening'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => void saveSettings({ theme })}
                className={`rounded-2xl border px-4 py-3 capitalize ${
                  state.settings.theme === theme
                    ? 'border-[var(--ink)] bg-[var(--surface-strong)]'
                    : 'border-[var(--line)] bg-[var(--surface)]'
                }`}
              >
                {theme === 'light' ? 'Daylight' : 'Evening'}
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.settings.reducedMotion}
            onChange={(event) => void saveSettings({ reducedMotion: event.target.checked })}
          />
          <span>Reduce motion</span>
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Your data</h2>
        <input
          ref={mergeInputRef}
          type="file"
          accept="application/json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void handleImport(file, 'merge')
          }}
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept="application/json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void handleImport(file, 'replace')
          }}
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={downloadExport}>
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => mergeInputRef.current?.click()}>
            Import and merge
          </Button>
          <Button variant="secondary" onClick={() => setPendingReplace(true)}>
            Import and replace
          </Button>
        </div>
        {importError ? <ErrorBanner message={importError} /> : null}
        {message ? <p className="text-sm text-[var(--moss)]">{message}</p> : null}
      </section>

      {archived.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl">Archived</h2>
          <ul className="mt-3 space-y-2">
            {archived.map((mission) => (
              <li key={mission.id}>
                <Link to={`/missions/${mission.id}`}>{mission.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-2xl">Reset</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Removes every mission and stone from this site.
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => setResetStep(1)}>
            Reset all data
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={pendingReplace}
        title="Replace all data?"
        description="This will replace every mission and stone currently on this site with the file you choose."
        confirmLabel="Choose file"
        danger
        onClose={() => setPendingReplace(false)}
        onConfirm={() => {
          setPendingReplace(false)
          replaceInputRef.current?.click()
        }}
      />

      <ConfirmDialog
        open={resetStep === 1}
        title="Reset this cairn?"
        description="Every mission and stone will be removed from this site and this browser."
        confirmLabel="Continue"
        danger
        onClose={() => setResetStep(0)}
        onConfirm={() => setResetStep(2)}
      />
      <ConfirmDialog
        open={resetStep === 2}
        title="This cannot be undone"
        description="Export first if you might want these stones later."
        confirmLabel="Reset everything"
        danger
        onClose={() => setResetStep(0)}
        onConfirm={() => {
          setResetStep(0)
          void resetAll()
          setMessage('Everything has been reset.')
        }}
      />
    </div>
  )
}
